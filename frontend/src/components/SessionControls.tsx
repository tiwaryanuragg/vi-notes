interface SessionControlsProps {
  isSessionActive: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
}

export function SessionControls({
  isSessionActive,
  onStart,
  onPause,
  onReset,
}: SessionControlsProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-3 rounded-2xl border border-indigo-500 bg-indigo-50 p-3" role="group" aria-label="Writing session controls">
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full border border-emerald-300 bg-emerald-100 px-4 py-2.5 text-sm font-semibold text-emerald-900 shadow-soft transition hover:-translate-y-0.5 hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onStart}
        disabled={isSessionActive}
      >
        Start Session
      </button>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-100 px-4 py-2.5 text-sm font-semibold text-amber-900 transition hover:-translate-y-0.5 hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={onPause}
        disabled={!isSessionActive}
      >
        Pause Session
      </button>
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-full border border-rose-300 bg-rose-100 px-4 py-2.5 text-sm font-semibold text-rose-900 transition hover:-translate-y-0.5 hover:bg-rose-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
        onClick={onReset}
      >
        Reset Session
      </button>
    </div>
  );
}
