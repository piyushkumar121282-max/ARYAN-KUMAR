import React, { useState } from 'react';
import { PlanTier } from '../types';

interface TopNavbarProps {
  activePlan: string;
  onSelectPlan: (planId: string) => void;
  onOpenPlans: () => void;
  onOpenVIP: () => void;
  isAudioMuted: boolean;
  onToggleAudio: () => void;
  onToggleSidebar?: () => void;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
  onOpenSelfHealing?: () => void;
}

const tiers: { id: PlanTier; label: string; shortLabel: string; price: string }[] = [
  { id: 'FREE', label: 'Aryan Free', shortLabel: 'Free', price: 'RS=0' },
  { id: 'PRO', label: 'Aryan Pro', shortLabel: 'Pro', price: 'RS=100' },
  { id: 'MAX', label: 'Aryan Max', shortLabel: 'Max', price: 'RS=500' },
  { id: 'PRO_MAX', label: 'Aryan Pro Max', shortLabel: 'Pro Max', price: 'RS=1000' },
];

const TopNavbar: React.FC<TopNavbarProps> = ({
  activePlan,
  onSelectPlan,
  onOpenPlans,
  onOpenVIP,
  isAudioMuted,
  onToggleAudio,
  onToggleSidebar,
  onToggleChat,
  isChatOpen,
  onOpenSelfHealing
}) => {
  const isProMax = activePlan === 'PRO_MAX';
  const [showMobileTierDropdown, setShowMobileTierDropdown] = useState(false);

  return (
    <header className="h-12 sm:h-14 border-b border-white/5 bg-[#0a0a0a] px-2.5 sm:px-6 flex items-center justify-between z-30 select-none shrink-0 relative pt-safe">
      {/* Left: Mobile Menu Toggle + Brand Title */}
      <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 md:hidden active:scale-95"
            title="Toggle File Explorer"
            aria-label="Files"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
          <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center font-black text-black text-xs shrink-0 shadow-sm">
            A
          </div>
          <span className="font-bold text-[11px] sm:text-xs tracking-wider uppercase text-slate-200 truncate">
            <span className="hidden xs:inline">Aryan App Maker</span>
            <span className="xs:hidden">Aryan</span>
          </span>
          {/* Mobile Tier Badge button */}
          <button
            onClick={() => setShowMobileTierDropdown(!showMobileTierDropdown)}
            className="text-[9px] px-1.5 sm:px-2 py-0.5 rounded border border-amber-500/30 text-amber-500 uppercase tracking-widest font-mono flex items-center space-x-1 shrink-0 bg-amber-500/5 active:scale-95"
          >
            <span>{activePlan.replace('_', ' ')}</span>
            <span className="text-[7px]">▼</span>
          </button>
        </div>
      </div>

      {/* Desktop Plan Switcher (Hidden on mobile) */}
      <div className="hidden md:flex items-center space-x-1.5 bg-[#050505] p-1 rounded-xl border border-white/5">
        {tiers.map((t) => {
          const isActive = activePlan === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectPlan(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 ${
                isActive
                  ? 'bg-amber-500 text-black font-bold shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>{t.label}</span>
              <span className={`text-[10px] font-mono ${isActive ? 'text-black/80' : 'text-slate-500'}`}>
                ({t.price})
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
        {onOpenSelfHealing && (
          <button
            onClick={onOpenSelfHealing}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold transition-all active:scale-95"
            title="Autonomous Self-Repair & App Evolution Engine is active"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="hidden xs:inline">Self-Repair</span>
            <span className="xs:hidden">⚡</span>
          </button>
        )}

        {isProMax && (
          <button
            onClick={onOpenVIP}
            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95"
          >
            VIP
          </button>
        )}

        <button
          onClick={onOpenPlans}
          className="hidden sm:inline-block px-3 py-1.5 rounded-lg border border-white/10 hover:border-amber-500/40 text-[11px] font-medium text-slate-300 hover:text-amber-500 transition-all bg-white/5"
        >
          Plans
        </button>

        <button
          onClick={onToggleAudio}
          className="p-1.5 sm:p-2 rounded-lg border border-white/5 hover:border-white/20 text-slate-400 hover:text-slate-200 transition-all active:scale-95"
          title={isAudioMuted ? "Audio Muted" : "Audio Active"}
          aria-label="Toggle Sound"
        >
          {isAudioMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
        </button>

        {/* Mobile AI Chat Toggle Button */}
        {onToggleChat && (
          <button
            onClick={onToggleChat}
            className={`p-1.5 sm:p-2 rounded-lg border transition-all md:hidden flex items-center space-x-1 active:scale-95 ${
              isChatOpen 
                ? 'bg-amber-500 text-black border-amber-400 font-bold' 
                : 'bg-white/5 border-white/10 text-amber-500'
            }`}
            title="Toggle AI Concierge Chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span className="text-[10px] uppercase font-bold">AI</span>
          </button>
        )}
      </div>

      {/* Mobile Tier Dropdown Menu */}
      {showMobileTierDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40 md:hidden" 
            onClick={() => setShowMobileTierDropdown(false)}
          />
          <div className="absolute top-12 left-3 right-3 bg-[#0e0e11] border border-white/15 rounded-2xl p-2 shadow-2xl z-50 md:hidden flex flex-col space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="text-[9px] uppercase tracking-widest text-slate-500 px-3 py-1 font-bold">
              Select Aryan Tier:
            </div>
            {tiers.map((t) => {
              const isActive = activePlan === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onSelectPlan(t.id);
                    setShowMobileTierDropdown(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium flex items-center justify-between ${
                    isActive ? 'bg-amber-500 text-black font-bold' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>{t.label}</span>
                  <span className="text-[10px] font-mono opacity-80">{t.price}</span>
                </button>
              );
            })}
            <button
              onClick={() => {
                onOpenPlans();
                setShowMobileTierDropdown(false);
              }}
              className="w-full text-center text-[10px] text-amber-500 font-bold uppercase tracking-wider py-2 hover:underline pt-2 border-t border-white/5"
            >
              Compare All Features →
            </button>
          </div>
        </>
      )}
    </header>
  );
};

export default TopNavbar;
