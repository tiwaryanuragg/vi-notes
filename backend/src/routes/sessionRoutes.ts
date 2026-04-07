import { Router } from "express";
import {
  endSession,
  getSessionById,
  ingestSessionData,
  startSession,
} from "../controllers/sessionController";
import { requireAuth } from "../middleware/requireAuth";

const sessionRouter = Router();

sessionRouter.use(requireAuth);
sessionRouter.post("/start", startSession);
sessionRouter.post("/:sessionId/ingest", ingestSessionData);
sessionRouter.post("/:sessionId/end", endSession);
sessionRouter.get("/:sessionId", getSessionById);

export { sessionRouter };
