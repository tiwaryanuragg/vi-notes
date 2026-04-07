import { AuthenticityReport } from "./components/AuthenticityReport";
import { AuthLanding } from "./components/AuthLanding";
import { Header } from "./components/Header";
import { LiveMetrics } from "./components/LiveMetrics";
import { ProjectScope } from "./components/ProjectScope";
import { SessionControls } from "./components/SessionControls";
import { WritingEditor } from "./components/WritingEditor";
import { useAuth } from "./hooks/useAuth";
import { useWritingSession } from "./hooks/useWritingSession";

export function App() {
  const { authError, isAuthenticated, isLoading, login, logout, register, user } = useAuth();

  const {
    alerts,
    isSessionActive,
    onChange,
    onKeyDown,
    onPaste,
    report,
    resetSession,
    startSession,
    endSession,
    stats,
    text,
  } = useWritingSession();

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center rounded-[24px] bg-white/70 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <p className="text-sm font-medium text-slate-600">Checking session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <Header isSessionActive={false} user={undefined} onLogout={undefined} />
        <AuthLanding authError={authError} onLogin={login} onRegister={register} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      <Header isSessionActive={isSessionActive} user={user ?? undefined} onLogout={logout} />

      <SessionControls
        isSessionActive={isSessionActive}
        onStart={startSession}
        onPause={endSession}
        onReset={resetSession}
      />

      <main id="main-content" className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <WritingEditor
          text={text}
          isSessionActive={isSessionActive}
          alerts={alerts}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
        />

        <div className="grid gap-4">
          <LiveMetrics stats={stats} />
          <ProjectScope />
        </div>
      </main>

      <AuthenticityReport report={report} />
    </div>
  );
}
