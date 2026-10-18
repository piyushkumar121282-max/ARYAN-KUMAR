import React, { useEffect, useState } from 'react';

interface GeminiThinkingProps {
  isThinking: boolean;
  userPrompt?: string;
}

const thinkingSteps = [
  "Analyzing application requirements & structure...",
  "Designing interactive UI components and state logic...",
  "Writing executable production HTML5, CSS & JavaScript...",
  "Running self-audit for zero runtime errors...",
  "Packaging application into live runner..."
];

export const GeminiSparkleIcon: React.FC<{ className?: string; size?: number }> = ({ className = "w-6 h-6", size = 24 }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#93c5fd" />
        <stop offset="50%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#fbbf24" />
      </linearGradient>
    </defs>
    <path 
      d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" 
      fill="url(#geminiGrad)"
    />
  </svg>
);

const GeminiThinkingModal: React.FC<GeminiThinkingProps> = ({ isThinking, userPrompt }) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isThinking) {
      setStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % thinkingSteps.length);
    }, 1400);

    return () => clearInterval(interval);
  }, [isThinking]);

  if (!isThinking) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Background Ambient Pulse */}
      <div className="absolute w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-amber-500/10 blur-[130px] rounded-full animate-pulse pointer-events-none"></div>

      <div className="relative w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-3xl p-5 sm:p-8 bg-[#0a0a0a] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center overflow-hidden">
        {/* Subtle Top Glow Line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>

        {/* Gemini Logo Animation Container */}
        <div className="relative mx-auto w-16 h-16 sm:w-24 sm:h-24 mb-4 sm:mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-ping opacity-25"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-amber-500/20 via-purple-500/15 to-blue-500/20 blur-lg animate-pulse"></div>
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#111] border border-white/10 flex items-center justify-center shadow-xl">
            <GeminiSparkleIcon className="w-7 h-7 sm:w-10 sm:h-10 animate-[spin_6s_linear_infinite]" size={36} />
          </div>
        </div>

        {/* Title */}
        <div className="inline-flex items-center space-x-1.5 sm:space-x-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-mono uppercase tracking-[0.2em] text-amber-500 mb-2 sm:mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Gemini Thinking Core</span>
        </div>

        <h3 className="text-lg sm:text-xl font-light tracking-wide text-white mb-1.5 sm:mb-2">
          Building Real Application...
        </h3>

        {userPrompt && (
          <p className="text-[11px] sm:text-xs text-slate-400 italic font-mono mb-4 sm:mb-6 line-clamp-2 px-2">
            "{userPrompt}"
          </p>
        )}

        {/* Thinking Step Tracker */}
        <div className="bg-[#050505] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5 text-left mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-3 text-[11px] sm:text-xs text-amber-400/90 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0"></span>
            <span className="transition-all duration-300 leading-snug">
              {thinkingSteps[stepIndex]}
            </span>
          </div>

          {/* Progress Shimmer Bar */}
          <div className="w-full h-1 bg-white/5 rounded-full mt-2.5 sm:mt-3 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-500/40 via-amber-400 to-amber-500/40 w-1/2 rounded-full animate-[shimmer_1.5s_infinite] translate-x-[-100%] [animation-iteration-count:infinite]"></div>
          </div>
        </div>

        <div className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-widest font-mono">
          Creating real executable code • Live runner ready
        </div>
      </div>
    </div>
  );
};

export default GeminiThinkingModal;
