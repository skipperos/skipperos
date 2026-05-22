import { useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  Anchor,
  Brain,
  ClipboardCopy,
  FileText,
  Mic,
  MicOff,
  Save,
} from "lucide-react";
import { Link } from "react-router-dom";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../services/firebase";

type ReportType =
  | "General vessel log"
  | "Trip log"
  | "Maintenance log"
  | "Incident log"
  | "Fuel log"
  | "Crew log";

function getCurrentUserSafe() {
  return new Promise<typeof auth.currentUser>((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

export default function AIReport() {
  const [notes, setNotes] = useState("");
  const [reportType, setReportType] =
    useState<ReportType>("General vessel log");
  const [report, setReport] = useState("");
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  async function handleGenerate(e: FormEvent) {
    e.preventDefault();

    if (!notes.trim()) {
      setError("Please add notes before generating a report.");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      setCopied(false);
      setSaved(false);
      setReport("");

      const response = await fetch("/api/ai/generate-log", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          notes,
          reportType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "AI report generation failed.");
      }

      setReport(data.report || "");
    } catch (err: any) {
      console.error("AI generate error:", err);
      setError(err.message || "Something went wrong while generating the log.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!report) return;

    await navigator.clipboard.writeText(report);
    setCopied(true);
  }

  async function handleSaveReport() {
    if (!report.trim()) {
      setError("Generate a report before saving.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const user = await getCurrentUserSafe();

      if (!user) {
        throw new Error("You must be logged in to save AI reports.");
      }

      await addDoc(collection(db, "aiReports"), {
        ownerId: user.uid,
        reportType,
        notes,
        report,
        createdAt: serverTimestamp(),
        source: "gemini",
      });

      setSaved(true);
    } catch (err: any) {
      console.error("Save AI report error:", err);
      setError(err.message || "Could not save the AI report.");
    } finally {
      setSaving(false);
    }
  }

  function startVoiceNote() {
    setError("");

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice notes are not supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-ZA";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        }
      }

      if (finalTranscript.trim()) {
        setNotes((current) =>
          `${current}${current.trim() ? "\n" : ""}${finalTranscript.trim()}`
        );
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);
      setError("Voice note error. Please try again.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }

  function stopVoiceNote() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    setIsListening(false);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-700 text-white">
              <Anchor size={24} />
            </div>

            <div>
              <p className="text-xl font-black text-slate-900">
                AI Log Generator
              </p>
              <p className="text-xs text-slate-500">
                Turn rough notes into clean vessel records
              </p>
            </div>
          </Link>

          <Link
            to="/dashboard"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Back to dashboard
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-3xl bg-gradient-to-br from-ocean-900 to-slate-950 p-8 text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-ocean-100">
            <Brain size={26} />
          </div>

          <h1 className="mt-5 text-3xl font-black md:text-4xl">
            Convert messy skipper notes into a professional report.
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            Type notes or record a voice note. Gemini will format it into a
            clean operational log for review.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-50 text-ocean-700">
                <FileText size={22} />
              </div>

              <div>
                <h2 className="text-xl font-black text-slate-900">
                  Captain notes
                </h2>
                <p className="text-sm text-slate-600">
                  Type notes or use voice input.
                </p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="mt-6">
              <label className="text-sm font-bold text-slate-700">
                Report type
              </label>

              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as ReportType)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-ocean-700"
              >
                <option>General vessel log</option>
                <option>Trip log</option>
                <option>Maintenance log</option>
                <option>Incident log</option>
                <option>Fuel log</option>
                <option>Crew log</option>
              </select>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {!isListening ? (
                  <button
                    type="button"
                    onClick={startVoiceNote}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Mic size={18} />
                    Start voice note
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopVoiceNote}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700"
                  >
                    <MicOff size={18} />
                    Stop voice note
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setNotes("")}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Clear notes
                </button>
              </div>

              {isListening && (
                <p className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  Listening... speak clearly.
                </p>
              )}

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={14}
                className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-ocean-700"
                placeholder="Example: Left harbour 5:30, 4 crew, fuel 80%, engine temp normal, returned 14:10, minor leak noticed near pump, 300kg hake caught..."
              />

              <button
                type="submit"
                disabled={generating}
                className="mt-5 w-full rounded-xl bg-ocean-700 px-5 py-3 font-bold text-white hover:bg-ocean-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? "Generating with Gemini..." : "Generate AI report"}
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

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!report}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ClipboardCopy size={16} />
                  {copied ? "Copied" : "Copy"}
                </button>

                <button
                  type="button"
                  onClick={handleSaveReport}
                  disabled={!report || saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-ocean-700 px-4 py-2 text-sm font-bold text-white hover:bg-ocean-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : saved ? "Saved" : "Save"}
                </button>
              </div>
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

            {saved && (
              <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                AI report saved to Firestore.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}