"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
  const [animatedText, setAnimatedText] = useState([
    "Loading persona matrix...",
    "Calibrating argument strength...",
    "Initializing logic modules...",
    "Engaging Critic AI...",
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedText((prevText) => [
        ...prevText.slice(-3),
        `Evaluating argument ${Math.floor(Math.random() * 100)}%...`,
      ]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <Navbar />
      <div className="bg-gradient-to-b from-purple-900 to-black text-white min-h-screen">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Column - Main Content */}
            <div className="lg:w-1/2">
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                AI Argument Evaluation Challenge
              </h1>
              <p className="text-xl mt-6 text-gray-300 leading-relaxed">
                Channel the greatest minds in history. Build an AI that argues
                like Einstein, debates like Obama, and reasons like Aristotle —
                then let the Critic AI judge your work.
              </p>

              <div className="mt-8 space-y-4">
                <h2 className="text-2xl font-semibold text-purple-400">
                  Competition Format
                </h2>
                <ul className="list-disc list-inside space-y-2 text-gray-300">
                  <li>Pick a persona from 19 legendary thinkers</li>
                  <li>Choose a topic and take a stance: FOR or AGAINST</li>
                  <li>Submit exactly 10 arguments as structured JSON</li>
                  <li>Get scored by Critic AI across 5 criteria</li>
                </ul>
              </div>

              <div className="mt-10">
                <Link href="/about">
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:opacity-90 transform hover:scale-105 transition duration-200 shadow-lg">
                    Accept the Challenge ⚡
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Column - Animation Panel */}
            <div className="lg:w-1/2 mt-12 lg:mt-0">
              <div className="bg-black/50 backdrop-blur-sm border border-purple-500/30 rounded-lg p-6 shadow-2xl">
                <div className="text-purple-400 font-mono text-sm">
                  <div>$ initialize_argument_evaluator.sh</div>
                  <div className="h-[240px] overflow-hidden">
                    {animatedText.map((text, index) => (
                      <p
                        key={index}
                        className="text-pink-400 opacity-70"
                        style={{ animation: "fadeIn 0.5s ease-in" }}
                      >
                        {text}
                      </p>
                    ))}
                  </div>
                  <div className="mt-4">
                    <span className="animate-pulse">▌</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}