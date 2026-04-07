import { WritingStats } from "../types";

interface LiveMetricsProps {
  stats: WritingStats;
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <article className="rounded-2xl border border-emerald-400 bg-white/80 p-4 shadow-sm" aria-label={label}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-1 text-sm leading-5 text-slate-500">{helper}</p>
    </article>
  );
}

export function LiveMetrics({ stats }: LiveMetricsProps) {
  return (
    <section className="animate-floatIn rounded-[24px] border border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-100 p-5 shadow-soft" aria-labelledby="metrics-title">
      <div>
        <h2 id="metrics-title" className="text-xl font-semibold tracking-tight text-slate-900">
          Live Behavioral Metrics
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Real-time telemetry for speed, pauses, revisions, and writing flow.
        </p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Words" value={String(stats.totalWords)} helper="Total drafted words" />
        <MetricCard
          label="Keystrokes"
          value={String(stats.totalKeystrokes)}
          helper="Printable + deletion events"
        />
        <MetricCard
          label="Revisions"
          value={String(stats.revisionCount)}
          helper="Detected correction events"
        />
        <MetricCard
          label="Paste Events"
          value={String(stats.pasteCount)}
          helper={`${stats.pastedCharacters} pasted chars`}
        />
        <MetricCard
          label="Avg Pause"
          value={`${Math.round(stats.averagePauseMs)} ms`}
          helper="Across active writing intervals"
        />
        <MetricCard
          label="Longest Pause"
          value={`${Math.round(stats.longestPauseMs)} ms`}
          helper="Potential deep-thinking marker"
        />
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-500 bg-emerald-50 p-4" aria-label="Pause distribution">
        <h3 className="text-sm font-semibold text-slate-900">Pause Distribution</h3>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          <li>Micro pauses: {stats.pauseDistribution.micro}</li>
          <li>Thinking pauses: {stats.pauseDistribution.thinking}</li>
          <li>Deep pauses: {stats.pauseDistribution.deep}</li>
          <li>Punctuation-linked pauses: {stats.punctuationPauseCount}</li>
        </ul>
      </div>
    </section>
  );
}
