"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gradient-to-r from-purple-900 to-black text-white border-b border-purple-500/30 shadow-lg backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="font-bold">
            <Link href="/" className="text-2xl tracking-tight hover:opacity-90 transition-opacity">
              Persona<span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent font-extrabold">LLM</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {[
              { href: "/", label: "Home" },
              { href: "/about", label: "About" },
              { href: "/leaderboard", label: "Leaderboard" },
            ].map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="font-medium text-gray-200 hover:text-pink-400 transition-all duration-300 relative group"
              >
                {label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-400 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
            <Link
              href="/submission"
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 rounded-lg font-semibold
                       hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5
                       transition-all duration-300 active:scale-95"
            >
              Make a Submission!
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="w-6 h-0.5 bg-white mb-1.5" />
            <div className="w-6 h-0.5 bg-white mb-1.5" />
            <div className="w-6 h-0.5 bg-white" />
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div className={`md:hidden ${isOpen ? "block" : "hidden"} py-4 space-y-4 px-2`}>
          {[
            { href: "/", label: "Home" },
            { href: "/about", label: "About" },
            { href: "/leaderboard", label: "Leaderboard" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block font-medium text-gray-200 hover:text-pink-400 hover:bg-white/5 p-2 rounded-lg transition-all duration-300"
              onClick={() => setIsOpen(false)}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/submission"
            className="block bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg font-semibold
                     text-center hover:shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5
                     transition-all duration-300 active:scale-95"
            onClick={() => setIsOpen(false)}
          >
            Make a Submission!
          </Link>
        </div>
      </div>
    </div>
  );
}