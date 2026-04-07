import { v4 as uuidv4 } from "uuid";
import { AuthenticityReportModel } from "../models/AuthenticityReport";
import { WritingSessionModel } from "../models/WritingSession";
import { GeneratedReport } from "../types/report";
import { IngestSessionPayload } from "../types/session";
import { analyzeBehavior } from "./behaviorAnalysisService";
import { analyzeCrossSignals } from "./crossVerificationService";
import { getMlPrediction } from "./mlService";
import { analyzeTextualSignals } from "./textAnalysisService";

function labelFromScore(score: number): GeneratedReport["label"] {
  if (score >= 75) {
    return "Likely Human";
  }
  if (score >= 45) {
    return "Needs Review";
  }
  return "Likely AI-Assisted";
}

export async function processSessionAnalysis(sessionId: string, payload: IngestSessionPayload) {
  const behavior = analyzeBehavior(payload.metrics);
  const textual = analyzeTextualSignals(payload.text, payload.metrics);
  const cross = analyzeCrossSignals(payload.text, payload.metrics, behavior, textual);

  await WritingSessionModel.findOneAndUpdate(
    { sessionId },
    {
      textSnapshot: payload.text,
      metrics: payload.metrics,
      behavioralSignals: behavior,
      textualSignals: textual,
      crossSignals: cross,
      suspicionFlags: [...behavior.flags, ...textual.flags, ...cross.flags],
    },
  );

  return { behavior, textual, cross };
}

export async function finalizeSessionReport(sessionId: string) {
  const session = await WritingSessionModel.findOne({ sessionId });
  if (!session) {
    return null;
  }

  const behaviorScore = session.behavioralSignals?.score ?? 0;
  const textScore = session.textualSignals?.score ?? 0;
  const crossScore = session.crossSignals?.score ?? 0;

  const baseScore = behaviorScore * 0.4 + textScore * 0.3 + crossScore * 0.3;

  const speedValues: number[] = (session.metrics?.speedSamples ?? []).map((sample: { wpm: number }) => sample.wpm);
  const meanSpeed =
    speedValues.length === 0
      ? 0
      : speedValues.reduce((sum, value) => sum + value, 0) / speedValues.length;
  const speedVariance =
    speedValues.length < 2
      ? 0
      : Math.sqrt(
          speedValues.reduce((sum, value) => sum + (value - meanSpeed) ** 2, 0) /
            speedValues.length,
        );

  const mlPrediction = await getMlPrediction({
    behaviorScore,
    textScore,
    crossScore,
    totalWords: session.metrics?.totalWords ?? 0,
    pasteCount: session.metrics?.pasteCount ?? 0,
    revisionCount: session.metrics?.revisionCount ?? 0,
    speedVariance,
  });

  const mlAdjustedScore =
    mlPrediction === null
      ? baseScore
      : baseScore * 0.75 + mlPrediction.humanProbability * 100 * 0.25 - mlPrediction.anomalyScore * 8;

  const confidenceScore = Math.max(0, Math.min(100, Math.round(mlAdjustedScore)));
  const label = labelFromScore(confidenceScore);

  const suspiciousPatterns = [
    ...(session.behavioralSignals?.flags ?? []),
    ...(session.textualSignals?.flags ?? []),
    ...(session.crossSignals?.flags ?? []),
  ];

  const evidencePoints = [
    ...(session.behavioralSignals?.evidence ?? []),
    ...(session.textualSignals?.evidence ?? []),
    ...(session.crossSignals?.evidence ?? []),
  ];

  const mlInsights = mlPrediction?.insights ?? ["ML prediction unavailable; using deterministic analysis only."];

  const reportData: GeneratedReport = {
    confidenceScore,
    label,
    summary:
      suspiciousPatterns.length === 0
        ? "Behavioral and textual indicators align with organic human writing flow."
        : "Potential inconsistencies were found across behavioral and textual signatures.",
    suspiciousPatterns,
    evidencePoints,
    suspiciousSegments:
      session.metrics?.pasteCount > 0
        ? [
            {
              reason: "Pasted content detected",
              excerpt: (session.textSnapshot ?? "").slice(0, 180).replace(/\s+/g, " "),
              scoreImpact: Math.min(20, (session.metrics?.pasteCount ?? 0) * 6),
            },
          ]
        : [],
    mlInsights,
  };

  const shareToken = uuidv4();

  const report = await AuthenticityReportModel.findOneAndUpdate(
    { sessionId },
    {
      ...reportData,
      shareToken,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  await WritingSessionModel.findOneAndUpdate(
    { sessionId },
    {
      status: "completed",
      endedAt: new Date(),
    },
  );

  return report;
}
