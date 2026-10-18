import React from 'react';

interface UpgradeCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: string;
}

const tierDetails: Record<string, {
  title: string;
  badge: string;
  tagline: string;
  features: string[];
}> = {
  FREE: {
    title: 'Aryan App Maker Free',
    badge: 'Essential Tier',
    tagline: 'Standard Coding Environment Active',
    features: [
      'Infinity AI Chats',
      'Making 100 Apps',
      'Using all language options'
    ]
  },
  PRO: {
    title: 'Aryan App Maker Pro',
    badge: 'Pro Tier Active',
    tagline: '50% Fast Coding & Code Changing Armed',
    features: [
      'Infinity Chats',
      'Changing Codes (Live Edit)',
      '50% Fast Coding',
      'Selecting Mistakes',
      'Dubble Checking Codes'
    ]
  },
  MAX: {
    title: 'Aryan App Maker Max',
    badge: 'Max Tier Active',
    tagline: '200% Fast Coding & Overdrive Armed',
    features: [
      'Infinity Chats',
      'Changing Codes',
      '200% Fast Coding',
      'Selecting Mistakes',
      'Tripple Checking Codes',
      'Speech to Text',
      'Connecting Code'
    ]
  },
  PRO_MAX: {
    title: 'Aryan App Maker Pro Max',
    badge: 'Pro Max Tier Active',
    tagline: '300% Fast Coding & VIP Platform Armed',
    features: [
      'Infinity Chats',
      'Changing Codes',
      '300% Fast Coding',
      'Selecting Mistakes',
      'Dubble Tripple Checking Codes',
      'Speech to Code',
      'VIP AI Platform',
      'Making Infinity Apps',
      'Doing Live & Sharing Screen'
    ]
  }
};

const UpgradeCelebrationModal: React.FC<UpgradeCelebrationModalProps> = ({ isOpen, onClose, tier }) => {
  if (!isOpen) return null;

  const current = tierDetails[tier] || tierDetails['PRO'];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm sm:max-w-lg rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 bg-[#0a0a0a] shadow-2xl text-center">
        {/* Shimmer top line in normal amber */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500/20 via-amber-500 to-amber-500/20"></div>

        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 sm:mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-2 sm:mb-3 text-amber-500">
          {current.badge}
        </div>

        <h2 className="text-lg sm:text-2xl font-light tracking-wide uppercase mb-1 text-slate-100">
          {current.title}
        </h2>
        <p className="text-slate-400 text-[10px] sm:text-xs tracking-wider uppercase font-medium mb-4 sm:mb-6">
          {current.tagline}
        </p>

        <div className="bg-white/5 border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 text-left space-y-1.5 sm:space-y-2 max-h-40 sm:max-h-48 overflow-y-auto modal-scroll">
          <div className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Active Features
          </div>
          {current.features.map((feat, i) => (
            <div key={i} className="flex items-center space-x-2 text-[11px] sm:text-xs text-slate-300">
              <span className="text-amber-500">✓</span>
              <span>{feat}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 sm:py-3.5 rounded-xl bg-amber-500 text-black font-bold text-xs uppercase tracking-widest hover:bg-amber-400 active:scale-95 transition-all shadow-lg"
        >
          Continue to Editor
        </button>
      </div>
    </div>
  );
};

export default UpgradeCelebrationModal;
