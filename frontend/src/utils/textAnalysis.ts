import { SpeedSample } from "../types";

export function countWords(text: string): number {
  const normalized = text.trim();
  if (!normalized) {
    return 0;
  }
  return normalized.split(/\s+/).length;
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function standardDeviation(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }
  const mean = average(values);
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

export function estimateTextComplexity(text: string): number {
  const sentences = text
    .split(/[.!?]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return 0;
  }

  const sentenceLengths = sentences.map((sentence) => countWords(sentence));
  const meanSentenceLength = average(sentenceLengths);
  const sentenceVariance = standardDeviation(sentenceLengths);
  const punctuationDensity = (text.match(/[,:;()\-]/g) ?? []).length / Math.max(text.length, 1);

  return meanSentenceLength * 0.6 + sentenceVariance * 0.3 + punctuationDensity * 20;
}

export function calculateCurrentWpm(
  totalTypedChars: number,
  sessionDurationMs: number,
): number {
  if (sessionDurationMs <= 0) {
    return 0;
  }
  const wordsEstimate = totalTypedChars / 5;
  const minutes = sessionDurationMs / 60000;
  if (minutes === 0) {
    return 0;
  }
  return wordsEstimate / minutes;
}

export function summarizeSpeed(samples: SpeedSample[]): {
  meanWpm: number;
  varianceWpm: number;
} {
  const wpms = samples.map((sample) => sample.wpm);
  return {
    meanWpm: average(wpms),
    varianceWpm: standardDeviation(wpms),
  };
}
