import { AuthUser } from "../types";

interface UserInfoCardProps {
  user: AuthUser;
  onLogout: () => void;
}

export function UserInfoCard({ user, onLogout }: UserInfoCardProps) {
  return (
    <section className="mt-4 animate-floatIn rounded-[24px] border border-rose-500 bg-gradient-to-br from-rose-50 to-pink-100 p-5 shadow-soft" aria-label="User info">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-800">Logged In User</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{user.fullName}</h2>
          <p className="mt-1 text-sm text-slate-600">{user.email}</p>
          <p className="mt-1 text-sm text-slate-600">Role: {user.role}</p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center justify-center rounded-full border border-rose-500 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
        >
          Logout
        </button>
      </div>
    </section>
  );
}
