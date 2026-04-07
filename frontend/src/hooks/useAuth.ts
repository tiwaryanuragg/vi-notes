import { useEffect, useMemo, useState } from "react";
import { AuthUser } from "../types";
import {
  getCurrentUserOnServer,
  loginOnServer,
  logoutOnServer,
  refreshAccessTokenOnServer,
  registerOnServer,
} from "../services/auth";
import { getAuthToken, setAuthToken } from "../services/authSession";

const USER_STORAGE_KEY = "vi-notes-auth-user";

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function saveUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY);
    return;
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string>("");

  const isAuthenticated = useMemo(() => Boolean(user), [user]);

  useEffect(() => {
    const run = async () => {
      const token = getAuthToken();

      if (!token) {
        try {
          const refreshed = await refreshAccessTokenOnServer();
          setAuthToken(refreshed.token);
          setUser(refreshed.user);
          saveUser(refreshed.user);
          setAuthError("");
        } catch {
          setUser(null);
          saveUser(null);
          setAuthToken(null);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await getCurrentUserOnServer(token);
        setUser(data.user);
        saveUser(data.user);
        setAuthError("");
      } catch {
        try {
          const refreshed = await refreshAccessTokenOnServer();
          setAuthToken(refreshed.token);
          setUser(refreshed.user);
          saveUser(refreshed.user);
          setAuthError("");
        } catch {
          setUser(null);
          saveUser(null);
          setAuthToken(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    void run();
  }, []);

  const login = async (email: string, password: string) => {
    if (!email.trim() || !password.trim()) {
      setAuthError("Email and password are required.");
      return false;
    }

    try {
      const data = await loginOnServer(email.trim(), password);
      setUser(data.user);
      saveUser(data.user);
      setAuthToken(data.token);
      setAuthError("");
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Login failed.");
      return false;
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    role: AuthUser["role"],
  ) => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setAuthError("Full name, email, and password are required.");
      return false;
    }

    try {
      const data = await registerOnServer(fullName.trim(), email.trim(), password, role);
      setUser(data.user);
      saveUser(data.user);
      setAuthToken(data.token);
      setAuthError("");
      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Registration failed.");
      return false;
    }
  };

  const logout = async () => {
    try {
      await logoutOnServer();
    } catch {
      // continue with local cleanup even if network request fails
    }

    setUser(null);
    saveUser(null);
    setAuthToken(null);
    setAuthError("");
  };

  return {
    authError,
    isLoading,
    isAuthenticated,
    login,
    logout,
    register,
    user,
  };
}
