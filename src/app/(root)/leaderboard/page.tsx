"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

interface LeaderboardEntry {
  name: string;
  score: number;
  persona: string;
  topic: string;
  stance: "FOR" | "AGAINST";
}

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch("/api/leaderboard");
        const data = await response.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const rankIcon = (index: number) => {
    if (index === 0) return "👑";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  const scoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-400";
    if (score >= 70) return "text-blue-400";
    if (score >= 55) return "text-yellow-400";
    return "text-red-400";
  };

  const stanceBadge = (stance: string) =>
    stance === "FOR"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      : "bg-red-500/20 text-red-300 border-red-500/30";

  return (
    <div>
      <Navbar />
      <div className="bg-gradient-to-b from-purple-900 to-black text-white min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Argument Champions
            </h1>
            <p className="text-xl text-gray-300 mt-4">
              Top AI arguers ranked by Critic AI score 🎯
            </p>
          </div>

          <div className="bg-black/30 rounded-xl border border-purple-500/30 overflow-hidden">
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="animate-pulse flex space-x-2">
                  <div className="h-3 w-3 bg-pink-500 rounded-full" />
                  <div className="h-3 w-3 bg-pink-500 rounded-full" />
                  <div className="h-3 w-3 bg-pink-500 rounded-full" />
                </div>
              </div>
            ) : leaderboardData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="text-6xl mb-4">⚡</div>
                <h3 className="text-2xl font-semibold text-pink-400 mb-4 text-center">
                  No Submissions Yet!
                </h3>
                <p className="text-gray-300 text-center mb-6 max-w-md">
                  Be the first to submit your arguments and claim the top spot.
                </p>
                <Link
                  href="/submission"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-lg
                           font-semibold hover:opacity-90 transform hover:scale-105
                           transition duration-200 shadow-lg"
                >
                  Make a Submission
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px]">
                  <thead>
                    <tr className="bg-purple-900/30 border-b border-purple-500/30">
                      <th className="px-5 py-4 text-left text-pink-400 font-bold text-sm w-16">
                        Rank
                      </th>
                      <th className="px-5 py-4 text-left text-pink-400 font-bold text-sm">
                        🎭 Participant
                      </th>
                      <th className="px-5 py-4 text-left text-pink-400 font-bold text-sm">
                        Persona
                      </th>
                      <th className="px-5 py-4 text-left text-pink-400 font-bold text-sm hidden lg:table-cell">
                        Topic
                      </th>
                      <th className="px-5 py-4 text-center text-pink-400 font-bold text-sm">
                        Stance
                      </th>
                      <th className="px-5 py-4 text-right text-pink-400 font-bold text-sm">
                        Score 🔥
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/20">
                    {leaderboardData.map((entry, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-purple-900/20 transition-colors duration-200 ${
                          index === 0 ? "bg-yellow-900/10" : ""
                        }`}
                      >
                        {/* Rank */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 font-mono text-sm">
                              {index + 1}
                            </span>
                            {rankIcon(index) && (
                              <span>{rankIcon(index)}</span>
                            )}
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-5 py-4 font-semibold text-white">
                          {entry.name}
                        </td>

                        {/* Persona */}
                        <td className="px-5 py-4">
                          <span className="text-purple-300 text-sm">
                            {entry.persona}
                          </span>
                        </td>

                        {/* Topic */}
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span
                            className="text-gray-400 text-xs leading-tight line-clamp-2 max-w-xs block"
                            title={entry.topic}
                          >
                            {entry.topic}
                          </span>
                        </td>

                        {/* Stance */}
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${stanceBadge(
                              entry.stance
                            )}`}
                          >
                            {entry.stance}
                          </span>
                        </td>

                        {/* Score */}
                        <td className="px-5 py-4 text-right">
                          <span
                            className={`font-black text-lg font-mono ${scoreColor(
                              entry.score
                            )}`}
                          >
                            {entry.score}
                          </span>
                          <span className="text-gray-600 text-xs">/100</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="text-center mt-6 text-sm text-gray-400 italic space-y-1">
            <p>
              New submissions may take a few minutes to appear while evaluation
              is in progress.
            </p>
            <p>Only the highest score per participant is shown.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}