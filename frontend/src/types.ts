export type PauseBucket = "micro" | "thinking" | "deep";

export interface SpeedSample {
  timestamp: number;
  wpm: number;
}

export interface SessionAlert {
  id: string;
  level: "info" | "warning";
  message: string;
}

export interface SuspiciousSegment {
  id: string;
  reason: string;
  excerpt: string;
  scoreImpact: number;
}

export interface WritingStats {
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
  pauseDistribution: Record<PauseBucket, number>;
  speedSamples: SpeedSample[];
}

export interface AuthenticityReport {
  confidenceScore: number;
  label: "Likely Human" | "Needs Review" | "Likely AI-Assisted";
  summary: string;
  suspiciousPatterns: string[];
  evidencePoints: string[];
  suspiciousSegments: SuspiciousSegment[];
}

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: "Student" | "Professional" | "Writer";
  createdAt: string;
}
