from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Dict, List

import joblib
import numpy as np
import torch
import torch.nn as nn

ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = ROOT / "models"


class AutoEncoder(nn.Module):
    def __init__(self, input_dim: int):
        super().__init__()
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
        )
        self.decoder = nn.Sequential(
            nn.Linear(8, 16),
            nn.ReLU(),
            nn.Linear(16, input_dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        z = self.encoder(x)
        return self.decoder(z)


class HumanClassifier(nn.Module):
    def __init__(self, input_dim: int):
        super().__init__()
        self.network = nn.Sequential(
            nn.Linear(input_dim, 32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x).squeeze(-1)


def parse_payload() -> Dict[str, float]:
    raw = sys.stdin.read().strip()
    if not raw:
        return {}
    return json.loads(raw)


def feature_array(payload: Dict[str, float]) -> np.ndarray:
    return np.array(
        [
            float(payload.get("behaviorScore", 0.0)),
            float(payload.get("textScore", 0.0)),
            float(payload.get("crossScore", 0.0)),
            float(payload.get("totalWords", 0.0)),
            float(payload.get("pasteCount", 0.0)),
            float(payload.get("revisionCount", 0.0)),
            float(payload.get("speedVariance", 0.0)),
        ],
        dtype=np.float32,
    ).reshape(1, -1)


def fallback_prediction(payload: Dict[str, float]) -> Dict[str, object]:
    base = (
        float(payload.get("behaviorScore", 0.0)) * 0.4
        + float(payload.get("textScore", 0.0)) * 0.3
        + float(payload.get("crossScore", 0.0)) * 0.3
    )
    human_probability = max(0.0, min(1.0, base / 100.0))

    anomaly = 0.0
    if float(payload.get("pasteCount", 0.0)) > 0:
        anomaly += 0.2
    if float(payload.get("speedVariance", 0.0)) < 3:
        anomaly += 0.2

    return {
        "humanProbability": human_probability,
        "anomalyScore": min(1.0, anomaly),
        "insights": [
            "Fallback heuristic used because trained model artifacts are missing.",
        ],
    }


def predict() -> None:
    payload = parse_payload()

    classifier_pt_path = MODELS_DIR / "human_classifier.pt"
    scaler_path = MODELS_DIR / "feature_scaler.joblib"
    autoencoder_path = MODELS_DIR / "anomaly_autoencoder.pt"
    anomaly_scaler_path = MODELS_DIR / "anomaly_scaler.joblib"

    if not (
        classifier_pt_path.exists()
        and scaler_path.exists()
        and autoencoder_path.exists()
        and anomaly_scaler_path.exists()
    ):
        print(json.dumps(fallback_prediction(payload)))
        return

    vector = feature_array(payload)

    scaler = joblib.load(scaler_path)
    scaled = scaler.transform(vector)

    classifier_checkpoint = torch.load(classifier_pt_path, map_location="cpu")
    classifier = HumanClassifier(int(classifier_checkpoint["input_dim"]))
    classifier.load_state_dict(classifier_checkpoint["state_dict"])
    classifier.eval()

    with torch.no_grad():
        logits = classifier(torch.tensor(scaled, dtype=torch.float32))
        human_probability = float(torch.sigmoid(logits)[0].item())

    anomaly_scaler = joblib.load(anomaly_scaler_path)
    anomaly_scaled = anomaly_scaler.transform(vector)

    checkpoint = torch.load(autoencoder_path, map_location="cpu")
    model = AutoEncoder(int(checkpoint["input_dim"]))
    model.load_state_dict(checkpoint["state_dict"])
    model.eval()

    with torch.no_grad():
        x = torch.tensor(anomaly_scaled, dtype=torch.float32)
        reconstructed = model(x)
        reconstruction_error = float(torch.mean((reconstructed - x) ** 2).item())

    threshold = float(checkpoint.get("threshold", 0.1))
    anomaly_score = min(1.0, reconstruction_error / max(threshold, 1e-6))

    insights: List[str] = [
        f"ML classifier human probability: {human_probability:.2f}",
        f"Anomaly score from autoencoder reconstruction: {anomaly_score:.2f}",
    ]

    print(
        json.dumps(
            {
                "humanProbability": human_probability,
                "anomalyScore": anomaly_score,
                "insights": insights,
            }
        )
    )


if __name__ == "__main__":
    predict()
