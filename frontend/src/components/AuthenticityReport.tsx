import { AuthenticityReport as AuthenticityReportType } from "../types";

interface AuthenticityReportProps {
  report: AuthenticityReportType;
}

export function AuthenticityReport({ report }: AuthenticityReportProps) {
  return (
    <section className="mt-4 animate-floatIn rounded-[24px] border border-violet-500 bg-gradient-to-br from-violet-50 to-fuchsia-100 p-5 shadow-soft" aria-labelledby="report-title">
      <div>
        <h2 id="report-title" className="text-xl font-semibold tracking-tight text-slate-900">
          Authenticity Report
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Cross-verification of writing behavior and textual statistical signatures.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div
          className="grid h-24 w-24 place-items-center rounded-full border-[10px] border-emerald-200 bg-[conic-gradient(theme(colors.brand.600)_72%,theme(colors.slate.200)_0)] text-lg font-semibold text-brand-900"
          role="img"
          aria-label={`Authenticity confidence ${report.confidenceScore}%`}
        >
          <span>{report.confidenceScore}%</span>
        </div>
        <div>
          <p className="text-base font-semibold text-slate-900">{report.label}</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">{report.summary}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-violet-400 bg-violet-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Suspicious Patterns</h3>
          {report.suspiciousPatterns.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">No suspicious pattern detected in this session.</p>
          ) : (
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              {report.suspiciousPatterns.map((pattern) => (
                <li key={pattern}>{pattern}</li>
              ))}
            </ul>
          )}
        </article>

        <article className="rounded-2xl border border-violet-400 bg-violet-50 p-4">
          <h3 className="text-sm font-semibold text-slate-900">Supporting Evidence</h3>
          {report.evidencePoints.length === 0 ? (
            <p className="mt-2 text-sm leading-6 text-slate-600">Begin writing to generate measurable indicators.</p>
          ) : (
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700">
              {report.evidencePoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          )}
        </article>
      </div>

      <article className="mt-4 rounded-2xl border border-violet-500 bg-violet-50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Flagged Segments</h3>
        {report.suspiciousSegments.length === 0 ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">No suspicious segments currently highlighted.</p>
        ) : (
          <div className="mt-3 overflow-hidden rounded-2xl border border-violet-500 bg-white" role="table" aria-label="Flagged segments">
            <div className="grid grid-cols-[minmax(120px,0.8fr)_1.8fr_80px] gap-3 border-b border-violet-300 bg-violet-100 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" role="row">
              <span role="columnheader">Reason</span>
              <span role="columnheader">Excerpt</span>
              <span role="columnheader">Impact</span>
            </div>
            {report.suspiciousSegments.map((segment) => (
              <div className="grid grid-cols-1 gap-3 border-b border-slate-100 px-4 py-3 text-sm text-slate-700 last:border-b-0 sm:grid-cols-[minmax(120px,0.8fr)_1.8fr_80px]" role="row" key={segment.id}>
                <span role="cell" className="font-medium text-slate-900">{segment.reason}</span>
                <span role="cell">{segment.excerpt}</span>
                <span role="cell" className="font-semibold text-rose-700">-{segment.scoreImpact}</span>
              </div>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
