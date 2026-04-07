import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { app } from "./app";
import { connectDatabase } from "./config/database";

const envCandidates = [
	path.resolve(process.cwd(), ".env"),
	path.resolve(process.cwd(), "../.env"),
	path.resolve(__dirname, "../../.env"),
	path.resolve(__dirname, "../../../.env"),
];

for (const candidate of envCandidates) {
	if (fs.existsSync(candidate)) {
		dotenv.config({ path: candidate });
		break;
	}
}

async function bootstrap() {
	const env = {
		nodeEnv: process.env.NODE_ENV ?? "development",
		port: Number(process.env.API_PORT ?? 4000),
		mongodbUri: process.env.MONGODB_URI ?? "",
		mlServiceUrl: process.env.ML_SERVICE_URL,
		pythonBin: process.env.PYTHON_BIN ?? "python3",
		jwtSecret: process.env.JWT_SECRET ?? "",
		jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "",
	};

	if (!env.mongodbUri) {
		throw new Error("MONGODB_URI is required.");
	}

	if (!env.jwtSecret) {
		throw new Error("JWT_SECRET is required.");
	}

	if (!env.jwtRefreshSecret) {
		throw new Error("JWT_REFRESH_SECRET is required.");
	}

	await connectDatabase(env.mongodbUri);
	app.listen(env.port, () => {
		console.log(`Vi-Notes backend listening on port ${env.port}`);
	});
}

bootstrap().catch((error) => {
	console.error("Backend startup failed", error);
	process.exit(1);
});
