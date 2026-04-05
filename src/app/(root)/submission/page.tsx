"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

interface CriteriaBreakdown {
  logic: number;
  clarity: number;
  creativity: number;
  persuasiveness: number;
  persona_alignment: number;
}

interface ArgumentFeedback {
  argument_id: string;
  score: number;
  feedback: string;
}

interface EvaluationResult {
  total_score: number;
  criteria_breakdown: CriteriaBreakdown;
  argument_wise_feedback: ArgumentFeedback[];
  overall_feedback: string;
}

interface SubmissionResponse {
  message: string;
  score: number;
  isNewBest: boolean;
  remaining_submissions: number;
  evaluation: EvaluationResult;
}

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

const CRITERIA_LABELS: Record<keyof CriteriaBreakdown, string> = {
  logic: "Logic",
  clarity: "Clarity",
  creativity: "Creativity",
  persuasiveness: "Persuasiveness",
  persona_alignment: "Persona Alignment",
};

const CRITERIA_ICONS: Record<keyof CriteriaBreakdown, string> = {
  logic: "🧠",
  clarity: "💡",
  creativity: "✨",
  persuasiveness: "🎯",
  persona_alignment: "🎭",
};

function ScoreBar({ value, max = 20 }: { value: number; max?: number }) {
  const pct = Math.round((value / max) * 100);
  const color =
    pct >= 80
      ? "from-emerald-500 to-teal-400"
      : pct >= 60
      ? "from-blue-500 to-cyan-400"
      : pct >= 40
      ? "from-yellow-500 to-amber-400"
      : "from-red-500 to-orange-400";

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-mono text-white/80 w-12 text-right">
        {value}/{max}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────

export default function Submission() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notebookUrl, setNotebookUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SubmissionResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const validateNotebookUrl = (val: string) =>
    val.startsWith("https://www.kaggle.com/");

  const validateJson = async (f: File): Promise<boolean> => {
    try {
      const text = await f.text();
      const data = JSON.parse(text);
      if (
        !data.persona || !data.persona_id || !data.topic ||
        !data.stance || !Array.isArray(data.arguments)
      ) return false;
      if (data.arguments.length !== 10) return false;
      for (const a of data.arguments) {
        if (!a.argument_id || !a.content) return false;
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setIsSubmitting(true);

    try {
      if (!validateEmail(email)) throw new Error("Invalid email address.");
      if (!validateNotebookUrl(notebookUrl))
        throw new Error("Invalid Kaggle notebook URL.");
      if (!file) throw new Error("Please upload a submission JSON file.");
      if (!(await validateJson(file)))
        throw new Error(
          "Invalid JSON format. Must have persona, topic, stance, and exactly 10 arguments."
        );

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("notebookUrl", notebookUrl);
      formData.append("submission", file);

      const res = await fetch("/api/submission", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Submission failed. Please try again.");
      }

      setResult(data);
      setName("");
      setEmail("");
      setNotebookUrl("");
      setFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="bg-gradient-to-b from-purple-900 to-black text-white min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
                Submit Your Arguments ⚡
              </h1>
              <p className="text-xl text-gray-300">
                Channel your chosen persona and make your case. The Critic AI will judge.
              </p>
            </div>

            {/* ── Form Card ───────────────────────── */}
            {!result && (
              <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-8 mb-8 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-left text-sm font-medium text-gray-300 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-purple-500/30
                               focus:border-pink-500/50 focus:outline-none text-white transition-all
                               hover:border-purple-400/50"
                      placeholder="Enter your name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-left text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-purple-500/30
                               focus:border-pink-500/50 focus:outline-none text-white transition-all
                               hover:border-purple-400/50"
                      placeholder="you@example.com"
                    />
                  </div>

                  {/* Notebook URL */}
                  <div>
                    <label className="block text-left text-sm font-medium text-gray-300 mb-2">
                      Kaggle Notebook URL
                    </label>
                    <input
                      type="url"
                      value={notebookUrl}
                      onChange={(e) => setNotebookUrl(e.target.value)}
                      required
                      placeholder="https://www.kaggle.com/..."
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-purple-500/30
                               focus:border-pink-500/50 focus:outline-none text-white transition-all
                               hover:border-purple-400/50"
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-left text-sm font-medium text-gray-300 mb-2">
                      Submission File (JSON)
                    </label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      required
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-purple-500/30
                               focus:border-pink-500/50 focus:outline-none text-white transition-all
                               hover:border-purple-400/50 file:bg-gradient-to-r file:from-purple-600
                               file:to-pink-600 file:border-0 file:rounded-lg file:px-4 file:py-2
                               file:text-white file:mr-4 file:hover:opacity-90 cursor-pointer"
                    />
                    {file && (
                      <p className="text-xs text-purple-300 mt-1 text-left">
                        ✓ {file.name}
                      </p>
                    )}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-left animate-shake">
                      ❌ {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4
                             rounded-lg font-semibold hover:opacity-90 transform hover:scale-105
                             transition duration-300 shadow-lg disabled:opacity-50 text-lg"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Evaluating with Critic AI...
                      </span>
                    ) : (
                      <span>Submit for Evaluation ⚡</span>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ── Evaluation Result ───────────────── */}
            {result && (
              <div className="space-y-6 animate-fadeIn">
                {/* Total Score Card */}
                <div className="bg-gradient-to-r from-purple-900/60 to-pink-900/40 border border-purple-500/40 rounded-2xl p-8 text-center shadow-xl">
                  <p className="text-gray-300 text-lg mb-2">{result.message}</p>
                  {result.isNewBest && (
                    <span className="inline-block bg-yellow-500/20 text-yellow-300 text-xs px-3 py-1 rounded-full border border-yellow-500/30 mb-4">
                      🏆 New Personal Best!
                    </span>
                  )}
                  <div className="text-8xl font-black bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    {result.score}
                    <span className="text-3xl text-gray-400">/100</span>
                  </div>
                  <p className="text-gray-400 mt-2">
                    Submissions remaining today:{" "}
                    <span className="text-pink-400 font-semibold">
                      {result.remaining_submissions}
                    </span>
                  </p>
                </div>

                {/* Criteria Breakdown */}
                <div className="bg-black/30 border border-purple-500/30 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-semibold text-pink-400 mb-5">
                    📊 Score Breakdown
                  </h3>
                  <div className="space-y-4">
                    {(
                      Object.entries(
                        result.evaluation.criteria_breakdown
                      ) as [keyof CriteriaBreakdown, number][]
                    ).map(([key, val]) => (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-gray-300 text-sm font-medium">
                            {CRITERIA_ICONS[key]} {CRITERIA_LABELS[key]}
                          </span>
                        </div>
                        <ScoreBar value={val} max={20} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Feedback */}
                <div className="bg-black/30 border border-purple-500/30 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-semibold text-pink-400 mb-3">
                    🗣️ Overall Feedback
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {result.evaluation.overall_feedback}
                  </p>
                </div>

                {/* Argument-wise Feedback */}
                <div className="bg-black/30 border border-purple-500/30 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-xl font-semibold text-pink-400 mb-5">
                    🔍 Argument-by-Argument Feedback
                  </h3>
                  <div className="space-y-3">
                    {result.evaluation.argument_wise_feedback.map((arg) => (
                      <div
                        key={arg.argument_id}
                        className="flex gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-600/30 text-purple-300 font-bold text-sm border border-purple-500/30">
                            #{arg.argument_id}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`text-sm font-bold ${
                                arg.score >= 8
                                  ? "text-emerald-400"
                                  : arg.score >= 6
                                  ? "text-blue-400"
                                  : arg.score >= 4
                                  ? "text-yellow-400"
                                  : "text-red-400"
                              }`}
                            >
                              {arg.score}/10
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm leading-relaxed">
                            {arg.feedback}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Again */}
                <div className="text-center">
                  <button
                    onClick={() => {
                      setResult(null);
                      setError(null);
                    }}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-4
                             rounded-lg font-semibold hover:opacity-90 transform hover:scale-105
                             transition duration-300 shadow-lg text-lg"
                  >
                    Submit Another Entry ⚡
                  </button>
                </div>
              </div>
            )}

            {/* ── Guidelines ─────────────────────── */}
            {!result && (
              <div className="bg-gradient-to-r from-red-900/20 to-pink-900/20 p-8 rounded-2xl border border-red-500/30 shadow-xl">
                <h2 className="text-2xl font-semibold text-red-400 mb-6">
                  ⚠️ Submission Guidelines
                </h2>
                <div className="space-y-4 text-red-200">
                  <div className="flex items-start space-x-4 p-4 bg-black/20 rounded-xl">
                    <span className="text-2xl">🔒</span>
                    <p className="text-left">
                      Your Kaggle notebook{" "}
                      <strong>must be public</strong>. Private notebooks will
                      result in disqualification.
                    </p>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-black/20 rounded-xl">
                    <span className="text-2xl">📋</span>
                    <p className="text-left">
                      Submission JSON must contain{" "}
                      <strong>exactly 10 arguments</strong> with valid persona,
                      topic, and stance from the provided lists.
                    </p>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-black/20 rounded-xl">
                    <span className="text-2xl">⏱️</span>
                    <p className="text-left">
                      Maximum <strong>3 submissions per day</strong>. Only your
                      highest score appears on the leaderboard.
                    </p>
                  </div>
                  <div className="flex items-start space-x-4 p-4 bg-black/20 rounded-xl">
                    <span className="text-2xl">⛔</span>
                    <p className="text-left">
                      Hate speech, extreme defamation, or prohibited content
                      results in <strong>permanent disqualification</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}