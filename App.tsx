import React, { useState, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import ChatPanel from './components/ChatPanel';
import PricingModal from './components/PricingModal';
import VIPRoom from './components/VIPRoom';
import TopNavbar from './components/TopNavbar';
import DynamicBackground from './components/DynamicBackground';
import UpgradeCelebrationModal from './components/UpgradeCelebrationModal';
import GeminiThinkingModal, { GeminiSparkleIcon } from './components/GeminiThinkingModal';
import LivePreview from './components/LivePreview';
import SelfHealingModal from './components/SelfHealingModal';
import { CodeFile, ChatMessage, ToolAction, AppRuntimeError } from './types';
import { geminiService } from './services/geminiService';
import { audioService } from './services/audioService';

const initialFiles: CodeFile[] = [
  {
    id: 'starter-index',
    name: 'index.html',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>Welcome to Aryan App Maker</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#09090b] text-slate-100 min-h-screen flex items-center justify-center p-3 sm:p-6 font-sans">
  <div class="max-w-md w-full bg-[#121215] border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl text-center">
    <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-xl sm:text-2xl">
      ⚡
    </div>
    <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">Aryan App Maker</h1>
    <p class="text-xs text-slate-400 mb-4 sm:mb-5 leading-relaxed">
      Your real-time app studio is active. Type any command in the AI Concierge (like <em>"make a snake game"</em> or <em>"make a calculator"</em>) to build your app for real!
    </p>

    <!-- Interactive Live Counter Demo -->
    <div class="bg-[#050505] border border-white/5 rounded-xl sm:rounded-2xl p-4 sm:p-5 mb-3 sm:mb-4">
      <div class="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Interactive Counter</div>
      <div id="counter" class="text-3xl sm:text-4xl font-mono font-light text-amber-500 my-2">0</div>
      <div class="flex justify-center space-x-2 mt-3">
        <button onclick="decrement()" class="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-mono text-xs font-bold border border-white/10 transition-all active:scale-95">-1</button>
        <button onclick="reset()" class="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg font-mono text-xs border border-white/10 transition-all active:scale-95">Reset</button>
        <button onclick="increment()" class="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg font-mono text-xs font-black transition-all shadow-md active:scale-95">+1</button>
      </div>
    </div>
  </div>

  <script>
    let count = 0;
    const el = document.getElementById('counter');
    function update() { el.innerText = count; }
    window.increment = function() { count++; update(); };
    window.decrement = function() { count--; update(); };
    window.reset = function() { count = 0; update(); };
  </script>
</body>
</html>`
  },
  {
    id: 'starter-calc',
    name: 'cart_calculator.js',
    language: 'javascript',
    content: `// Price Calculator Script
// Upgrade to ARYAN PRO to edit code or click 'Find Mistakes'!

function calculateTotal(items, discountRate) {
  let subtotal = 0;

  for (let i = 0; i < items.length; i++) {
    subtotal += items[i].price * items[i].quantity;
  }

  const tax = subtotal * 0.08;
  const discount = subtotal * discountRate;
  
  return {
    subtotal,
    tax,
    discount,
    finalTotal: subtotal + tax - discount
  };
}

const sampleCart = [
  { name: 'App License', price: 100, quantity: 2 },
  { name: 'Cloud Server', price: 50, quantity: 1 }
];

console.log("Cart Result:", calculateTotal(sampleCart, 0.1));
`
  }
];

const App: React.FC = () => {
  const [files, setFiles] = useState<CodeFile[]>(initialFiles);
  const [activeFileId, setActiveFileId] = useState<string | null>(initialFiles[0].id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [showPlans, setShowPlans] = useState(false);
  const [showVIP, setShowVIP] = useState(false);
  const [activePlan, setActivePlan] = useState<string>('FREE');
  const [celebrationTier, setCelebrationTier] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'log' | 'diagnostics'>('console');
  
  // Mobile drawer states
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(true);

  // Workspace view mode: 'code' | 'preview' | 'split'
  const [viewMode, setViewMode] = useState<'code' | 'preview' | 'split'>('preview');
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [showSelfHealingModal, setShowSelfHealingModal] = useState(false);
  const [healedNotification, setHealedNotification] = useState<string | null>(null);

  const activeFile = useMemo(() => 
    files.find(f => f.id === activeFileId) || null
  , [files, activeFileId]);

  const handleNewFile = useCallback(() => {
    if (activePlan === 'FREE' && files.length >= 100) {
      setShowPlans(true);
      return;
    }

    const newFile: CodeFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: `app_${(files.length + 1).toString().padStart(3, '0')}.html`,
      content: '<!DOCTYPE html>\n<html>\n<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body class="bg-black text-white p-4 sm:p-6">\n  <h1 class="text-xl sm:text-2xl font-bold">New Aryan App</h1>\n</body>\n</html>',
      language: 'html'
    };
    setFiles(prev => [newFile, ...prev]);
    setActiveFileId(newFile.id);
  }, [files.length, activePlan]);

  const handleDeleteFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (activeFileId === id) setActiveFileId(null);
  }, [activeFileId]);

  const handleFileChange = useCallback((content: string) => {
    if (!activeFileId || activePlan === 'FREE') return;
    setFiles(prev => prev.map(f => 
      f.id === activeFileId ? { ...f, content } : f
    ));
  }, [activeFileId, activePlan]);

  const handleSelectPlan = (planId: string) => {
    const isUpgrade = planId !== activePlan;
    setActivePlan(planId);
    setShowPlans(false);

    audioService.playUpgradeSound(planId);

    if (isUpgrade && planId !== 'FREE') {
      setCelebrationTier(planId);
    }

    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: `System Protocol Updated: You are now subscribed to Aryan ${planId.replace('_', ' ')}. All features for this tier are active.`, 
      type: 'text' 
    }]);
  };

  const handleToggleAudio = () => {
    const nextMuted = !isAudioMuted;
    setIsAudioMuted(nextMuted);
    audioService.isMuted = nextMuted;
  };

  const handleLiveAppLog = useCallback((msg: string) => {
    setLiveLogs(prev => [msg, ...prev.slice(0, 30)]);
  }, []);

  const handleSendMessage = async (
    content: string, 
    action: ToolAction = ToolAction.GENERATE,
    errorContext?: string
  ) => {
    setIsProcessing(true);
    setCurrentPrompt(content);
    setMessages(prev => [...prev, { role: 'user', content: content || `Execute: ${action}`, type: 'text' }]);

    try {
      const result = await geminiService.processCommand(
        content, 
        action, 
        files, 
        activeFile || undefined,
        errorContext
      );

      if (result.files && result.files.length > 0) {
        let targetIdToSelect: string | null = null;

        setFiles(prev => {
          const updatedFiles = [...prev];

          result.files.forEach((newFile: any) => {
            let rawContent = typeof newFile.content === 'string' ? newFile.content.trim() : '';
            if (rawContent.startsWith('```html')) {
              rawContent = rawContent.replace(/^```html\s*/i, '').replace(/```\s*$/, '').trim();
            } else if (rawContent.startsWith('```')) {
              rawContent = rawContent.replace(/^```[a-z]*\s*/i, '').replace(/```\s*$/, '').trim();
            }

            const existingIndex = updatedFiles.findIndex(
              f => f.name.toLowerCase() === newFile.name.toLowerCase()
            );

            if (existingIndex !== -1) {
              updatedFiles[existingIndex] = {
                ...updatedFiles[existingIndex],
                content: rawContent,
                language: newFile.language || 'html'
              };
              if (!targetIdToSelect) {
                targetIdToSelect = updatedFiles[existingIndex].id;
              }
            } else {
              const created: CodeFile = {
                id: Math.random().toString(36).substr(2, 9),
                name: newFile.name,
                content: rawContent,
                language: newFile.language || 'html'
              };
              updatedFiles.unshift(created);
              if (!targetIdToSelect) {
                targetIdToSelect = created.id;
              }
            }
          });

          return updatedFiles;
        });

        if (targetIdToSelect) {
          setActiveFileId(targetIdToSelect);
        }

        // Auto-switch to preview so user immediately sees their fixed or modified app!
        setViewMode('preview');
        // Close chat on mobile
        setIsMobileChatOpen(false);

        // Toast notifications for self-repair or modification
        if (action === ToolAction.FIX || errorContext) {
          setHealedNotification("✨ App Self-Healed: Runtime bug diagnosed & eliminated!");
          setTimeout(() => setHealedNotification(null), 4000);
        } else if (action === ToolAction.CHANGE) {
          setHealedNotification("✨ App Adapted: Changes applied to live application!");
          setTimeout(() => setHealedNotification(null), 4000);
        }
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: result.explanation, 
        type: 'code-change' 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I encountered a processing anomaly. Please retry your command.", 
        type: 'error' 
      }]);
    } finally {
      setIsProcessing(false);
      setCurrentPrompt('');
    }
  };

  const handleAutoFix = useCallback((errorInfo: AppRuntimeError) => {
    audioService.playClickSound();
    handleSendMessage(`Diagnose and fix runtime bug: "${errorInfo.message}"`, ToolAction.FIX, errorInfo.message);
  }, [files, activeFile]);

  const handleApplyChange = useCallback((changePrompt: string) => {
    audioService.playClickSound();
    handleSendMessage(changePrompt, ToolAction.CHANGE);
  }, [files, activeFile]);

  const handleEditorAction = (action: ToolAction) => {
    if (!activeFile) return;
    if (action === ToolAction.MISTAKE_FINDER) {
      handleSendMessage(`Scan '${activeFile.name}' for syntax bugs, logical mistakes, and errors. Select and fix them.`, ToolAction.MISTAKE_FINDER);
    } else if (action === ToolAction.DUBBLE_CHECK) {
      handleSendMessage(`Perform Dubble Checking on '${activeFile.name}': double check syntax, verify data types, and check runtime logic.`, ToolAction.DUBBLE_CHECK);
    }
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] w-full bg-[#050505] text-slate-200 overflow-hidden relative font-light select-none">
      {/* Dynamic Background */}
      <DynamicBackground planTier={activePlan} />

      {/* Top Navbar */}
      <TopNavbar
        activePlan={activePlan}
        onSelectPlan={handleSelectPlan}
        onOpenPlans={() => setShowPlans(true)}
        onOpenVIP={() => setShowVIP(true)}
        isAudioMuted={isAudioMuted}
        onToggleAudio={handleToggleAudio}
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onToggleChat={() => setIsMobileChatOpen(!isMobileChatOpen)}
        isChatOpen={isMobileChatOpen}
        onOpenSelfHealing={() => setShowSelfHealingModal(true)}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex min-h-0 w-full relative z-10 overflow-hidden">
        {/* Desktop Sidebar (hidden on mobile) */}
        <div className="hidden md:flex h-full shrink-0">
          <Sidebar 
            files={files} 
            activeFileId={activeFileId} 
            activePlan={activePlan}
            onFileSelect={setActiveFileId}
            onNewFile={handleNewFile}
            onDeleteFile={handleDeleteFile}
            onOpenPlans={() => setShowPlans(true)}
            onOpenVIP={() => setShowVIP(true)}
          />
        </div>

        {/* Mobile Slide-over Drawer for Sidebar */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            {/* Drawer */}
            <div className="relative z-10 w-72 max-w-[85vw] h-full shadow-2xl animate-in slide-in-from-left duration-200 bg-[#0a0a0a]">
              <Sidebar 
                files={files} 
                activeFileId={activeFileId} 
                activePlan={activePlan}
                onFileSelect={setActiveFileId}
                onNewFile={handleNewFile}
                onDeleteFile={handleDeleteFile}
                onOpenPlans={() => setShowPlans(true)}
                onOpenVIP={() => setShowVIP(true)}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}
        
        {/* Central Workspace Main Column */}
        <main className="flex-1 flex flex-col min-w-0 z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
          {/* View Switcher Bar */}
          <div className="h-9 sm:h-11 bg-[#09090b] border-b border-white/5 px-2.5 sm:px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-1.5 sm:space-x-3">
              <span className="hidden sm:inline-block text-[11px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
                View:
              </span>
              <div className="flex items-center space-x-1 bg-[#141417] p-0.5 rounded-lg sm:rounded-xl border border-white/10 shadow-inner">
                <button
                  onClick={() => setViewMode('code')}
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-mono font-medium transition-all flex items-center space-x-1 active:scale-95 ${
                    viewMode === 'code' ? 'bg-amber-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>💻</span>
                  <span>Code</span>
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-mono font-medium transition-all flex items-center space-x-1 active:scale-95 ${
                    viewMode === 'preview' ? 'bg-emerald-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`hidden md:flex px-2.5 sm:px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all items-center space-x-1 ${
                    viewMode === 'split' ? 'bg-amber-500 text-black font-bold shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>◨</span>
                  <span>Split</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono text-slate-400 shrink-0">
              <span className="flex items-center space-x-1.5 text-emerald-400 text-[9px] sm:text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="hidden sm:inline">Live Sandbox Active</span>
                <span className="sm:hidden">Live</span>
              </span>

              {/* Console Toggle on mobile */}
              <button
                onClick={() => setIsConsoleCollapsed(!isConsoleCollapsed)}
                className="px-1.5 sm:px-2 py-0.5 rounded border border-white/10 hover:border-white/20 text-[9px] sm:text-[10px] text-slate-400 hover:text-white md:hidden active:scale-95"
              >
                {isConsoleCollapsed ? '▲ Logs' : '▼ Hide'}
              </button>
            </div>
          </div>

          {/* Interactive Workspace Area */}
          <div className="flex-1 flex min-h-0 overflow-hidden relative">
            {/* Code Editor Panel */}
            {(viewMode === 'code' || (viewMode === 'split' && window.innerWidth >= 768)) && (
              <div className={`h-full flex flex-col ${viewMode === 'split' ? 'w-1/2 border-r border-white/5' : 'w-full'}`}>
                <Editor 
                  file={activeFile} 
                  activePlan={activePlan}
                  onChange={handleFileChange}
                  onRunAction={handleEditorAction}
                  onOpenPlans={() => setShowPlans(true)}
                  onOpenVIP={() => setShowVIP(true)}
                  onOpenPreview={() => setViewMode('preview')}
                />
              </div>
            )}

            {/* Real Interactive Live App Runner Panel */}
            {(viewMode === 'preview' || (viewMode === 'split' && window.innerWidth >= 768)) && (
              <div className={`h-full flex flex-col ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                <LivePreview
                  files={files}
                  activeFile={activeFile}
                  onConsoleLog={handleLiveAppLog}
                  onSwitchToCode={() => setViewMode('code')}
                  onAutoFix={handleAutoFix}
                  onApplyChange={handleApplyChange}
                  isProcessing={isProcessing}
                />
              </div>
            )}
          </div>
          
          {/* Console Bar (Collapsible on mobile) */}
          <div className={`transition-all duration-300 bg-[#0a0a0a] border-t border-white/5 p-2.5 sm:p-4 overflow-hidden flex flex-col shrink-0 ${
            isConsoleCollapsed ? 'hidden md:flex h-32 lg:h-40' : 'h-36 sm:h-44'
          }`}>
            <div className="flex items-center space-x-4 sm:space-x-8 mb-1.5 sm:mb-2 border-b border-white/5 pb-1 shrink-0">
              <button 
                onClick={() => setActiveTab('console')}
                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] pb-1 transition-all ${
                  activeTab === 'console'
                    ? 'text-amber-500 border-b-2 border-amber-500'
                    : 'text-slate-600 hover:text-slate-300'
                }`}
              >
                Console
              </button>
              <button 
                onClick={() => setActiveTab('log')}
                className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] pb-1 transition-all ${
                  activeTab === 'log'
                    ? 'text-amber-500 border-b-2 border-amber-500'
                    : 'text-slate-600 hover:text-slate-300'
                }`}
              >
                Output
              </button>
              <button 
                onClick={() => setActiveTab('diagnostics')}
                className={`hidden sm:inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] pb-1 transition-all ${
                  activeTab === 'diagnostics'
                    ? 'text-amber-500 border-b-2 border-amber-500'
                    : 'text-slate-600 hover:text-slate-300'
                }`}
              >
                Diagnostics
              </button>

              <div className="ml-auto text-[8px] sm:text-[10px] font-mono text-slate-500 flex items-center space-x-1.5">
                <GeminiSparkleIcon className="w-3 h-3 text-amber-500" size={12} />
                <span className="hidden sm:inline">Gemini Core Online</span>
                <span className="sm:hidden">Online</span>
              </div>
            </div>

            <div className="flex-1 font-mono text-[10px] sm:text-[12px] text-slate-500 overflow-auto scroll-smooth leading-relaxed">
              {activeTab === 'console' && (
                <>
                  <div className="flex items-center space-x-2 text-slate-400 text-[10px] sm:text-xs">
                    <span className="text-amber-500 opacity-60">#</span>
                    <span>Aryan {activePlan.replace('_', ' ')} Environment Initialized.</span>
                  </div>
                  {isProcessing && (
                    <div className="text-amber-500/80 animate-pulse mt-1 flex items-center space-x-2">
                      <GeminiSparkleIcon className="w-3.5 h-3.5 animate-spin" size={14} />
                      <span>Gemini Thinking Core active... Generating real application.</span>
                    </div>
                  )}
                  {liveLogs.slice(0, 5).map((log, i) => (
                    <div key={i} className="text-emerald-400/80 text-[10px] sm:text-[11px]">
                      {log}
                    </div>
                  ))}
                </>
              )}

              {activeTab === 'log' && (
                <div className="space-y-1 text-slate-400 text-[10px] sm:text-[11px]">
                  {liveLogs.length === 0 ? (
                    <div className="text-slate-600 italic">No app logs emitted yet. Interact with the Live App above to see logs.</div>
                  ) : (
                    liveLogs.map((log, i) => <div key={i}>{log}</div>)
                  )}
                </div>
              )}

              {activeTab === 'diagnostics' && (
                <div className="space-y-1 text-slate-400 text-[10px] sm:text-[11px]">
                  <div>• Live Sandbox: Active (HTML5 + Web Audio + Canvas 60FPS)</div>
                  <div>• Model pipeline: gemini-3.8-flash with Thinking config</div>
                  <div>• Active Plan: Aryan {activePlan.replace('_', ' ')}</div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Desktop Chat Panel (hidden on mobile) */}
        <div className="hidden md:flex h-full shrink-0">
          <ChatPanel 
            messages={messages} 
            activePlan={activePlan}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
            onOpenPlans={() => setShowPlans(true)}
          />
        </div>

        {/* Mobile Slide-over Drawer for ChatPanel (Fills mobile viewport cleanly) */}
        {isMobileChatOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex justify-end">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setIsMobileChatOpen(false)}
            />
            {/* Drawer */}
            <div className="relative z-10 w-full sm:max-w-md h-full shadow-2xl animate-in slide-in-from-right duration-200 bg-[#0a0a0a] flex flex-col">
              <ChatPanel 
                messages={messages} 
                activePlan={activePlan}
                onSendMessage={handleSendMessage}
                isProcessing={isProcessing}
                onOpenPlans={() => setShowPlans(true)}
                onCloseMobile={() => setIsMobileChatOpen(false)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Sleek Mobile Bottom Navigation Bar with Safe Area Support */}
      <nav className="h-14 sm:h-16 bg-[#08080a] border-t border-white/10 px-2 sm:px-4 flex items-center justify-around z-30 md:hidden shrink-0 select-none pb-safe">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-white active:scale-95 py-1 px-2"
          aria-label="Files"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span className="text-[9px] font-mono">Files</span>
        </button>

        <button
          onClick={() => setViewMode('code')}
          className={`flex flex-col items-center justify-center space-y-1 active:scale-95 py-1 px-2 ${
            viewMode === 'code' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Code Editor"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className="text-[9px] font-mono">Code</span>
        </button>

        <button
          onClick={() => setViewMode('preview')}
          className={`flex flex-col items-center justify-center space-y-1 relative active:scale-95 py-1 px-2 ${
            viewMode === 'preview' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
          aria-label="Live Preview"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[9px] font-mono">Preview</span>
          {viewMode === 'preview' && (
            <span className="w-1 h-1 rounded-full bg-emerald-400 absolute top-0.5 right-3"></span>
          )}
        </button>

        <button
          onClick={() => setIsMobileChatOpen(true)}
          className="flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-amber-400 relative active:scale-95 py-1 px-2"
          aria-label="AI Concierge"
        >
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {isProcessing && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping absolute -top-1 -right-1"></span>
            )}
          </div>
          <span className="text-[9px] font-mono">AI Chat</span>
        </button>

        <button
          onClick={() => setShowPlans(true)}
          className="flex flex-col items-center justify-center space-y-1 text-slate-400 hover:text-amber-400 active:scale-95 py-1 px-2"
          aria-label="Plans"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span className="text-[9px] font-mono">Plans</span>
        </button>
      </nav>

      {/* Modals */}
      <PricingModal 
        isOpen={showPlans} 
        activePlan={activePlan}
        onClose={() => setShowPlans(false)} 
        onSelectPlan={handleSelectPlan}
      />

      <VIPRoom 
        isOpen={showVIP}
        onClose={() => setShowVIP(false)}
        activeFile={activeFile}
        onUpdateFile={handleFileChange}
      />

      <UpgradeCelebrationModal
        isOpen={celebrationTier !== null}
        tier={celebrationTier || 'PRO'}
        onClose={() => setCelebrationTier(null)}
      />

      <GeminiThinkingModal
        isThinking={isProcessing}
        userPrompt={currentPrompt}
      />

      <SelfHealingModal
        isOpen={showSelfHealingModal}
        onClose={() => setShowSelfHealingModal(false)}
        onTriggerFix={() => handleSendMessage("Diagnose and repair all errors and syntax in active app", ToolAction.FIX)}
        onApplyChange={(prompt) => handleSendMessage(prompt, ToolAction.CHANGE)}
        isProcessing={isProcessing}
      />

      {/* Floating Self-Repair Success Toast */}
      {healedNotification && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[100] max-w-[90vw] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#0a120e] border border-emerald-500/50 shadow-2xl rounded-2xl px-4 py-2.5 flex items-center space-x-2.5 text-xs text-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
            <span className="font-mono font-medium">{healedNotification}</span>
            <button 
              onClick={() => setHealedNotification(null)}
              className="text-emerald-500 hover:text-white ml-2 text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Global Luxury Backdrop Glow */}
      <div className="fixed bottom-0 right-1/4 w-[800px] h-[400px] bg-amber-500/5 blur-[150px] -z-10 rounded-full pointer-events-none"></div>
    </div>
  );
};

export default App;
