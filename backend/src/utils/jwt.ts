import jwt, { type SignOptions } from "jsonwebtoken";
import { ApiError } from "./apiError";
import { JwtRefreshPayload, JwtUserPayload } from "../types/auth";

const issuer = "vi-notes-backend";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is required.");
  }
  return secret;
}

function getRefreshJwtSecret() {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is required.");
  }
  return secret;
}

export function signAuthToken(payload: JwtUserPayload) {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn,
    issuer,
    subject: payload.id,
  });
}

export function verifyAuthToken(token: string): JwtUserPayload {
  try {
    return jwt.verify(token, getJwtSecret(), { issuer }) as JwtUserPayload;
  } catch {
    throw new ApiError(401, "Invalid or expired authentication token.");
  }
}

export function signRefreshToken(payload: JwtRefreshPayload) {
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN ?? "30d") as SignOptions["expiresIn"];

  return jwt.sign(payload, getRefreshJwtSecret(), {
    expiresIn,
    issuer,
    subject: payload.id,
  });
}

export function verifyRefreshToken(token: string): JwtRefreshPayload {
  try {
    const payload = jwt.verify(token, getRefreshJwtSecret(), { issuer }) as JwtRefreshPayload;
    if (payload.type !== "refresh") {
      throw new ApiError(401, "Invalid refresh token.");
    }
    return payload;
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token.");
  }
}
