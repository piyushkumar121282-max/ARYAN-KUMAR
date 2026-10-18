import React, { useState, useEffect, useRef, useMemo } from 'react';
import { CodeFile, AppRuntimeError } from '../types';

interface LivePreviewProps {
  files: CodeFile[];
  activeFile: CodeFile | null;
  onConsoleLog?: (msg: string) => void;
  onSwitchToCode?: () => void;
  onAutoFix?: (errorInfo: AppRuntimeError) => void;
  onApplyChange?: (changePrompt: string) => void;
  isProcessing?: boolean;
}

function cleanHtmlCode(raw: string): string {
  if (!raw) return '';
  let cleaned = raw.trim();
  if (cleaned.startsWith('```html')) {
    cleaned = cleaned.replace(/^```html\s*/i, '').replace(/```\s*$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim();
  }
  return cleaned;
}

const quickChangeChips = [
  { label: "⚡ Self-Fix Code", prompt: "Diagnose and fix all bugs, syntax issues, and errors in the current code" },
  { label: "🎨 Cyan Theme", prompt: "Change the color palette and accents to Cyber Cyan" },
  { label: "🟣 Neon Violet", prompt: "Change the color palette to Neon Violet and Purple" },
  { label: "🚀 Speed Up", prompt: "Make the app animation and game speed 35% faster" },
  { label: "🔄 Reset Button", prompt: "Add a prominent reset / restart button to the app" },
  { label: "📱 Larger Buttons", prompt: "Make the touch controls and interactive buttons larger for mobile" }
];

const LivePreview: React.FC<LivePreviewProps> = ({ 
  files, 
  activeFile, 
  onConsoleLog, 
  onSwitchToCode,
  onAutoFix,
  onApplyChange,
  isProcessing = false
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [key, setKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [runtimeError, setRuntimeError] = useState<AppRuntimeError | null>(null);
  const [autoHealEnabled, setAutoHealEnabled] = useState(true);
  const [autoHealCountdown, setAutoHealCountdown] = useState<number | null>(null);
  const [customChangeInput, setCustomChangeInput] = useState('');
  const [showChangeBar, setShowChangeBar] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Trigger refresh whenever the active file or its content changes
  useEffect(() => {
    setKey(prev => prev + 1);
    setRuntimeError(null);
    setAutoHealCountdown(null);
  }, [activeFile?.id, activeFile?.content]);

  // Combine files into an executable HTML document
  const bundledHtml = useMemo(() => {
    let rawContent = '';

    // Prioritize active file if available
    if (activeFile && activeFile.content.trim()) {
      const cleaned = cleanHtmlCode(activeFile.content);

      if (activeFile.name.endsWith('.html') || cleaned.includes('<html') || cleaned.includes('<!DOCTYPE') || cleaned.includes('<body') || cleaned.includes('<div') || cleaned.includes('<canvas')) {
        rawContent = cleaned;
      } else {
        // Wrap JS/CSS script in responsive HTML5 document
        rawContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>${activeFile.name}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 16px;
      background: #09090b;
      color: #f8fafc;
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      -webkit-tap-highlight-color: transparent;
    }
  </style>
</head>
<body>
  <div id="app" class="max-w-2xl mx-auto"></div>
  <script>
    try {
      ${cleaned}
    } catch (err) {
      console.error(err);
      window.parent.postMessage({ type: 'APP_RUNTIME_ERROR', message: err.message, stack: err.stack }, '*');
      document.getElementById('app').innerHTML = '<div style="color: #ef4444; font-family: monospace; padding: 12px; background: rgba(239,68,68,0.1); border-radius: 8px;"><h3>Runtime Exception</h3><pre>' + err.message + '</pre></div>';
    }
  </script>
</body>
</html>`;
      }
    } else {
      // Find index.html or another HTML file in files
      const htmlFile = files.find(f => f.name.endsWith('.html') || f.name === 'index.html');
      if (htmlFile && htmlFile.content.trim()) {
        rawContent = cleanHtmlCode(htmlFile.content);
      } else {
        // Clean empty state
        rawContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>Preview Ready</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#09090b] text-slate-300 flex items-center justify-center min-h-screen p-4 sm:p-6 text-center font-sans">
  <div class="max-w-md w-full bg-[#121215] border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
    <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-xl sm:text-2xl">
      ⚡
    </div>
    <h2 class="text-lg sm:text-xl font-bold text-white mb-2">Live App Preview Ready</h2>
    <p class="text-xs text-slate-400 leading-relaxed mb-4">
      Ask Gemini to make an app (e.g. <em>"make a snake game"</em> or <em>"make a calculator"</em>). It has the special ability to fix itself and change whenever you say!
    </p>
  </div>
</body>
</html>`;
      }
    }

    // Always ensure meta viewport is present inside user code for proper mobile rendering
    if (!rawContent.includes('viewport')) {
      rawContent = rawContent.replace('<head>', '<head><meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />');
    }

    // Comprehensive self-healing error listener and telemetry hook
    const telemetryHook = `
<script>
  (function() {
    const _origLog = console.log;
    const _origErr = console.error;

    console.log = function(...args) {
      _origLog.apply(console, args);
      try {
        window.parent.postMessage({ 
          type: 'CONSOLE_LOG', 
          data: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') 
        }, '*');
      } catch (e) {}
    };

    console.error = function(...args) {
      _origErr.apply(console, args);
      try {
        const errStr = args.map(a => typeof a === 'object' ? (a.message || JSON.stringify(a)) : String(a)).join(' ');
        window.parent.postMessage({ 
          type: 'APP_RUNTIME_ERROR', 
          message: errStr, 
          timestamp: Date.now() 
        }, '*');
      } catch (e) {}
    };

    window.onerror = function(message, source, lineno, colno, error) {
      try {
        window.parent.postMessage({
          type: 'APP_RUNTIME_ERROR',
          message: String(message),
          source: String(source || ''),
          lineno: lineno,
          colno: colno,
          stack: error ? error.stack : '',
          timestamp: Date.now()
        }, '*');
      } catch (e) {}
      return false;
    };

    window.addEventListener('unhandledrejection', function(event) {
      try {
        window.parent.postMessage({
          type: 'APP_RUNTIME_ERROR',
          message: 'Unhandled Promise Rejection: ' + (event.reason ? (event.reason.message || String(event.reason)) : 'Promise failed'),
          timestamp: Date.now()
        }, '*');
      } catch (e) {}
    });
  })();
</script>`;

    if (rawContent.includes('<head>')) {
      return rawContent.replace('<head>', `<head>${telemetryHook}`);
    } else {
      return telemetryHook + rawContent;
    }
  }, [files, activeFile, key]);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data) return;

      if (e.data.type === 'CONSOLE_LOG' && onConsoleLog) {
        onConsoleLog(`[APP LOG] ${e.data.data}`);
      } else if (e.data.type === 'CONSOLE_ERROR') {
        if (onConsoleLog) onConsoleLog(`[APP ERR] ${e.data.data}`);
      } else if (e.data.type === 'APP_RUNTIME_ERROR') {
        const errorInfo: AppRuntimeError = {
          message: e.data.message || 'Unknown runtime exception',
          source: e.data.source,
          lineno: e.data.lineno,
          colno: e.data.colno,
          stack: e.data.stack,
          timestamp: Date.now()
        };
        setRuntimeError(errorInfo);
        if (onConsoleLog) {
          onConsoleLog(`🚨 [RUNTIME BUG DETECTED] ${errorInfo.message}`);
        }

        // If autonomous auto-heal is enabled, start countdown
        if (autoHealEnabled && !isProcessing) {
          setAutoHealCountdown(2);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onConsoleLog, autoHealEnabled, isProcessing]);

  // Autonomous auto-healing countdown timer
  useEffect(() => {
    if (autoHealCountdown === null || !runtimeError || isProcessing) return;

    if (autoHealCountdown <= 0) {
      setAutoHealCountdown(null);
      if (onAutoFix && runtimeError) {
        onAutoFix(runtimeError);
      }
      return;
    }

    const timer = setTimeout(() => {
      setAutoHealCountdown(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(timer);
  }, [autoHealCountdown, runtimeError, onAutoFix, isProcessing]);

  const triggerInstantFix = () => {
    setAutoHealCountdown(null);
    if (onAutoFix) {
      onAutoFix(runtimeError || { message: 'General code optimization & repair', timestamp: Date.now() });
    }
  };

  const restartApp = () => {
    setRuntimeError(null);
    setAutoHealCountdown(null);
    setKey(prev => prev + 1);
  };

  const handleApplyCustomChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customChangeInput.trim() || isProcessing) return;
    if (onApplyChange) {
      onApplyChange(customChangeInput.trim());
      setCustomChangeInput('');
    }
  };

  const handleChipClick = (prompt: string) => {
    if (isProcessing) return;
    if (onApplyChange) {
      onApplyChange(prompt);
    }
  };

  const getContainerWidth = () => {
    if (device === 'mobile') return 'w-full sm:max-w-[380px] sm:h-[680px] sm:my-auto';
    if (device === 'tablet') return 'w-full sm:max-w-[768px] sm:h-[85vh] sm:my-auto';
    return 'w-full h-full';
  };

  return (
    <div className={`flex-1 flex flex-col bg-[#050505] overflow-hidden relative ${isFullscreen ? 'fixed inset-0 z-[150] bg-black' : ''}`}>
      {/* Clean Browser Bar - Mobile Optimized */}
      <div className="h-10 sm:h-12 bg-[#0a0a0a] border-b border-white/5 px-2.5 sm:px-4 flex items-center justify-between shrink-0 select-none">
        {/* Left: Window dots & Title */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 min-w-0">
          <div className="hidden xs:flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-red-500/80"></div>
            <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
            <div className="w-2 h-2 rounded-full bg-emerald-500/80"></div>
          </div>
          <span className="text-[11px] sm:text-xs font-mono text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
            <span>Live Preview</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </span>

          {/* Autonomous Self-Heal Status Indicator */}
          <button
            onClick={() => setAutoHealEnabled(!autoHealEnabled)}
            className={`text-[9px] px-1.5 sm:px-2 py-0.5 rounded border flex items-center space-x-1 shrink-0 font-mono transition-all active:scale-95 ${
              autoHealEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-white/5 border-white/10 text-slate-500'
            }`}
            title={autoHealEnabled ? "Autonomous Self-Repair is active (fixes bugs automatically)" : "Self-Repair is paused"}
          >
            <span className={autoHealEnabled ? "animate-pulse" : ""}>{autoHealEnabled ? "🛡️ Auto-Heal: ON" : "🛡️ Auto-Heal: OFF"}</span>
          </button>
        </div>

        {/* Center: Address Bar Simulator (desktop only) */}
        <div className="hidden lg:flex items-center space-x-2 bg-[#050505] border border-white/10 px-4 py-0.5 rounded-full text-[10px] font-mono text-slate-400 w-56 justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="truncate">localhost:3000/{activeFile ? activeFile.name : 'app'}</span>
        </div>

        {/* Right: Controls - Compact on mobile */}
        <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
          {/* Quick Change / Modify Drawer Toggle */}
          <button
            onClick={() => setShowChangeBar(prev => !prev)}
            className={`px-2 py-1 rounded-lg border text-[10px] sm:text-xs font-mono font-bold flex items-center space-x-1 transition-all active:scale-95 ${
              showChangeBar 
                ? 'bg-amber-500 text-black border-amber-400' 
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-amber-400'
            }`}
            title="Ask AI to change or fix the app"
          >
            <span>⚡</span>
            <span>Change</span>
          </button>

          {/* Device Toggles (Hidden on mobile phones to save space) */}
          <div className="hidden sm:flex items-center space-x-1 bg-[#111] p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1 rounded text-xs transition-all ${device === 'desktop' ? 'bg-white/20 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Desktop View (100%)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1 rounded text-xs transition-all ${device === 'tablet' ? 'bg-white/20 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Tablet View (768px)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1 rounded text-xs transition-all ${device === 'mobile' ? 'bg-white/20 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Mobile View (380px)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>

          {/* Reload App */}
          <button
            onClick={restartApp}
            className="p-1 sm:px-2.5 sm:py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-slate-300 hover:text-white flex items-center space-x-1 transition-all active:scale-95"
            title="Reload Application"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="hidden md:inline">Reload</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => setIsFullscreen(prev => !prev)}
            className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Preview"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0 0l-5-5m-6 16l-5-5m0 0v4m0-4h4m11 0h-4m4 0v-4m0 4l-5-5" />
              </svg>
            )}
          </button>

          {onSwitchToCode && (
            <button
              onClick={onSwitchToCode}
              className="px-2 sm:px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-500 hover:bg-amber-500/20 text-[10px] sm:text-xs font-mono font-bold transition-all active:scale-95"
            >
              <span>💻</span>
              <span className="hidden xs:inline ml-1">Code</span>
            </button>
          )}
        </div>
      </div>

      {/* Floating Self-Repair Alert HUD (Triggers if runtime bug occurs) */}
      {runtimeError && (
        <div className="bg-gradient-to-r from-red-950/90 via-[#180a0a] to-[#111] border-b border-red-500/40 p-2.5 sm:p-3 flex flex-col sm:flex-row items-center justify-between gap-2 z-20 animate-in slide-in-from-top-2 duration-200 shadow-xl">
          <div className="flex items-center space-x-2 text-xs text-red-200 min-w-0 w-full sm:w-auto">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
            <div className="truncate">
              <span className="font-bold text-red-400 uppercase font-mono text-[10px] mr-1">[Self-Repair Alert]:</span>
              <span className="font-mono text-red-100">{runtimeError.message}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={triggerInstantFix}
              disabled={isProcessing}
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs font-mono uppercase tracking-wider flex items-center space-x-1.5 shadow-lg active:scale-95 transition-all"
            >
              <span>⚡</span>
              <span>{autoHealCountdown !== null ? `Auto-Fixing in ${autoHealCountdown}s...` : 'Fix Itself Now'}</span>
            </button>
            <button
              onClick={() => { setRuntimeError(null); setAutoHealCountdown(null); }}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Dynamic App Adaptation & Change Strip */}
      {showChangeBar && (
        <div className="bg-[#0c0c0e] border-b border-amber-500/30 p-2.5 sm:p-3 z-20 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          <div className="flex flex-col space-y-2 max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-500 uppercase tracking-wider font-mono">
                <span>⚡ App Change & Evolution Core</span>
                <span className="text-[9px] text-slate-400 font-normal lowercase">(tell it what to change, it will adapt the app)</span>
              </div>
              <button 
                onClick={() => setShowChangeBar(false)}
                className="text-slate-500 hover:text-slate-300 text-xs px-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Change Chips */}
            <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
              {quickChangeChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(chip.prompt)}
                  disabled={isProcessing}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 text-[10px] font-mono text-slate-300 hover:text-amber-400 whitespace-nowrap transition-all active:scale-95 disabled:opacity-50 shrink-0"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Custom Change Input */}
            <form onSubmit={handleApplyCustomChange} className="flex space-x-2 pt-1">
              <input
                type="text"
                value={customChangeInput}
                onChange={(e) => setCustomChangeInput(e.target.value)}
                placeholder="Ask to change anything (e.g. 'change snake to purple', 'make it faster', 'add a pause button')..."
                disabled={isProcessing}
                className="flex-1 bg-[#141418] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
              />
              <button
                type="submit"
                disabled={!customChangeInput.trim() || isProcessing}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase font-mono tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 shrink-0"
              >
                Apply Change
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Frame Container - Edge-to-edge on mobile */}
      <div className="flex-1 flex items-center justify-center p-0 sm:p-3 overflow-hidden bg-[#040404] relative">
        <div className={`transition-all duration-300 sm:rounded-2xl overflow-hidden border-0 sm:border border-white/10 shadow-2xl bg-white ${getContainerWidth()} h-full`}>
          <iframe
            key={key}
            ref={iframeRef}
            srcDoc={bundledHtml}
            title="App Preview"
            sandbox="allow-scripts allow-modals allow-same-origin allow-forms allow-popups"
            className="w-full h-full border-none bg-slate-900"
          />
        </div>
      </div>
    </div>
  );
};

export default LivePreview;
