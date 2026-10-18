import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ToolAction } from '../types';
import { GeminiSparkleIcon } from './GeminiThinkingModal';

interface ChatPanelProps {
  messages: ChatMessage[];
  activePlan: string;
  onSendMessage: (content: string, action: ToolAction) => void;
  isProcessing: boolean;
  onOpenPlans: () => void;
  onCloseMobile?: () => void;
}

const thinkingPhrases = [
  "Gemini 3 Pro is thinking...",
  "Synthesizing app architecture...",
  "Writing executable HTML5 & JS...",
  "Assembling live application runner..."
];

const mobileQuickPrompts = [
  { text: "Make a snake game", action: ToolAction.GENERATE },
  { text: "Make a calculator", action: ToolAction.GENERATE },
  { text: "⚡ Fix current app bugs", action: ToolAction.FIX },
  { text: "🎨 Change color to cyan", action: ToolAction.CHANGE },
  { text: "🚀 Make app 35% faster", action: ToolAction.CHANGE },
  { text: "🔄 Add reset button", action: ToolAction.CHANGE }
];

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  messages, 
  activePlan, 
  onSendMessage, 
  isProcessing,
  onOpenPlans,
  onCloseMobile
}) => {
  const [input, setInput] = useState('');
  const [action, setAction] = useState<ToolAction>(ToolAction.GENERATE);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isFreePlan = activePlan === 'FREE';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  useEffect(() => {
    if (!isProcessing) return;
    const interval = setInterval(() => {
      setPhraseIdx(prev => (prev + 1) % thinkingPhrases.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    let targetAction = action;
    const lower = input.toLowerCase();

    // Auto-detect intent if user leaves action on GENERATE
    if (action === ToolAction.GENERATE) {
      if (/(fix|bug|broken|error|repair|heal|debug|not working|crash)/i.test(lower)) {
        targetAction = ToolAction.FIX;
      } else if (/(change|modify|tweak|update|add|make it|switch|turn|palette)/i.test(lower)) {
        targetAction = ToolAction.CHANGE;
      }
    }

    onSendMessage(input, targetAction);
    setInput('');
  };

  const handleQuickPrompt = (prompt: string, promptAction: ToolAction = ToolAction.GENERATE) => {
    if (isProcessing) return;
    onSendMessage(prompt, promptAction);
  };

  return (
    <div className="w-full md:w-[380px] lg:w-[420px] bg-[#0a0a0a] border-l border-white/5 flex flex-col h-full z-10 shrink-0 pt-safe">
      {/* Header */}
      <div className="p-3.5 sm:p-5 border-b border-white/5 flex flex-col space-y-2.5 sm:space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GeminiSparkleIcon className="w-4 h-4" size={16} />
            <h2 className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500">Gemini Concierge</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex space-x-1">
              <div className="w-1 h-1 rounded-full bg-amber-500/30"></div>
              <div className="w-1 h-1 rounded-full bg-amber-500/60"></div>
              <div className="w-1 h-1 rounded-full bg-amber-500"></div>
            </div>

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 md:hidden active:scale-95"
                title="Close AI Chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        
        <div className="relative">
          <select 
            value={action}
            onChange={(e) => setAction(e.target.value as ToolAction)}
            className="w-full appearance-none bg-white/5 text-[10px] sm:text-[11px] text-amber-200/80 border border-white/10 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 outline-none focus:border-amber-500/50 transition-all cursor-pointer font-bold uppercase tracking-wider"
          >
            <option value={ToolAction.GENERATE}>Engine: Generate Real App</option>
            <option value={ToolAction.FIX}>⚡ Engine: Self-Fix & Heal Bug</option>
            <option value={ToolAction.CHANGE}>✨ Engine: Change / Evolve App</option>
            {!isFreePlan && <option value={ToolAction.MISTAKE_FINDER}>Engine: Find Mistakes (PRO)</option>}
            {!isFreePlan && <option value={ToolAction.DUBBLE_CHECK}>Engine: Dubble Check (PRO)</option>}
            {!isFreePlan && <option value={ToolAction.EXPLAIN}>Engine: Insight (PRO)</option>}
            {(activePlan === 'MAX' || activePlan === 'PRO_MAX') && (
              <option value={ToolAction.TRIPPLE_CHECK}>Engine: Tripple Check (MAX)</option>
            )}
            {(activePlan === 'MAX' || activePlan === 'PRO_MAX') && (
              <option value={ToolAction.REFACTOR}>Engine: Optimize (MAX)</option>
            )}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-amber-500/50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          {isFreePlan && (
            <div className="mt-1.5 text-[8px] sm:text-[9px] text-amber-500/60 font-bold uppercase tracking-wider text-center cursor-pointer hover:underline" onClick={onOpenPlans}>
              Self-Fix & Change Core Active • Upgrade to PRO for Dubble Check
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 sm:space-y-5 modal-scroll">
        {messages.length === 0 && (
          <div className="text-center py-6 sm:py-10 px-2 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
              <GeminiSparkleIcon className="w-6 h-6" size={24} />
            </div>
            <p className="text-[11px] font-light tracking-wide text-slate-400 max-w-xs mx-auto leading-relaxed">
              Ask Gemini to make any app. It will synthesize live code and render it immediately!
            </p>

            {/* Quick Prompts for fast mobile touch */}
            <div className="pt-2 flex flex-wrap gap-1.5 justify-center max-w-xs mx-auto">
              {mobileQuickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(p.text, p.action)}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 text-[10px] font-mono text-slate-300 hover:text-amber-400 transition-all active:scale-95 disabled:opacity-50"
                >
                  {p.text}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[94%] sm:max-w-[90%] p-3 sm:p-4 text-xs sm:text-[13px] leading-relaxed tracking-wide ${
              msg.role === 'user' 
                ? 'bg-amber-600 text-white rounded-2xl rounded-tr-none shadow-md shadow-amber-900/10' 
                : msg.type === 'error' 
                  ? 'bg-red-500/10 text-red-300 border border-red-500/20 rounded-2xl rounded-tl-none' 
                  : 'bg-white/5 text-slate-200 border border-white/10 rounded-2xl rounded-tl-none'
            }`}>
              {msg.role === 'assistant' && (
                <div className="flex items-center space-x-1.5 mb-1 pb-1 border-b border-white/5">
                  <GeminiSparkleIcon className="w-3 h-3 text-amber-500" size={12} />
                  <span className="text-[9px] font-mono text-amber-400 font-bold uppercase tracking-wider">Gemini App Engine</span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {/* Gemini Thinking Animation State in Chat */}
        {isProcessing && (
          <div className="flex justify-start animate-in fade-in duration-300">
            <div className="bg-[#111] rounded-2xl p-3 sm:p-4 border border-amber-500/30 shadow-lg flex items-center space-x-2.5 max-w-[95%]">
              <div className="relative w-6 h-6 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping"></div>
                <GeminiSparkleIcon className="w-4 h-4 animate-spin [animation-duration:4s]" size={16} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-mono text-white font-medium truncate">
                  {thinkingPhrases[phraseIdx]}
                </span>
                <span className="text-[8px] text-amber-500 font-mono">
                  Synthesizing real interactive application...
                </span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="p-2.5 sm:p-4 border-t border-white/5 bg-[#0a0a0a] pb-safe">
        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isProcessing}
            placeholder={isProcessing ? "Gemini is coding..." : "e.g. make a flappy bird game..."}
            className="w-full bg-[#111] border border-white/10 text-xs sm:text-sm rounded-xl py-2.5 sm:py-3.5 pl-3.5 sm:pl-5 pr-11 sm:pr-12 focus:outline-none focus:border-amber-500/50 transition-all placeholder-slate-600 disabled:opacity-50 text-slate-100"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2 h-7 w-7 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-black flex items-center justify-center transition-all shadow-md active:scale-90"
            title="Ask Gemini to build this app"
          >
            {isProcessing ? (
              <GeminiSparkleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" size={16} />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;
