import React, { useRef } from 'react';
import { CodeFile, ToolAction } from '../types';

interface EditorProps {
  file: CodeFile | null;
  activePlan: string;
  onChange: (content: string) => void;
  onRunAction?: (action: ToolAction) => void;
  onOpenPlans?: () => void;
  onOpenVIP?: () => void;
  onOpenPreview?: () => void;
}

const Editor: React.FC<EditorProps> = ({ 
  file, 
  activePlan, 
  onChange,
  onRunAction,
  onOpenPlans,
  onOpenPreview
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isFreePlan = activePlan === 'FREE';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isFreePlan) return;
    
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      
      const newValue = value.substring(0, start) + "  " + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  if (!file) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-700 bg-[#050505] p-4 sm:p-8 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[500px] h-[280px] sm:h-[500px] bg-amber-500/5 blur-[100px] rounded-full"></div>
        
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-16 sm:w-16 mb-3 sm:mb-4 text-amber-500/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
        <h3 className="text-base sm:text-xl font-light text-slate-200 mb-1.5 sm:mb-2 tracking-widest uppercase">Canvas Empty</h3>
        <p className="max-w-xs text-[11px] sm:text-xs text-slate-500 leading-relaxed tracking-wider mb-5 sm:mb-6 px-4">
          Select an app or ask Gemini to generate one to edit and preview it live.
        </p>

        {isFreePlan && onOpenPlans && (
          <button
            onClick={onOpenPlans}
            className="px-4 py-2 rounded-lg bg-amber-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-amber-400 transition-all active:scale-95 shadow-md"
          >
            Upgrade to Pro
          </button>
        )}
      </div>
    );
  }

  const lineCount = file.content.split('\n').length;

  return (
    <div className="flex-1 flex flex-col bg-[#050505] h-full overflow-hidden">
      {/* Editor Header - Responsive & Mobile Fitted */}
      <div className="flex items-center px-2.5 sm:px-6 py-2 sm:py-3 bg-[#0a0a0a] border-b border-white/5 justify-between select-none shrink-0 gap-1.5 sm:gap-2">
        <div className="flex items-center space-x-1.5 sm:space-x-2 truncate min-w-0">
          <div className={`w-2 h-2 rounded-full shrink-0 ${isFreePlan ? 'bg-slate-600' : 'bg-amber-500'}`}></div>
          <span className="text-[11px] sm:text-[12px] font-mono text-slate-300 font-semibold tracking-wider truncate">
            {file.name}
          </span>
          {isFreePlan && (
            <span className="text-[8px] sm:text-[9px] text-amber-500/70 uppercase tracking-tighter shrink-0">
              (Read Only)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
          {/* Prominent Preview App Button */}
          {onOpenPreview && (
            <button
              onClick={onOpenPreview}
              className="px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] sm:text-xs font-mono font-bold flex items-center space-x-1 transition-all shadow-sm active:scale-95"
              title="Preview and Run this Application in the Live Runner"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>▶ Run</span>
            </button>
          )}

          {!isFreePlan && onRunAction && (
            <>
              <button
                onClick={() => onRunAction(ToolAction.MISTAKE_FINDER)}
                className="hidden xs:inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] sm:text-[10px] font-mono text-slate-300 hover:text-white transition-all uppercase tracking-wider"
              >
                Mistakes
              </button>
              <button
                onClick={() => onRunAction(ToolAction.DUBBLE_CHECK)}
                className="hidden sm:inline-block px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[10px] font-mono text-amber-500 transition-all uppercase tracking-wider font-bold"
              >
                Dubble Check
              </button>
            </>
          )}

          <div className="px-1.5 sm:px-2 py-0.5 rounded border border-white/10 text-[8px] sm:text-[9px] text-slate-500 uppercase font-black tracking-wider bg-white/5">
            {file.language}
          </div>
        </div>
      </div>
      
      {/* Editor Body */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="w-8 sm:w-14 bg-[#050505] text-right pr-1 sm:pr-4 py-3 sm:py-6 select-none border-r border-white/5 text-slate-700 font-mono text-[10px] sm:text-[11px] leading-5 sm:leading-7 overflow-hidden shrink-0">
          {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        
        <textarea
          ref={textareaRef}
          value={file.content}
          onChange={(e) => !isFreePlan && onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={isFreePlan}
          spellCheck={false}
          className={`flex-1 bg-transparent text-slate-200 font-mono text-xs sm:text-[13px] p-2.5 sm:p-5 leading-5 sm:leading-7 focus:outline-none resize-none overflow-auto selection:bg-amber-500/20 ${
            isFreePlan ? 'cursor-not-allowed opacity-80' : ''
          }`}
          placeholder={
            isFreePlan 
              ? "Upgrade to ARYAN PRO to manually change codes..." 
              : "Craft your masterwork..."
          }
        />
        
        {isFreePlan && (
          <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
        )}
      </div>
    </div>
  );
};

export default Editor;
