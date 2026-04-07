import type {
  ChangeEventHandler,
  ClipboardEventHandler,
  KeyboardEventHandler,
} from "react";
import { SessionAlert } from "../types";

interface WritingEditorProps {
  text: string;
  isSessionActive: boolean;
  alerts: SessionAlert[];
  onChange: ChangeEventHandler<HTMLTextAreaElement>;
  onKeyDown: KeyboardEventHandler<HTMLTextAreaElement>;
  onPaste: ClipboardEventHandler<HTMLTextAreaElement>;
}

export function WritingEditor({
  text,
  isSessionActive,
  alerts,
  onChange,
  onKeyDown,
  onPaste,
}: WritingEditorProps) {
  return (
    <section className="animate-floatIn rounded-[24px] border border-amber-500 bg-gradient-to-br from-amber-50 to-orange-100 p-5 shadow-soft" aria-labelledby="writing-title">
      <div>
        <h2 id="writing-title" className="mb-5 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
          Writing Workspace
        </h2>
        <p className="mt-2 text-lg leading-6 text-slate-700">
          Write naturally while Vi-Notes tracks behavioral metadata in the background.
        </p>
      </div>

      <label className="mb-4 mt-4 block text-base font-semibold text-slate-900" htmlFor="writing-editor">
        Document Draft
      </label>
      <textarea
        id="writing-editor"
        className="mt-2 min-h-[320px] w-full resize-y rounded-2xl border border-amber-400 bg-white px-4 py-4 text-slate-900 shadow-inner outline-none transition placeholder:text-slate-500 focus:border-amber-600 focus:ring-4 focus:ring-amber-100"
        value={text}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        aria-describedby="editor-help"
        placeholder="Start your session and write your content here..."
      />
      <p id="editor-help" className="mt-3 text-sm leading-6 text-slate-700">
        You can draft anytime. Click Start Session when you want behavioral monitoring and verification to begin.
      </p>

      <div className="mt-4 grid gap-2" aria-live="polite">
        {alerts.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-black">
            No session alerts yet.
          </p>
        ) : (
          alerts.map((alert) => (
            <p
              key={alert.id}
              className={`rounded-xl px-3 py-2 text-sm ${
                alert.level === "warning"
                  ? "border border-amber-200 bg-amber-50 text-amber-900"
                  : "border border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
            >
              {alert.message}
            </p>
          ))
        )}
      </div>
    </section>
  );
}
