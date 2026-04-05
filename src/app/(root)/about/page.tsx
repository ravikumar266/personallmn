"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SideNav from "@/components/SideNav";
import Link from "next/link";

export default function About() {
  return (
    <div>
      <Navbar />
      <div className="bg-gradient-to-b from-purple-900 to-black text-white min-h-screen">
        <div className="container mx-auto px-6 py-12 relative">
          <SideNav />

          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-8">
              AI Argument Evaluation Challenge
            </h1>

            {/* ── Section 1 ── */}
            <section id="persona-selection" className="mb-16 scroll-mt-20">
              <h2 className="text-3xl font-semibold text-purple-400 mb-6">
                1. Persona & Topic Selection
              </h2>
              <div className="bg-black/30 p-6 rounded-xl border border-purple-500/30">
                <ul className="list-disc list-inside space-y-3 text-gray-300">
                  <li>
                    Choose a{" "}
                    <span className="text-pink-400">
                      persona from the provided list
                    </span>{" "}
                    — your LLM must argue as that persona.
                  </li>
                  <li>
                    Select one{" "}
                    <span className="text-pink-400">
                      debate topic from the provided list
                    </span>
                    .
                  </li>
                  <li>
                    Pick a{" "}
                    <span className="text-pink-400">stance: FOR or AGAINST</span>{" "}
                    the topic.
                  </li>
                  <li>
                    All three must exactly match values in the{" "}
                    <code className="text-purple-300 bg-black/40 px-1.5 py-0.5 rounded text-sm">
                      argument_datasets.json
                    </code>
                    .
                  </li>
                </ul>
              </div>
            </section>

            {/* ── Section 2 ── */}
            <section id="submission-requirements" className="mb-16 scroll-mt-20">
              <h2 className="text-3xl font-semibold text-purple-400 mb-6">
                2. Submission Requirements
              </h2>
              <div className="space-y-6">
                <div className="bg-black/30 p-6 rounded-xl border border-purple-500/30">
                  <h3 className="text-2xl font-semibold text-pink-400 mb-4">
                    JSON File Submission
                  </h3>
                  <p className="text-gray-300 mb-4">
                    Submit a{" "}
                    <strong className="text-white">.json file</strong> with
                    exactly this structure:
                  </p>
                  <pre className="bg-black/50 p-4 rounded-lg text-sm text-green-300 overflow-x-auto border border-green-900/30">
{`{
  "persona": "Albert Einstein",
  "persona_id": "1",
  "topic": "Should AI replace human decision-making...",
  "stance": "AGAINST",
  "arguments": [
    { "argument_id": "1", "content": "..." },
    ...
    { "argument_id": "10", "content": "..." }
  ]
}`}
                  </pre>
                  <ul className="list-disc list-inside space-y-2 text-gray-300 mt-4">
                    <li>Exactly <strong className="text-white">10 arguments</strong> required.</li>
                    <li><code className="text-purple-300 text-sm">persona</code> and <code className="text-purple-300 text-sm">persona_id</code> must match the dataset.</li>
                    <li><code className="text-purple-300 text-sm">topic</code> must exactly match a provided topic string.</li>
                    <li><code className="text-purple-300 text-sm">stance</code> must be <code className="text-purple-300 text-sm">"FOR"</code> or <code className="text-purple-300 text-sm">"AGAINST"</code>.</li>
                  </ul>
                </div>

                <div className="bg-black/30 p-6 rounded-xl border border-purple-500/30">
                  <h3 className="text-2xl font-semibold text-pink-400 mb-4">
                    Kaggle Notebook Submission
                  </h3>
                  <ul className="list-disc list-inside space-y-3 text-gray-300">
                    <li>Your notebook must show the model development process</li>
                    <li>Fine-tuning or prompt engineering approach</li>
                    <li>Code for generating the submission JSON</li>
                    <li>Must be <strong className="text-white">public</strong></li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ── Section 3 ── */}
            <section id="scoring-criteria" className="mb-16 scroll-mt-20">
              <h2 className="text-3xl font-semibold text-purple-400 mb-6">
                3. Scoring Criteria
              </h2>
              <div className="bg-black/30 rounded-xl border border-purple-500/30 overflow-hidden">
                <table className="w-full">
                  <thead className="border-b border-purple-500/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-pink-400">Criteria</th>
                      <th className="px-6 py-4 text-left text-pink-400">Points</th>
                      <th className="px-6 py-4 text-left text-pink-400 hidden md:table-cell">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/30">
                    {[
                      ["🧠 Logic", "20", "Sound reasoning, absence of fallacies"],
                      ["💡 Clarity", "20", "Precision, coherence, no ambiguity"],
                      ["✨ Creativity", "20", "Originality, novel framing, fresh perspective"],
                      ["🎯 Persuasiveness", "20", "Rhetorical impact, ability to shift opinion"],
                      ["🎭 Persona Alignment", "20", "Authentic representation of chosen persona"],
                    ].map(([crit, pts, desc]) => (
                      <tr key={crit}>
                        <td className="px-6 py-4">{crit}</td>
                        <td className="px-6 py-4">{pts}</td>
                        <td className="px-6 py-4 hidden md:table-cell text-gray-300">{desc}</td>
                      </tr>
                    ))}
                    <tr className="bg-purple-900/20">
                      <td className="px-6 py-4 text-pink-400 font-bold">Total</td>
                      <td className="px-6 py-4 text-pink-400 font-bold">100</td>
                      <td className="px-6 py-4 hidden md:table-cell text-gray-400">Evaluated per submission by Critic AI</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Section 4 ── */}
            <section id="competition-rules" className="mb-16 scroll-mt-20">
              <h2 className="text-3xl font-semibold text-purple-400 mb-6">
                4. Competition Rules
              </h2>
              <div className="bg-black/30 p-6 rounded-xl border border-purple-500/30">
                <ul className="list-disc list-inside space-y-3 text-gray-300">
                  <li><span className="text-purple-300">Solo Participation</span> – One participant per entry</li>
                  <li><span className="text-purple-300">Submission Limit</span> – Maximum 3 submissions per day</li>
                  <li><span className="text-purple-300">Leaderboard</span> – Only highest score per participant shown</li>
                  <li><span className="text-purple-300">Ethical Boundaries</span> – No hate speech or prohibited content</li>
                  <li><span className="text-purple-300">Critic AI Decision is Final</span> – No appeals entertained</li>
                </ul>
              </div>
            </section>

            {/* ── Section 5 ── */}
            <section id="technical-requirements" className="mb-16 scroll-mt-20">
              <h2 className="text-3xl font-semibold text-purple-400 mb-6">
                5. Technical Requirements
              </h2>
              <div className="bg-black/30 p-6 rounded-xl border border-purple-500/30">
                <ul className="list-disc list-inside space-y-3 text-gray-300">
                  <li>Use <span className="text-purple-300">any LLM framework</span> (GPT-4, LLaMA, Mistral, etc.)</li>
                  <li>Submit code via <span className="text-purple-300">Kaggle Notebook</span></li>
                  <li>Arguments must be generated programmatically — not handwritten</li>
                  <li>Ensure code is <span className="text-purple-300">public, modular, and documented</span></li>
                </ul>
              </div>
            </section>

            {/* ── Section 6 ── */}
            <section id="resources" className="mb-16 scroll-mt-20">
              <h2 className="text-3xl font-semibold text-purple-400 mb-6">
                6. Resources
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Link
                  href="/files/argument_datasets.json"
                  target="_blank"
                  className="bg-black/30 p-6 rounded-xl border border-purple-500/30 hover:border-pink-500/50
                           hover:bg-purple-900/20 transition-all duration-300 group"
                >
                  <h3 className="text-xl font-semibold text-pink-400 mb-2 flex items-center">
                    Argument Datasets
                    <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Full list of personas, topics, and stances
                  </p>
                </Link>

                <Link
                  href="/files/sample_submission.json"
                  target="_blank"
                  className="bg-black/30 p-6 rounded-xl border border-purple-500/30 hover:border-pink-500/50
                           hover:bg-purple-900/20 transition-all duration-300 group"
                >
                  <h3 className="text-xl font-semibold text-pink-400 mb-2 flex items-center">
                    Sample Submission
                    <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Example JSON with correct format
                  </p>
                </Link>

                <Link
                  href="https://www.kaggle.com/"
                  target="_blank"
                  className="bg-black/30 p-6 rounded-xl border border-purple-500/30 hover:border-pink-500/50
                           hover:bg-purple-900/20 transition-all duration-300 group"
                >
                  <h3 className="text-xl font-semibold text-pink-400 mb-2 flex items-center">
                    Kaggle
                    <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Host your notebook here
                  </p>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}