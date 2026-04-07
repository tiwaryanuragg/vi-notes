from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List


@dataclass
class FeatureVector:
    behavior_score: float
    text_score: float
    cross_score: float
    total_words: float
    paste_count: float
    revision_count: float
    speed_variance: float

    def as_list(self) -> List[float]:
        return [
            self.behavior_score,
            self.text_score,
            self.cross_score,
            self.total_words,
            self.paste_count,
            self.revision_count,
            self.speed_variance,
        ]


def from_payload(payload: Dict[str, float]) -> FeatureVector:
    return FeatureVector(
        behavior_score=float(payload.get("behaviorScore", 0.0)),
        text_score=float(payload.get("textScore", 0.0)),
        cross_score=float(payload.get("crossScore", 0.0)),
        total_words=float(payload.get("totalWords", 0.0)),
        paste_count=float(payload.get("pasteCount", 0.0)),
        revision_count=float(payload.get("revisionCount", 0.0)),
        speed_variance=float(payload.get("speedVariance", 0.0)),
    )
