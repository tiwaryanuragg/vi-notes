import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { authRouter } from "./routes/authRoutes";
import { healthRouter } from "./routes/healthRoutes";
import { reportRouter } from "./routes/reportRoutes";
import { sessionRouter } from "./routes/sessionRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";

const app = express();

const configuredOrigins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:5173")
	.split(",")
	.map((value) => value.trim())
	.filter(Boolean);

function isAllowedOrigin(origin?: string) {
	if (!origin) {
		return true;
	}

	if (configuredOrigins.includes(origin)) {
		return true;
	}

	return /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);
}

app.use(cors({
	origin(origin, callback) {
		if (isAllowedOrigin(origin)) {
			callback(null, true);
			return;
		}

		callback(new Error("Origin not allowed by CORS"));
	},
	credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
	res.json({
		service: "vi-notes-backend",
		status: "ok",
	});
});

app.use("/api/v1/health", healthRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/sessions", sessionRouter);
app.use("/api/v1/reports", reportRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };
