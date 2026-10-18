import React from 'react';

interface SelfHealingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerFix: () => void;
  onApplyChange: (prompt: string) => void;
  isProcessing?: boolean;
}

const SelfHealingModal: React.FC<SelfHealingModalProps> = ({
  isOpen,
  onClose,
  onTriggerFix,
  onApplyChange,
  isProcessing = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-lg bg-[#0a0a0d] border border-emerald-500/30 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              🛡️
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
                Self-Repair & Adaptation Core
              </h3>
              <p className="text-[10px] text-emerald-400 font-mono">
                Status: ACTIVE • Autonomous AI Guardian
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* Core Capabilities */}
        <div className="py-4 space-y-3.5 text-xs">
          <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
            <div className="flex items-center space-x-2 text-emerald-300 font-bold font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>1. Autonomous Self-Healing ("Fix Itself")</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Whenever a JavaScript runtime error, broken selector, or logic exception is detected in the running preview, the system intercepts it and triggers Gemini to surgically heal the code automatically.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1">
            <div className="flex items-center space-x-2 text-amber-300 font-bold font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>2. Adaptive App Evolution ("Change If User Says")</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Tell the AI to change anything (e.g. <em>"change the theme to neon cyan"</em>, <em>"make it faster"</em>, <em>"add a restart button"</em>). The engine mutates and evolves the current code without wiping existing features!
            </p>
          </div>
        </div>

        {/* Quick Execution Actions */}
        <div className="pt-2 border-t border-white/5 space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
            Quick Self-Repair & Adaptation Actions:
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => { onTriggerFix(); onClose(); }}
              disabled={isProcessing}
              className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold text-left transition-all active:scale-95 flex items-center space-x-2 disabled:opacity-50"
            >
              <span>⚡</span>
              <span>Run Diagnostic Auto-Fix</span>
            </button>

            <button
              onClick={() => { onApplyChange("Change color theme to vibrant Cyber Cyan"); onClose(); }}
              disabled={isProcessing}
              className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold text-left transition-all active:scale-95 flex items-center space-x-2 disabled:opacity-50"
            >
              <span>🎨</span>
              <span>Change to Cyber Cyan</span>
            </button>

            <button
              onClick={() => { onApplyChange("Make the application 35% faster with responsive controls"); onClose(); }}
              disabled={isProcessing}
              className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono text-[11px] font-bold text-left transition-all active:scale-95 flex items-center space-x-2 disabled:opacity-50"
            >
              <span>🚀</span>
              <span>Make App 35% Faster</span>
            </button>

            <button
              onClick={() => { onApplyChange("Add a restart / reset button to the app"); onClose(); }}
              disabled={isProcessing}
              className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-mono text-[11px] font-bold text-left transition-all active:scale-95 flex items-center space-x-2 disabled:opacity-50"
            >
              <span>🔄</span>
              <span>Add Reset Button</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelfHealingModal;
