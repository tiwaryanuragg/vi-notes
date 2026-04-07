import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { WritingSessionModel } from "../models/WritingSession";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { finalizeSessionReport, processSessionAnalysis } from "../services/reportService";

function validateIngestPayload(payload: unknown): payload is { text: string; metrics: Record<string, unknown> } {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const body = payload as Record<string, unknown>;
  return typeof body.text === "string" && typeof body.metrics === "object" && body.metrics !== null;
}

export const startSession = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.authUser?.id;
  if (!userId) {
    throw new ApiError(401, "Authentication required.");
  }

  const sessionId = uuidv4();

  await WritingSessionModel.create({
    sessionId,
    userId,
    startedAt: new Date(),
    status: "active",
    privacy: {
      rawKeystrokesStored: false,
    },
  });

  res.status(201).json({
    sessionId,
    status: "active",
  });
});

export const ingestSessionData = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = String(req.params.sessionId);
  const userId = req.authUser?.id;
  const payload = req.body;

  if (!userId) {
    throw new ApiError(401, "Authentication required.");
  }

  if (!validateIngestPayload(payload)) {
    throw new ApiError(400, "Invalid payload. Expected text and metrics.");
  }

  const session = await WritingSessionModel.findOne({ sessionId, userId });
  if (!session) {
    throw new ApiError(404, "Session not found.");
  }

  if (session.status === "completed") {
    throw new ApiError(409, "Session already completed.");
  }

  const analysis = await processSessionAnalysis(sessionId, {
    text: payload.text,
    metrics: payload.metrics as never,
  });

  res.json({
    sessionId,
    status: "active",
    analysis,
  });
});

export const endSession = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = String(req.params.sessionId);
  const userId = req.authUser?.id;

  if (!userId) {
    throw new ApiError(401, "Authentication required.");
  }

  const ownedSession = await WritingSessionModel.findOne({ sessionId, userId });
  if (!ownedSession) {
    throw new ApiError(404, "Session not found.");
  }

  const report = await finalizeSessionReport(sessionId);
  if (!report) {
    throw new ApiError(404, "Session not found.");
  }

  res.json({
    sessionId,
    status: "completed",
    report,
  });
});

export const getSessionById = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = String(req.params.sessionId);
  const userId = req.authUser?.id;

  if (!userId) {
    throw new ApiError(401, "Authentication required.");
  }

  const session = await WritingSessionModel.findOne({ sessionId, userId });

  if (!session) {
    throw new ApiError(404, "Session not found.");
  }

  res.json(session);
});
