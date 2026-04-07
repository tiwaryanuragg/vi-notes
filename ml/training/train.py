from __future__ import annotations

import json
from pathlib import Path
from typing import Tuple

import joblib
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = ROOT / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

FEATURE_DIM = 7


def synthetic_dataset(size: int = 2500) -> Tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(7)

    human = np.column_stack(
        [
            rng.normal(72, 10, size),
            rng.normal(68, 11, size),
            rng.normal(70, 10, size),
            rng.normal(320, 140, size),
            rng.poisson(0.3, size),
            rng.normal(42, 18, size),
            rng.normal(9, 3.8, size),
        ]
    )

    ai_assisted = np.column_stack(
        [
            rng.normal(43, 12, size),
            rng.normal(46, 10, size),
            rng.normal(38, 12, size),
            rng.normal(320, 140, size),
            rng.poisson(2.1, size),
            rng.normal(16, 9, size),
            rng.normal(2.8, 1.2, size),
        ]
    )

    x = np.vstack([human, ai_assisted]).astype(np.float32)
    y = np.concatenate([np.ones(size), np.zeros(size)]).astype(np.float32)
    return x, y


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


def train_classifier(x: np.ndarray, y: np.ndarray) -> float:
    scaler = StandardScaler()
    x_scaled = scaler.fit_transform(x)

    x_train, x_val, y_train, y_val = train_test_split(
        x_scaled,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y,
    )

    classifier = HumanClassifier(FEATURE_DIM)
    optimizer = optim.Adam(classifier.parameters(), lr=1e-3)
    loss_fn = nn.BCEWithLogitsLoss()

    train_tensor = torch.tensor(x_train, dtype=torch.float32)
    train_labels = torch.tensor(y_train, dtype=torch.float32)
    val_tensor = torch.tensor(x_val, dtype=torch.float32)
    val_labels = torch.tensor(y_val, dtype=torch.float32)

    for _ in range(60):
        classifier.train()
        optimizer.zero_grad()
        logits = classifier(train_tensor)
        loss = loss_fn(logits, train_labels)
        loss.backward()
        optimizer.step()

    classifier.eval()
    with torch.no_grad():
                val_logits = classifier(val_tensor)
                val_predictions = (torch.sigmoid(val_logits) >= 0.5).float()
                accuracy = float((val_predictions == val_labels).float().mean().item())

    torch.save(
        {
            "state_dict": classifier.state_dict(),
            "input_dim": FEATURE_DIM,
            "accuracy": accuracy,
        },
        MODELS_DIR / "human_classifier.pt",
    )
    joblib.dump(scaler, MODELS_DIR / "feature_scaler.joblib")
    return accuracy


def train_anomaly_model(x: np.ndarray) -> None:
    scaler = StandardScaler()
    x_scaled = scaler.fit_transform(x)

    tensor_x = torch.tensor(x_scaled, dtype=torch.float32)
    model = AutoEncoder(FEATURE_DIM)
    optimizer = optim.Adam(model.parameters(), lr=1e-3)
    loss_fn = nn.MSELoss()

    for _ in range(80):
        optimizer.zero_grad()
        reconstructed = model(tensor_x)
        loss = loss_fn(reconstructed, tensor_x)
        loss.backward()
        optimizer.step()

    with torch.no_grad():
        reconstruction = model(tensor_x)
        errors = torch.mean((reconstruction - tensor_x) ** 2, dim=1).numpy()

    threshold = float(np.percentile(errors, 95))

    torch.save(
        {
            "state_dict": model.state_dict(),
            "threshold": threshold,
            "input_dim": FEATURE_DIM,
        },
        MODELS_DIR / "anomaly_autoencoder.pt",
    )

    joblib.dump(scaler, MODELS_DIR / "anomaly_scaler.joblib")


def main() -> None:
    x, y = synthetic_dataset()
    accuracy = train_classifier(x, y)
    train_anomaly_model(x[y == 1])

    metadata = {
        "feature_order": [
            "behaviorScore",
            "textScore",
            "crossScore",
            "totalWords",
            "pasteCount",
            "revisionCount",
            "speedVariance",
        ],
        "description": "Vi-Notes human-authorship classifier and anomaly model",
        "classifier_accuracy": accuracy,
    }

    with open(MODELS_DIR / "metadata.json", "w", encoding="utf-8") as file:
        json.dump(metadata, file, indent=2)

    print("Training complete. Models saved in ml/models/.")


if __name__ == "__main__":
    main()
