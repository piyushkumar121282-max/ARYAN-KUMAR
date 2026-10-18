import React from 'react';
import { CodeFile } from '../types';

interface SidebarProps {
  files: CodeFile[];
  activeFileId: string | null;
  activePlan: string;
  onFileSelect: (id: string) => void;
  onNewFile: () => void;
  onDeleteFile: (id: string) => void;
  onOpenPlans: () => void;
  onOpenVIP: () => void;
  onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  files, 
  activeFileId, 
  activePlan,
  onFileSelect, 
  onNewFile,
  onDeleteFile,
  onOpenPlans,
  onOpenVIP,
  onCloseMobile
}) => {
  const isFreePlan = activePlan === 'FREE';
  const isProMax = activePlan === 'PRO_MAX';
  const fileLimitReached = isFreePlan && files.length >= 100;

  const handleSelect = (id: string) => {
    onFileSelect(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <div className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col h-full shadow-2xl z-20 shrink-0">
      <div className="p-4 sm:p-6 flex items-center justify-between border-b border-white/5">
        <div className="flex flex-col">
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Workspace</h2>
          {isFreePlan ? (
            <span className="text-[9px] text-amber-500/60 font-medium">
              {files.length}/100 Apps Used
            </span>
          ) : (
            <span className="text-[9px] text-slate-400 font-medium">
              {files.length} Apps Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button 
            onClick={fileLimitReached ? onOpenPlans : onNewFile}
            className={`p-1.5 rounded-lg transition-all duration-300 active:scale-90 ${
              fileLimitReached 
                ? 'text-amber-500/50 hover:bg-amber-500/10 cursor-help' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title={fileLimitReached ? "100 App Limit Reached - Upgrade for more" : "Create New App"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Close drawer button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 md:hidden"
              title="Close Explorer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        {isProMax && (
          <button 
            onClick={() => {
              onOpenVIP();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full mb-4 group relative overflow-hidden p-3 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-600/20 to-black border border-amber-500/30 transition-all hover:border-amber-500 active:scale-95 text-left"
          >
            <div className="relative z-10 flex items-center space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Neural Suite</div>
                <div className="text-[11px] sm:text-[12px] font-bold text-white uppercase tracking-tighter">VIP ROOM</div>
              </div>
            </div>
          </button>
        )}

        {files.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="text-[11px] text-slate-600 italic font-light">Elegance in simplicity.<br/>No files present.</div>
          </div>
        ) : (
          files.map(file => (
            <div 
              key={file.id}
              onClick={() => handleSelect(file.id)}
              className={`group px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between cursor-pointer rounded-xl transition-all duration-300 ${
                activeFileId === file.id 
                  ? 'bg-gradient-to-r from-amber-500/10 to-transparent text-amber-400 font-bold' 
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center space-x-2.5 truncate">
                <div className={`${activeFileId === file.id ? 'text-amber-500' : 'text-slate-600'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-[12px] sm:text-[13px] font-mono truncate tracking-wide">{file.name}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFile(file.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-600 hover:text-red-400 transition-all"
                title="Delete file"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 border-t border-white/5">
        <button 
          onClick={() => {
            onOpenPlans();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full py-3 px-3 rounded-xl bg-gradient-to-br from-amber-200 via-amber-500 to-amber-700 text-black text-[11px] font-black uppercase tracking-[0.15em] flex items-center justify-center space-x-2 transition-all duration-300 active:scale-[0.98] shadow-xl hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span>{isFreePlan ? 'Upgrade Suite' : `${activePlan.replace('_', ' ')} Active`}</span>
        </button>
        <div className="flex flex-col items-center justify-center space-y-1">
          <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,1)]"></div>
            <span>Aryan {activePlan.replace('_', ' ')}</span>
          </div>
          {isFreePlan && (
            <span className="text-[8px] uppercase tracking-widest text-slate-600 font-bold">100 App Limit</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
