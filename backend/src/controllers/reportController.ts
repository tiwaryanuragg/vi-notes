import { Request, Response } from "express";
import { AuthenticityReportModel } from "../models/AuthenticityReport";
import { WritingSessionModel } from "../models/WritingSession";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";

export const getReportBySessionId = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId;
  const userId = req.authUser?.id;

  if (!userId) {
    throw new ApiError(401, "Authentication required.");
  }

  const session = await WritingSessionModel.findOne({ sessionId, userId }).select("sessionId");
  if (!session) {
    throw new ApiError(404, "Report not found.");
  }

  const report = await AuthenticityReportModel.findOne({ sessionId });

  if (!report) {
    throw new ApiError(404, "Report not found.");
  }

  res.json(report);
});

export const getReportByShareToken = asyncHandler(async (req: Request, res: Response) => {
  const shareToken = req.params.shareToken;
  const report = await AuthenticityReportModel.findOne({ shareToken });

  if (!report) {
    throw new ApiError(404, "Shared report not found.");
  }

  res.json({
    sessionId: report.sessionId,
    confidenceScore: report.confidenceScore,
    label: report.label,
    summary: report.summary,
    suspiciousPatterns: report.suspiciousPatterns,
    evidencePoints: report.evidencePoints,
    suspiciousSegments: report.suspiciousSegments,
    createdAt: report.createdAt,
  });
});
