import { API_BASE_URL } from "../config";
import { AuthUser } from "../types";

type Role = AuthUser["role"];

interface AuthResponse {
  token: string;
  user: AuthUser;
}

async function authRequest<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const raw = await response.text();
    let parsedError = "";

    try {
      const parsed = JSON.parse(raw) as { error?: string };
      parsedError = parsed.error ?? "";
    } catch {
      // non-JSON response
    }

    throw new Error(parsedError || raw || "Authentication request failed.");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function registerOnServer(fullName: string, email: string, password: string, role: Role) {
  return authRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ fullName, email, password, role }),
  });
}

export function loginOnServer(email: string, password: string) {
  return authRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getCurrentUserOnServer(token: string) {
  return authRequest<{ user: AuthUser }>("/auth/me", {
    method: "GET",
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
}

export function refreshAccessTokenOnServer() {
  return authRequest<AuthResponse>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function logoutOnServer() {
  return authRequest<void>("/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
