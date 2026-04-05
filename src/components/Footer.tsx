export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-purple-900 to-black text-white py-6 border-t border-purple-500/30">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-6">

        {/* Left — Branding */}
        <div className="text-center md:text-left mb-4 md:mb-0">
          <h2 className="text-xl font-bold">
            Persona<span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">LLM</span>
          </h2>
          <p className="text-gray-300 text-sm">AI Argument Evaluation Challenge</p>
        </div>

        {/* Center — Status */}
        <div className="hidden md:block">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
            <p className="text-gray-300 text-sm">
              Critic AI: <span className="text-pink-400">Active</span>
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-col items-center md:items-end">
          <p className="text-gray-300 text-sm mb-2">
            © {new Date().getFullYear()} PersonaLLM
          </p>
          <div className="flex space-x-4">
            <a
              href="https://github.com/axios-iiitl"
              className="text-gray-300 hover:text-pink-400 transition"
            >
              Github
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}