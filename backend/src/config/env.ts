export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.API_PORT ?? 4000),
  mongodbUri: process.env.MONGODB_URI ?? "",
  mlServiceUrl: process.env.ML_SERVICE_URL,
  pythonBin: process.env.PYTHON_BIN ?? "python3",
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? "",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
};
