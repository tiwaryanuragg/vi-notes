import { Schema, model } from "mongoose";

const suspiciousSegmentSchema = new Schema(
  {
    reason: { type: String, required: true },
    excerpt: { type: String, required: true },
    scoreImpact: { type: Number, required: true },
  },
  { _id: false },
);

const authenticityReportSchema = new Schema(
  {
    sessionId: { type: String, required: true, index: true, unique: true },
    confidenceScore: { type: Number, required: true },
    label: {
      type: String,
      enum: ["Likely Human", "Needs Review", "Likely AI-Assisted"],
      required: true,
    },
    summary: { type: String, required: true },
    suspiciousPatterns: { type: [String], default: [] },
    evidencePoints: { type: [String], default: [] },
    suspiciousSegments: { type: [suspiciousSegmentSchema], default: [] },
    mlInsights: { type: [String], default: [] },
    shareToken: { type: String, required: true, unique: true, index: true },
  },
  {
    timestamps: true,
  },
);

export const AuthenticityReportModel = model("AuthenticityReport", authenticityReportSchema);
