import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CodeFile } from '../types';

interface VIPRoomProps {
  isOpen: boolean;
  onClose: () => void;
  activeFile: CodeFile | null;
  onUpdateFile: (content: string) => void;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const VIPRoom: React.FC<VIPRoomProps> = ({ isOpen, onClose, activeFile, onUpdateFile }) => {
  const [activeModule, setActiveModule] = useState<'neural' | 'live' | 'arch' | 'morph'>('neural');
  const [isBooting, setIsBooting] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [morphTarget, setMorphTarget] = useState('typescript');
  
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const screenRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(0));

  useEffect(() => {
    if (isOpen) {
      setIsBooting(true);
      const timer = setTimeout(() => setIsBooting(false), 900);
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex;
          const transcriptResult = event.results[current][0].transcript;
          setTranscript(transcriptResult);
        };
        recognitionRef.current.onend = () => setIsListening(false);
      }
      return () => {
        clearTimeout(timer);
        stopStreams();
      };
    } else {
      stopStreams();
    }
  }, [isOpen]);

  const stopStreams = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    if (screenRef.current?.srcObject) {
      (screenRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      screenRef.current.srcObject = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const processSpeechToCode = async () => {
    if (!transcript || isProcessing) return;
    setIsProcessing(true);
    try {
      const key = process.env.API_KEY && process.env.API_KEY !== 'PLACEHOLDER_API_KEY'
        ? process.env.API_KEY
        : 'AIzaSyDWeTXjVifKoi0C3OKqyWNIixE-p7RQDwQ';
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Translate this voice command into elite code: "${transcript}". Return raw code only.`,
        config: { systemInstruction: "Aryan Rockstar AI: Convert voice to code strings." }
      });
      onUpdateFile(response.text || '');
      setTranscript('CODE SYNTHESIZED.');
    } catch (error) {
      setTranscript('LINK FAILURE.');
    } finally {
      setIsProcessing(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) { console.error(err); }
  };

  const startScreen = async () => {
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      if (screenRef.current) screenRef.current.srcObject = stream;
    } catch (err) { console.error(err); }
  };

  const handleMorph = async () => {
    if (!activeFile || isProcessing) return;
    setIsProcessing(true);
    try {
      const key = process.env.API_KEY && process.env.API_KEY !== 'PLACEHOLDER_API_KEY'
        ? process.env.API_KEY
        : 'AIzaSyDWeTXjVifKoi0C3OKqyWNIixE-p7RQDwQ';
      const ai = new GoogleGenAI({ apiKey: key });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `Morph this code into ${morphTarget}. Elite architecture only.\n\n${activeFile.content}`,
        config: { systemInstruction: "Code transformation protocol." }
      });
      onUpdateFile(response.text || '');
    } catch (error) { console.error(error); } finally { setIsProcessing(false); }
  };

  useEffect(() => {
    if (activeModule === 'neural' && !isBooting && isOpen) {
      let animationFrame: number;
      const setupAudio = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const analyzer = ctx.createAnalyser();
          const source = ctx.createMediaStreamSource(stream);
          source.connect(analyzer);
          analyzer.fftSize = 64;
          audioContextRef.current = ctx;
          analyzerRef.current = analyzer;
          const dataArray = new Uint8Array(analyzer.frequencyBinCount);
          const draw = () => {
            analyzer.getByteFrequencyData(dataArray);
            setAudioData(new Uint8Array(dataArray));
            animationFrame = requestAnimationFrame(draw);
          };
          draw();
        } catch (e) { console.error(e); }
      };
      setupAudio();
      return () => {
        cancelAnimationFrame(animationFrame);
        if (audioContextRef.current) audioContextRef.current.close();
      };
    }
  }, [activeModule, isBooting, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black flex items-center justify-center overflow-hidden font-inter pt-safe pb-safe">
      {/* ROCKSTAR STAGE BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,#1e1b4b_0%,transparent_70%)] opacity-40"></div>
        <div className="spotlight absolute top-[-10%] left-[20%] w-[40%] h-[60%] rotate-[15deg] animate-[pulse_5s_infinite]"></div>
        <div className="spotlight absolute top-[-10%] right-[20%] w-[40%] h-[60%] rotate-[-15deg] animate-[pulse_7s_infinite_1s]"></div>
      </div>

      {isBooting ? (
        <div className="flex flex-col items-center space-y-6 sm:space-y-12 p-4 text-center">
          <div className="relative">
            <div className="w-20 h-20 sm:w-32 sm:h-32 border-4 border-purple-500/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 w-20 h-20 sm:w-32 sm:h-32 border-4 border-t-purple-500 rounded-full animate-spin"></div>
          </div>
          <div className="text-white font-rock font-bold tracking-[0.4em] sm:tracking-[1em] uppercase text-sm sm:text-xl animate-pulse">
            Booting VIP Suite
          </div>
        </div>
      ) : (
        <div className="relative w-full h-full flex flex-col p-3 sm:p-6 md:p-12 max-w-[1400px] mx-auto overflow-hidden">
          {/* Header */}
          <div className="flex justify-between items-center sm:items-end mb-4 sm:mb-8 shrink-0">
            <div>
              <div className="inline-block px-2.5 sm:px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] rounded-md mb-2 sm:mb-4 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                Stage Protocol Active
              </div>
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-rock font-bold chrome-text tracking-tighter uppercase italic">
                Aryan <span className="text-white not-italic">VIP</span> Stage
              </h1>
            </div>
            <button 
              onClick={onClose}
              className="p-2 sm:p-4 bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all rounded-xl sm:rounded-2xl hover:bg-purple-500/10 active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-7 sm:w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Dashboard Layout - Mobile Responsive */}
          <div className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-3 sm:gap-6 md:gap-8 min-h-0 overflow-hidden">
            {/* Sidebar Modules: Horizontal bar on mobile, vertical column on desktop */}
            <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto space-x-2 md:space-x-0 md:space-y-4 no-scrollbar pb-1 md:pb-0 shrink-0 md:col-span-4 lg:col-span-3">
              {[
                { id: 'neural', label: 'Vocal Logic', sub: 'Speech to Code', color: 'from-purple-600 to-indigo-600' },
                { id: 'live', label: 'Live Arena', sub: 'Broadcast & Cam', color: 'from-cyan-600 to-blue-600' },
                { id: 'arch', label: 'VIP Platform', sub: 'Elite AI Core', color: 'from-pink-600 to-rose-600' },
                { id: 'morph', label: 'Morph Core', sub: 'Code Evolution', color: 'from-amber-600 to-orange-600' }
              ].map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id as any)}
                  className={`text-left p-2.5 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 group shrink-0 ${
                    activeModule === mod.id 
                      ? `bg-gradient-to-br ${mod.color} border-white/20 shadow-lg text-white` 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-wider opacity-60">0{mod.id === 'neural' ? 1 : mod.id === 'live' ? 2 : mod.id === 'arch' ? 3 : 4}</div>
                  <div className="text-xs sm:text-base font-rock font-bold tracking-tight whitespace-nowrap">{mod.label}</div>
                  <div className="hidden sm:block text-[9px] uppercase tracking-wider mt-1 opacity-70">{mod.sub}</div>
                </button>
              ))}
            </div>

            {/* Central Stage */}
            <div className="flex-1 md:col-span-8 lg:col-span-9 bg-black/50 backdrop-blur-3xl border border-white/10 rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 relative overflow-hidden flex flex-col shadow-2xl min-h-0">
              <div className="flex-1 overflow-y-auto modal-scroll pr-1 sm:pr-2">
                {activeModule === 'neural' && (
                  <div className="min-h-full flex flex-col items-center justify-center space-y-6 sm:space-y-8 py-4">
                    {/* Audio visualizer */}
                    <div className="flex items-end space-x-1.5 sm:space-x-3 h-24 sm:h-36">
                      {Array.from(audioData).slice(0, 16).map((val: number, i) => (
                        <div 
                          key={i} 
                          className={`w-2 sm:w-3 rounded-t-lg transition-all duration-75 ${isListening ? 'bg-gradient-to-t from-purple-500 to-pink-500 shadow-md' : 'bg-slate-800'}`} 
                          style={{ height: `${Math.max(10, (val / 255) * 100)}%` }}
                        ></div>
                      ))}
                    </div>
                    <div className="text-center max-w-lg w-full px-2">
                      <h3 className="text-lg sm:text-2xl font-rock font-bold text-white mb-2 sm:mb-4 italic">Vocal Logic Interface</h3>
                      <div className="min-h-[70px] p-4 bg-white/5 rounded-2xl border border-white/10 text-purple-300 font-mono text-sm sm:text-base mb-6 flex items-center justify-center italic">
                        {transcript || 'STAGE IS MUTE. SPEAK NOW...'}
                      </div>
                      <div className="flex items-center justify-center space-x-4 sm:space-x-6">
                        <button 
                          onClick={toggleListening}
                          className={`p-5 sm:p-7 rounded-full transition-all active:scale-95 ${isListening ? 'bg-red-500 shadow-red-500/50 shadow-xl' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30 shadow-lg'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                          </svg>
                        </button>
                        <button 
                          onClick={processSpeechToCode}
                          disabled={!transcript || isListening || isProcessing}
                          className="px-6 sm:px-8 py-3.5 bg-white text-black font-rock font-bold uppercase tracking-wider text-[11px] sm:text-xs rounded-full hover:bg-purple-400 disabled:opacity-20 active:scale-95 shadow-xl"
                        >
                          {isProcessing ? 'Synthesizing...' : 'Sovereign Pulse'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeModule === 'live' && (
                  <div className="min-h-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 py-2">
                    <div className="rounded-2xl bg-slate-900 border border-white/10 overflow-hidden flex flex-col min-h-[200px] relative">
                      <div className="flex-1 relative bg-black flex items-center justify-center">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 bg-red-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full">LIVE_CAM</span>
                      </div>
                      <div className="p-3 bg-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-mono text-slate-400">Camera Feed</span>
                        <button onClick={startCamera} className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold">Start</button>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-900 border border-white/10 overflow-hidden flex flex-col min-h-[200px] relative">
                      <div className="flex-1 relative bg-black flex items-center justify-center">
                        <video ref={screenRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 bg-cyan-600 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-full">SCREEN_CAST</span>
                      </div>
                      <div className="p-3 bg-white/5 flex justify-between items-center">
                        <span className="text-[10px] font-mono text-slate-400">Screen Share</span>
                        <button onClick={startScreen} className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-[10px] font-bold">Share</button>
                      </div>
                    </div>
                  </div>
                )}

                {activeModule === 'arch' && (
                  <div className="min-h-full flex flex-col items-center justify-center space-y-4 sm:space-y-6 text-center py-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-2xl sm:text-3xl text-pink-500">
                      ⚡
                    </div>
                    <h3 className="text-xl sm:text-3xl font-rock font-bold text-white">VIP Architecture Suite</h3>
                    <p className="max-w-md text-xs sm:text-sm text-slate-400 leading-relaxed px-4">
                      Direct connection to Gemini multi-turn reasoning core with 100% priority queue and instant code synthesis.
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-sm w-full">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                        <div className="text-base sm:text-xl font-bold text-pink-400">0.02s</div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Latency</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                        <div className="text-base sm:text-xl font-bold text-pink-400">Infinity</div>
                        <div className="text-[9px] uppercase tracking-wider text-slate-400">Bandwidth</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeModule === 'morph' && (
                  <div className="min-h-full flex flex-col items-center justify-center space-y-4 sm:space-y-6 text-center py-6">
                    <h3 className="text-xl sm:text-3xl font-rock font-bold text-white">Code Morph Engine</h3>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-md px-4">
                      Transform existing code into modern TypeScript, React, Python, or WebGL with a single click.
                    </p>
                    <div className="flex items-center space-x-2">
                      {['typescript', 'react', 'python'].map(target => (
                        <button
                          key={target}
                          onClick={() => setMorphTarget(target)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase font-bold transition-all ${morphTarget === target ? 'bg-amber-500 text-black' : 'bg-white/5 text-slate-400'}`}
                        >
                          {target}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={handleMorph}
                      disabled={isProcessing}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-rock text-xs font-bold uppercase tracking-wider rounded-xl transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isProcessing ? 'Morphing...' : 'Morph Code Now'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VIPRoom;
