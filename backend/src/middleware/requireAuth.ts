import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { verifyAuthToken } from "../utils/jwt";

function extractBearerToken(headerValue?: string) {
  if (!headerValue) {
    return null;
  }

  const [scheme, token] = headerValue.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token;
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = extractBearerToken(req.header("authorization"));
  if (!token) {
    throw new ApiError(401, "Authorization token is required.");
  }

  req.authUser = verifyAuthToken(token);
  next();
}
