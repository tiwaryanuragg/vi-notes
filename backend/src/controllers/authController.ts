import { Request, Response } from "express";
import { compare, hash } from "bcryptjs";
import { createHash } from "crypto";
import { UserModel } from "../models/User";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { signAuthToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { AuthRole } from "../types/auth";

const REFRESH_COOKIE_NAME = "vi_notes_refresh_token";

interface RegisterBody {
  fullName?: string;
  email?: string;
  password?: string;
  role?: AuthRole;
}

interface LoginBody {
  email?: string;
  password?: string;
}

function hashToken(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/v1/auth",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/v1/auth",
  });
}

async function issueAuthSession(user: {
  _id: unknown;
  email: string;
  fullName: string;
  role: AuthRole;
  createdAt: Date;
  save: () => Promise<unknown>;
  refreshTokenHash: string | null;
}, res: Response) {
  const userId = String(user._id);
  const accessToken = signAuthToken({
    id: userId,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  });

  const refreshToken = signRefreshToken({
    id: userId,
    type: "refresh",
  });

  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  setRefreshCookie(res, refreshToken);

  return {
    token: accessToken,
    user: toPublicUser({
      id: userId,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }),
  };
}

function toPublicUser(input: {
  id: string;
  fullName: string;
  email: string;
  role: AuthRole;
  createdAt: Date;
}) {
  return {
    id: input.id,
    fullName: input.fullName,
    email: input.email,
    role: input.role,
    createdAt: input.createdAt.toISOString(),
  };
}

function validatePassword(password?: string) {
  if (!password || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters.");
  }
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, email, password, role } = req.body as RegisterBody;

  if (!fullName?.trim() || !email?.trim()) {
    throw new ApiError(400, "Full name and email are required.");
  }

  validatePassword(password);

  const normalizedEmail = email.trim().toLowerCase();
  const exists = await UserModel.findOne({ email: normalizedEmail }).select("_id");
  if (exists) {
    throw new ApiError(409, "An account with this email already exists.");
  }

  const passwordHash = await hash(password!, 12);
  const user = await UserModel.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    role: role ?? "Student",
  });

  const session = await issueAuthSession(user, res);
  res.status(201).json(session);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginBody;

  if (!email?.trim() || !password) {
    throw new ApiError(400, "Email and password are required.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await UserModel.findOne({ email: normalizedEmail });

  if (!user) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const matches = await compare(password, user.passwordHash);
  if (!matches) {
    throw new ApiError(401, "Invalid credentials.");
  }

  const session = await issueAuthSession(user, res);
  res.json(session);
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required.");
  }

  const payload = verifyRefreshToken(refreshToken);
  const user = await UserModel.findById(payload.id);

  if (!user || !user.refreshTokenHash) {
    throw new ApiError(401, "Invalid refresh session.");
  }

  if (user.refreshTokenHash !== hashToken(refreshToken)) {
    user.refreshTokenHash = null;
    await user.save();
    clearRefreshCookie(res);
    throw new ApiError(401, "Refresh session expired.");
  }

  const session = await issueAuthSession(user, res);
  res.json(session);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;

  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const user = await UserModel.findById(payload.id);
      if (user) {
        user.refreshTokenHash = null;
        await user.save();
      }
    } catch {
      // ignore token verification failures during logout
    }
  }

  clearRefreshCookie(res);
  res.status(204).send();
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.authUser?.id;
  if (!userId) {
    throw new ApiError(401, "Authentication required.");
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  res.json({
    user: toPublicUser({
      id: String(user._id),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }),
  });
});
