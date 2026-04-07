# ML Module

Vi-Notes ML stack provides:

- Supervised binary classifier (human vs likely AI-assisted) using PyTorch.
- Unsupervised anomaly detector using a PyTorch autoencoder.

## Directory Usage

- `training/train.py`: trains both models and stores artifacts under `ml/models/`.
- `inference/predict.py`: reads JSON features from stdin and prints JSON prediction.
- `features/feature_extractor.py`: shared feature vector schema helpers.
- `models/`: generated classifier, autoencoder, scalers, and metadata.

## Feature Order

1. `behaviorScore`
2. `textScore`
3. `crossScore`
4. `totalWords`
5. `pasteCount`
6. `revisionCount`
7. `speedVariance`

If trained models are missing, inference falls back to deterministic heuristics.
