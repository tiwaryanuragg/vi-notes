import { useMemo, useState } from "react";
import { AuthUser } from "../types";

interface HeaderProps {
  isSessionActive: boolean;
  user?: AuthUser;
  onLogout?: () => void;
}

export function Header({ isSessionActive, onLogout, user }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = useMemo(() => {
    if (!user?.fullName) {
      return "U";
    }

    const parts = user.fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
  }, [user?.fullName]);

  return (
    <header
      className="animate-floatIn rounded-[24px] border border-sky-500 bg-gradient-to-r from-sky-100 via-cyan-50 to-blue-100 px-5 py-5 text-slate-900 shadow-soft sm:px-6 sm:py-6"
      role="banner"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-xl font-semibold uppercase tracking-[0.16em] text-sky-900 flex ">
          Authenticity Verification Platform
        </p>

        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowUserMenu((current) => !current)}
              className="grid h-11 w-11 place-items-center rounded-full border border-sky-500 bg-white text-sm font-semibold text-sky-900 shadow-sm transition hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200"
              aria-label="Open user menu"
              aria-expanded={showUserMenu}
            >
              {initials}
            </button>

            {showUserMenu ? (
              <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-sky-500 bg-white p-4 shadow-soft">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-800">Logged In User</p>
                <p className="mt-2 text-base font-semibold text-slate-900">{user.fullName}</p>
                <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                <p className="mt-1 text-sm text-slate-600">Role: {user.role}</p>

                {onLogout ? (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-rose-500 bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-900 transition hover:bg-rose-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
                  >
                    Logout
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {/* <p className="text-yellow-300">
        You write and we check 
      </p> */}
      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Vi-Notes
        </h1>
        {/* <span
          className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-sm font-semibold transition border-yellow-300 ${
            isSessionActive
              ? "border-emerald-200 bg-emerald-400/15 text-emerald-50"
              : "border-white/25 bg-white/10 text-white/90"
          }`}
          aria-live="polite"
        >
          {isSessionActive ? "Session Live" : "Session Idle"}
        </span> */}
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700 sm:text-base">
        Capture real writing behavior and linguistic signatures to estimate human authorship confidence.
      </p>

      {/* {isSessionActive ? (
        <p className="mt-3 inline-flex rounded-full border border-emerald-500 bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-900">
          Session Live
        </p>
      ) : (
        <p className="mt-3 inline-flex rounded-full border border-amber-500 bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-amber-900">
          Session Idle
        </p>
      )} */}
    </header>
  );
}
