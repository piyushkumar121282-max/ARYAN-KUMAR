import React, { useState } from 'react';

interface PricingModalProps {
  isOpen: boolean;
  activePlan?: string;
  onClose: () => void;
  onSelectPlan: (planId: string) => void;
}

const plans = [
  {
    name: "ARYAN APP MAKER FREE",
    shortName: "FREE",
    id: "FREE",
    price: "RS=0",
    tagline: "The Essential Entry",
    goldGradient: "from-[#fcd34d] via-[#fbbf24] to-[#d97706]", 
    silverText: "text-[#e2e8f0]", 
    features: [
      "Infinity chats",
      "making 100 apps",
      "using all language options"
    ]
  },
  {
    name: "ARYAN APP MAKER PRO",
    shortName: "PRO",
    id: "PRO",
    price: "RS=100",
    tagline: "The Standard of Excellence",
    goldGradient: "from-[#fbbf24] via-[#f59e0b] to-[#b45309]", 
    silverText: "text-[#f1f5f9]", 
    highlight: true,
    features: [
      "Infinity chats",
      "changing codes (Live Edit)",
      "50% fast coding",
      "selecting mistakes",
      "dubble checking codes"
    ]
  },
  {
    name: "ARYAN APP MAKER MAX",
    shortName: "MAX",
    id: "MAX",
    price: "RS=500",
    tagline: "A New Dimension of Power",
    goldGradient: "from-[#fde68a] via-[#fbbf24] to-[#92400e]", 
    silverText: "text-[#cbd5e1]", 
    features: [
      ".Infinity chats",
      ".changing codes",
      ".200% fast coding",
      ".selecting mistakes",
      ".tripple checking codes",
      ".speech to text",
      ".connecting code into"
    ]
  },
  {
    name: "ARYAN APP MAKER PRO MAX",
    shortName: "PRO MAX",
    id: "PRO_MAX",
    price: "RS=1000",
    tagline: "The Sovereign Experience",
    goldGradient: "from-[#78350f] via-[#fbbf24] to-[#451a03]", 
    silverText: "text-white", 
    isDark: true,
    features: [
      ".Infinity chats",
      ".changing codes",
      ".300% fast coding",
      ".selecting mistakes",
      ".dubble tripple checking codes",
      ".speech to code",
      ".converting code into",
      ".using all features for free",
      ".vip ai platform",
      ".making infinity apps",
      ".selecting files",
      ".doing live",
      ".sharing screen"
    ]
  }
];

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, activePlan = 'FREE', onClose, onSelectPlan }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileSelectedTab, setMobileSelectedTab] = useState<number>(() => {
    const idx = plans.findIndex(p => p.id === activePlan);
    return idx !== -1 ? idx : 1;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-[40px] animate-in fade-in duration-300 overflow-hidden pt-safe pb-safe">
      {/* Moving Atmospheric Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[150px] rounded-full animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/10 blur-[150px] rounded-full animate-pulse [animation-delay:2s] pointer-events-none"></div>

      {/* Main Scrollable Container */}
      <div className="relative w-full max-w-[95rem] max-h-[96dvh] max-h-[96vh] flex flex-col items-center overflow-y-auto modal-scroll px-2 sm:px-4">
        
        {/* Navigation / Close */}
        <div className="sticky top-0 w-full flex justify-between items-center z-50 py-2 sm:py-3 bg-black/60 backdrop-blur-md mb-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500 font-bold">Aryan Plans</span>
          </div>
          <button 
            onClick={onClose}
            className="flex items-center space-x-1.5 sm:space-x-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/10 text-white transition-all active:scale-95"
          >
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase text-[#cbd5e1]">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Header Text */}
        <div className="text-center mb-4 sm:mb-12 relative w-full px-2">
          <div className="inline-block px-3 sm:px-6 py-1 mb-2 sm:mb-4 rounded-full border border-[#fbbf24]/20 bg-[#fbbf24]/5 backdrop-blur-md">
            <span className="text-[8px] sm:text-[9px] font-black tracking-[0.3em] sm:tracking-[0.5em] text-[#fbbf24] uppercase">
              Aryan Ecosystem Selection
            </span>
          </div>
          <h1 className="text-xl sm:text-4xl md:text-5xl font-light text-[#e2e8f0] mb-1 sm:mb-2 tracking-wider sm:tracking-[0.4em] uppercase">
            Choose Your Plan
          </h1>
          <p className="text-[#94a3b8] tracking-wider text-[10px] sm:text-xs uppercase font-light">
            Pro, Max & Pro Max Experience
          </p>

          {/* Mobile Quick Tier Tabs */}
          <div className="flex md:hidden items-center justify-center space-x-1 mt-4 p-1 bg-[#141417] rounded-xl border border-white/10 max-w-sm mx-auto">
            {plans.map((p, pIdx) => {
              const isSelected = mobileSelectedTab === pIdx;
              const isCurrent = activePlan === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setMobileSelectedTab(pIdx)}
                  className={`flex-1 py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold transition-all truncate relative ${
                    isSelected 
                      ? 'bg-amber-500 text-black shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{p.shortName}</span>
                  {isCurrent && (
                    <span className="block text-[7px] font-mono opacity-80">(Active)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Grid - Desktop shows all 4 cards, Mobile shows the selected tab or all */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 px-1 sm:px-6 w-full pb-10 sm:pb-20 max-w-7xl">
          {plans.map((plan, idx) => {
            const isCurrent = activePlan === plan.id;
            const isVisibleOnMobile = mobileSelectedTab === idx;

            return (
              <div 
                key={idx} 
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSelectPlan(plan.id)}
                className={`relative flex flex-col min-h-[460px] sm:min-h-[560px] rounded-2xl sm:rounded-[3rem] p-5 sm:p-10 transition-all duration-300 cursor-pointer overflow-hidden border-2 shadow-2xl ${
                  !isVisibleOnMobile ? 'hidden md:flex' : 'flex'
                } ${
                  isCurrent ? 'border-amber-400 ring-2 ring-amber-400/40' : 'border-white/10'
                } ${
                  hoveredIndex === idx ? 'scale-[1.01] -translate-y-1 shadow-[#fbbf24]/20' : 'scale-100 shadow-black'
                }`}
              >
                {/* GOLD CARD BACKGROUND */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.goldGradient} transition-all duration-500 opacity-95 group-hover:opacity-100`}></div>
                
                {/* Silver/Chrome Reflection Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-[1500ms] ease-in-out pointer-events-none"></div>
                
                {/* High-Status Badge */}
                {isCurrent ? (
                  <div className="absolute top-4 sm:top-7 right-4 sm:right-7 px-2.5 sm:px-4 py-1 bg-black text-amber-400 text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg border border-amber-400 z-20">
                    Active
                  </div>
                ) : plan.highlight ? (
                  <div className="absolute top-4 sm:top-7 right-4 sm:right-7 px-2.5 sm:px-4 py-1 bg-[#e2e8f0] text-black text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg border border-white/20 z-20">
                    Elite
                  </div>
                ) : null}

                {/* Card Title Section */}
                <div className="mb-4 sm:mb-6 relative z-10 shrink-0">
                  <div className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] mb-1 sm:mb-2 drop-shadow-sm ${plan.silverText} opacity-80`}>
                    {plan.name}
                  </div>
                  <div className={`text-2xl sm:text-4xl font-extralight tracking-tight mb-1 ${plan.silverText} drop-shadow-md`}>
                    {plan.price}
                  </div>
                  <div className={`text-[9px] sm:text-[11px] font-bold uppercase tracking-widest ${plan.silverText} opacity-90 underline decoration-[#fbbf24]/50 underline-offset-4 sm:underline-offset-8`}>
                    {plan.tagline}
                  </div>
                </div>

                {/* Artistic Divider */}
                <div className="relative h-px w-full mb-4 sm:mb-6 overflow-hidden bg-white/30 shadow-[0_0_10px_rgba(255,255,255,0.3)] shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent h-full w-40 translate-x-[-100%] group-hover:animate-[shimmer_3s_infinite]"></div>
                </div>

                {/* SCROLLABLE Feature Selection */}
                <div className="flex-1 min-h-0 overflow-y-auto pr-1 sm:pr-2 feature-scroll relative z-10 space-y-2 sm:space-y-4 max-h-56 sm:max-h-72">
                  <h4 className={`sticky top-0 pb-1 text-[8px] sm:text-[9px] font-black tracking-[0.3em] uppercase ${plan.silverText} opacity-40 backdrop-blur-[2px]`}>
                    INCLUDED:
                  </h4>
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center space-x-2.5 sm:space-x-4 py-0.5 sm:py-1">
                      <div className={`w-1.5 h-1.5 rounded-full bg-white/50 shrink-0`}></div>
                      <span className={`text-[11px] sm:text-[13px] tracking-wide font-medium ${plan.silverText} opacity-85`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* SUBSCRIBE BUTTON */}
                <div className="mt-4 sm:mt-6 relative z-10 shrink-0">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPlan(plan.id);
                    }}
                    className="w-full relative h-11 sm:h-14 rounded-full bg-gradient-to-b from-white to-[#e2e8f0] p-[2px] shadow-2xl transition-all duration-300 active:scale-95"
                  >
                    <div className="h-full w-full rounded-full bg-white flex items-center justify-center relative overflow-hidden transition-colors hover:bg-[#f8fafc]">
                      <span className="relative z-20 text-[9px] sm:text-[11px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-black">
                        {isCurrent ? 'Current Plan' : 'Select Plan'}
                      </span>
                    </div>
                  </button>
                  <div className="mt-2 text-center">
                    <span className={`text-[8px] font-bold uppercase tracking-widest ${plan.silverText} opacity-40`}>Cancel Anytime</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Swipe Indicators */}
        <div className="flex md:hidden items-center justify-center space-x-2 mb-6">
          {plans.map((_, i) => (
            <button
              key={i}
              onClick={() => setMobileSelectedTab(i)}
              className={`h-2 rounded-full transition-all ${
                mobileSelectedTab === i ? 'w-6 bg-amber-500' : 'w-2 bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingModal;
