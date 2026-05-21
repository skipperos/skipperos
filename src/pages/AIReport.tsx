import { useState } from "react";
import type { FormEvent } from "react";
import { Brain, ClipboardCopy, FileText } from "lucide-react";
import { generateOperationalReport } from "../utils/reportUtils";

export default function AIReport() {
  const [notes, setNotes] = useState("");
  const [report, setReport] = useState("");
  const [copied, setCopied] = useState(false);

  function handleGenerate(e: FormEvent) {
    e.preventDefault();
    setCopied(false);

    const generatedReport = generateOperationalReport(notes);
    setReport(generatedReport);
  }

  async function handleCopy() {
    if (!report) return;

    await navigator.clipboard.writeText(report);
    setCopied(true);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-ocean-700">AI Reports</p>
          <h1 className="mt-1 text-3xl font-black text-slate-900">
            AI log generator
          </h1>
          <p className="mt-2 text-slate-600">
            Turn rough skipper notes into cleaner operational records, reports,
            and compliance-ready summaries.
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-gradient-to-br from-ocean-900 to-slate-950 p-8 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-ocean-100">
          <Brain size={26} />
        </div>

        <h2 className="mt-5 text-3xl font-black md:text-4xl">
          Convert messy skipper notes into a professional report.
        </h2>

        <p className="mt-3 max-w-2xl text-slate-300">
          Paste rough trip notes, maintenance notes, incident details, or
          voice-note transcripts. SkipperOS will format them into a cleaner
          operational record.
        </p>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-700">
              <FileText size={22} />
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900">Captain notes</h2>
              <p className="text-sm text-slate-600">
                Paste rough notes from the trip or operation.
              </p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="mt-6">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={14}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-ocean-700"
              placeholder="Example: Left harbour 5:30, 4 crew, fuel 80%, engine temp normal, returned 14:10, minor leak noticed near pump, 300kg hake caught..."
            />

            <button
              type="submit"
              className="mt-5 w-full rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900"
            >
              Generate report
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-700">
                <Brain size={22} />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Generated report
                </h2>
                <p className="text-sm text-slate-600">
                  Review before using for official records.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!report}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ClipboardCopy size={16} />
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="mt-6 min-h-[360px] rounded-2xl bg-slate-950 p-5 text-sm leading-6 text-slate-100">
            {report ? (
              <pre className="whitespace-pre-wrap font-mono">{report}</pre>
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center text-center text-slate-400">
                Your generated report will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}