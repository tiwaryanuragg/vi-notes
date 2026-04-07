import { Schema, model } from "mongoose";

const speedSampleSchema = new Schema(
  {
    timestamp: { type: Number, required: true },
    wpm: { type: Number, required: true },
  },
  { _id: false },
);

const writingMetricsSchema = new Schema(
  {
    totalCharacters: { type: Number, default: 0 },
    totalWords: { type: Number, default: 0 },
    totalKeystrokes: { type: Number, default: 0 },
    deletionCount: { type: Number, default: 0 },
    pasteCount: { type: Number, default: 0 },
    pastedCharacters: { type: Number, default: 0 },
    revisionCount: { type: Number, default: 0 },
    punctuationPauseCount: { type: Number, default: 0 },
    averagePauseMs: { type: Number, default: 0 },
    longestPauseMs: { type: Number, default: 0 },
    pauseDistribution: {
      micro: { type: Number, default: 0 },
      thinking: { type: Number, default: 0 },
      deep: { type: Number, default: 0 },
    },
    speedSamples: { type: [speedSampleSchema], default: [] },
  },
  { _id: false },
);

const analysisSignalsSchema = new Schema(
  {
    score: { type: Number, default: 0 },
    flags: { type: [String], default: [] },
    evidence: { type: [String], default: [] },
  },
  { _id: false },
);

const writingSessionSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null, index: true },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
      index: true,
    },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    textSnapshot: { type: String, default: "" },
    metrics: { type: writingMetricsSchema, default: () => ({}) },
    behavioralSignals: { type: analysisSignalsSchema, default: () => ({}) },
    textualSignals: { type: analysisSignalsSchema, default: () => ({}) },
    crossSignals: { type: analysisSignalsSchema, default: () => ({}) },
    suspicionFlags: { type: [String], default: [] },
    privacy: {
      rawKeystrokesStored: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  },
);

export const WritingSessionModel = model("WritingSession", writingSessionSchema);
