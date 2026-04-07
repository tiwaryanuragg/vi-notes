import { AnalysisOutput, SessionMetrics } from "../types/session";

export function analyzeCrossSignals(
  text: string,
  metrics: SessionMetrics,
  behavior: AnalysisOutput,
  textual: AnalysisOutput,
): AnalysisOutput {
  const flags: string[] = [];
  const evidence: string[] = [];

  let score = 58;

  if (metrics.totalCharacters > 0) {
    const keyToCharRatio = metrics.totalKeystrokes / Math.max(metrics.totalCharacters, 1);
    if (keyToCharRatio < 0.35 && metrics.totalWords > 60) {
      flags.push("Text volume is high relative to keystroke trace");
      score -= 18;
    } else {
      evidence.push(`Keystroke-to-character ratio: ${keyToCharRatio.toFixed(2)}`);
      score += 8;
    }
  }

  if (metrics.pasteCount > 0) {
    flags.push("Cross-verification detected externally inserted text");
    score -= Math.min(20, metrics.pasteCount * 6 + Math.floor(metrics.pastedCharacters / 120));
  }

  if (Math.abs(behavior.score - textual.score) > 35) {
    flags.push("Behavioral and textual signals are weakly correlated");
    score -= 10;
  } else {
    evidence.push("Behavioral and textual indicators are reasonably aligned");
    score += 10;
  }

  if (text.trim().length < 40) {
    evidence.push("Sample size is limited; confidence should be interpreted cautiously");
    score -= 5;
  }

  score = Math.max(0, Math.min(100, score));
  return { score, flags, evidence };
}
