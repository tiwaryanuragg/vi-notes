import { AnalysisOutput, SessionMetrics } from "../types/session";

function standardDeviation(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function uniqueWordRatio(text: string): number {
  const words = text.toLowerCase().match(/[a-z0-9']+/g) ?? [];
  if (words.length === 0) {
    return 0;
  }
  const unique = new Set(words);
  return unique.size / words.length;
}

export function analyzeTextualSignals(text: string, metrics: SessionMetrics): AnalysisOutput {
  const lines = text
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const sentenceWordCounts = lines.map((line) => line.split(/\s+/).length);
  const sentenceVariance = standardDeviation(sentenceWordCounts);
  const vocabRatio = uniqueWordRatio(text);

  const flags: string[] = [];
  const evidence: string[] = [];
  let score = 52;

  if (sentenceVariance < 2 && lines.length >= 6) {
    flags.push("Sentence structure appears highly uniform");
    score -= 14;
  } else {
    evidence.push(`Sentence-length variance: ${sentenceVariance.toFixed(2)}`);
    score += 10;
  }

  if (vocabRatio < 0.28 && metrics.totalWords > 120) {
    flags.push("Vocabulary diversity appears lower than expected");
    score -= 9;
  } else {
    evidence.push(`Vocabulary diversity ratio: ${vocabRatio.toFixed(2)}`);
    score += 8;
  }

  const punctuationDensity = (text.match(/[,:;()\-]/g) ?? []).length / Math.max(text.length, 1);
  if (punctuationDensity < 0.015 && metrics.totalWords > 150) {
    flags.push("Low punctuation variation for extended text");
    score -= 5;
  } else {
    evidence.push(`Punctuation density: ${(punctuationDensity * 100).toFixed(2)}%`);
    score += 4;
  }

  score = Math.max(0, Math.min(100, score));

  return { score, flags, evidence };
}
