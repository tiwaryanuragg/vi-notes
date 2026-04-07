import { Router } from "express";
import {
  getReportBySessionId,
  getReportByShareToken,
} from "../controllers/reportController";
import { requireAuth } from "../middleware/requireAuth";

const reportRouter = Router();

reportRouter.get("/session/:sessionId", requireAuth, getReportBySessionId);
reportRouter.get("/share/:shareToken", getReportByShareToken);

export { reportRouter };
