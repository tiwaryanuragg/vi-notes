export interface SpeedSample {
  timestamp: number;
  wpm: number;
}

export interface SessionMetrics {
  totalCharacters: number;
  totalWords: number;
  totalKeystrokes: number;
  deletionCount: number;
  pasteCount: number;
  pastedCharacters: number;
  revisionCount: number;
  punctuationPauseCount: number;
  averagePauseMs: number;
  longestPauseMs: number;
  pauseDistribution: {
    micro: number;
    thinking: number;
    deep: number;
  };
  speedSamples: SpeedSample[];
}

export interface IngestSessionPayload {
  text: string;
  metrics: SessionMetrics;
}

export interface AuthLabel {
  label: "Likely Human" | "Needs Review" | "Likely AI-Assisted";
}

export interface AnalysisOutput {
  score: number;
  flags: string[];
  evidence: string[];
}
