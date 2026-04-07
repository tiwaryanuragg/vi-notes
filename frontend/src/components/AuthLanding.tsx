import { FormEvent, useState } from "react";
import { AuthUser } from "../types";

interface AuthLandingProps {
  authError: string;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onRegister: (fullName: string, email: string, password: string, role: AuthUser["role"]) => Promise<boolean>;
}

export function AuthLanding({ authError, onLogin, onRegister }: AuthLandingProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AuthUser["role"]>("Student");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (mode === "login") {
      await onLogin(email, password);
      setIsSubmitting(false);
      return;
    }

    await onRegister(fullName, email, password, role);
    setIsSubmitting(false);
  };

  return (
    <main className="mx-auto mt-10 max-w-xl px-4 sm:px-6" id="main-content">
      <section className="animate-floatIn rounded-[24px] border border-orange-500 bg-gradient-to-br from-orange-50 to-amber-100 p-6 shadow-soft sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-800">Vi-Notes Access</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{mode === "login" ? "Login" : "Create Account"}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Authentication is required before accessing writing verification sessions.
        </p>

        <div className="mt-5 inline-flex rounded-full bg-orange-100 p-1" role="tablist" aria-label="Authentication mode selector">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === "login" ? "bg-white text-slate-900 shadow" : "text-slate-700"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            onClick={() => setMode("register")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === "register" ? "bg-white text-slate-900 shadow" : "text-slate-700"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {mode === "register" ? (
            <div>
              <label htmlFor="auth-full-name" className="block text-sm font-semibold text-slate-800">
                Full Name
              </label>
              <input
                id="auth-full-name"
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Anurag Kumar"
                className="mt-2 w-full rounded-xl border border-orange-400 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-600 focus:ring-4 focus:ring-orange-100"
                required
              />
            </div>
          ) : null}

          <div>
            <label htmlFor="auth-email" className="block text-sm font-semibold text-slate-800">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-orange-400 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-600 focus:ring-4 focus:ring-orange-100"
              required
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-semibold text-slate-800">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 8 characters"
              className="mt-2 w-full rounded-xl border border-orange-400 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-600 focus:ring-4 focus:ring-orange-100"
              required
              minLength={8}
            />
          </div>

          {mode === "register" ? (
            <div>
              <label htmlFor="auth-role" className="block text-sm font-semibold text-slate-800">
                Role
              </label>
              <select
                id="auth-role"
                value={role}
                onChange={(event) => setRole(event.target.value as AuthUser["role"])}
                className="mt-2 w-full rounded-xl border border-orange-400 bg-white px-3 py-2.5 text-slate-900 outline-none transition focus:border-orange-600 focus:ring-4 focus:ring-orange-100"
              >
                <option>Student</option>
                <option>Professional</option>
                <option>Writer</option>
              </select>
            </div>
          ) : null}

          {authError ? (
            <p className="rounded-xl border border-rose-500 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {authError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl border border-orange-500 bg-orange-200 px-4 py-3 text-sm font-semibold text-orange-950 transition hover:bg-orange-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
          >
            {isSubmitting ? "Please wait..." : mode === "login" ? "Login and Continue" : "Create Account"}
          </button>
        </form>
      </section>
    </main>
  );
}
