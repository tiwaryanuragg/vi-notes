import { AnalysisOutput, SessionMetrics } from "../types/session";

function std(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }

  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function analyzeBehavior(metrics: SessionMetrics): AnalysisOutput {
  const speedVariance = std(metrics.speedSamples.map((sample) => sample.wpm));
  const totalPauseEvents =
    metrics.pauseDistribution.micro +
    metrics.pauseDistribution.thinking +
    metrics.pauseDistribution.deep;
  const revisionDensity = metrics.revisionCount / Math.max(metrics.totalWords, 1);

  const flags: string[] = [];
  const evidence: string[] = [];

  let score = 55;

  if (speedVariance < 4 && metrics.totalWords > 80) {
    flags.push("Typing speed shows low variance for long-form composition");
    score -= 16;
  } else {
    evidence.push(`Speed variance: ${speedVariance.toFixed(2)} WPM`);
    score += 12;
  }

  if (totalPauseEvents < 4 && metrics.totalWords > 100) {
    flags.push("Pause diversity appears lower than expected for long writing");
    score -= 10;
  } else {
    evidence.push(`Pause events captured: ${totalPauseEvents}`);
    score += 8;
  }

  if (revisionDensity < 0.05 && metrics.totalWords > 120) {
    flags.push("Low revision density compared to overall session length");
    score -= 8;
  } else {
    evidence.push(`Revision density: ${revisionDensity.toFixed(2)}`);
    score += 6;
  }

  if (metrics.punctuationPauseCount > 0) {
    evidence.push(`Punctuation-linked pauses: ${metrics.punctuationPauseCount}`);
    score += Math.min(6, Math.floor(metrics.punctuationPauseCount / 2));
  }

  score = Math.max(0, Math.min(100, score));

  return { score, flags, evidence };
}
