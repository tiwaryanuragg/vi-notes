export function ProjectScope() {
  return (
    <section className="animate-floatIn rounded-[24px] border border-sky-500 bg-gradient-to-br from-sky-50 to-blue-100 p-5 shadow-soft" aria-labelledby="scope-title">
      <div>
        <h2 id="scope-title" className="text-xl font-semibold tracking-tight text-slate-900">
          Verification Scope
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          What this session-level frontend currently evaluates in real time.
        </p>
      </div>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
        <li className="rounded-xl border border-sky-400 bg-white px-3 py-2">Keystroke timing metadata without storing raw key content.</li>
        <li className="rounded-xl border border-sky-400 bg-white px-3 py-2">Pause rhythm before punctuation and sentence boundaries.</li>
        <li className="rounded-xl border border-sky-400 bg-white px-3 py-2">Revision and deletion behavior during idea development.</li>
        <li className="rounded-xl border border-sky-400 bg-white px-3 py-2">Pasted text detection and suspicious uniformity indicators.</li>
        <li className="rounded-xl border border-sky-400 bg-white px-3 py-2">Cross-signal confidence scoring for human-authorship likelihood.</li>
      </ul>
    </section>
  );
}
