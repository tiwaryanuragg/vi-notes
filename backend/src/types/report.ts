export interface SuspiciousSegment {
  reason: string;
  excerpt: string;
  scoreImpact: number;
}

export interface GeneratedReport {
  confidenceScore: number;
  label: "Likely Human" | "Needs Review" | "Likely AI-Assisted";
  summary: string;
  suspiciousPatterns: string[];
  evidencePoints: string[];
  suspiciousSegments: SuspiciousSegment[];
  mlInsights: string[];
}
