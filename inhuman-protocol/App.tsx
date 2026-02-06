
import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, Shield, Zap, AlertTriangle, Cpu, Terminal as TerminalIcon } from 'lucide-react';
import { AppState } from './types';
import { getHumanityChallenge, verifyHumanity } from './services/gemini';

// --- Sub-components ---

const Header = () => (
  <div className="flex justify-between w-full px-8 py-6 text-[10px] tracking-widest opacity-50 uppercase absolute top-0">
    <span>Protocol_V.4.0.2</span>
    <span>Encrypted_Connection</span>
  </div>
);

const Footer = () => (
  <div className="flex flex-col items-center w-full pb-10 text-[10px] tracking-widest absolute bottom-0">
    <div className="flex items-center gap-2 opacity-60 mb-4 uppercase">
      <Shield size={12} className="text-cyan-400" />
      <span>Verified by World ID</span>
    </div>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.LOCKED);
  const [progress, setProgress] = useState(0);
  const [challenge, setChallenge] = useState("");
  const [answer, setAnswer] = useState("");
  const [log, setLog] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Background loop for terminal logs
  useEffect(() => {
    if (appState === AppState.SCANNING || appState === AppState.VERIFYING) {
      const interval = setInterval(() => {
        const fakeLogs = [
          "READING_BIOMETRICS...",
          "HEART_RATE_STABLE",
          "OXYGEN_LEVEL_98%",
          "NEURAL_PATHWAY_ACTIVE",
          "DETECTING_COLD_IRON_RATIO",
          "DNA_SPLICING_CHECK_COMPLETE",
          "BYPASSING_AI_PROXY..."
        ];
        setLog(prev => [fakeLogs[Math.floor(Math.random() * fakeLogs.length)], ...prev].slice(0, 10));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [appState]);

  const startScan = async () => {
    setAppState(AppState.SCANNING);
    // Request camera to mimic "biometric scanning"
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.log("Camera access denied - proceeding with visual simulation.");
    }

    // Simulate progress
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        initiateChallenge();
      }
      setProgress(p);
    }, 100);
  };

  const initiateChallenge = async () => {
    setAppState(AppState.VERIFYING);
    const q = await getHumanityChallenge();
    setChallenge(q);
  };

  const handleVerify = async () => {
    setAppState(AppState.VERIFYING);
    const result = await verifyHumanity(challenge, answer);
    if (result.result === 'PASS') {
      setAppState(AppState.GRANTED);
    } else {
      setAppState(AppState.DENIED);
      setTimeout(() => setAppState(AppState.LOCKED), 5000);
    }
  };

  return (
    <div className="relative h-screen w-screen bg-[#021612] flex flex-col items-center justify-center overflow-hidden">
      <Header />

      {/* Background Camera Overlay */}
      {appState === AppState.SCANNING && (
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale brightness-50"
        />
      )}

      {/* Main Content Areas */}
      {appState === AppState.LOCKED && (
        <div className="flex flex-col items-center animate-in fade-in duration-1000">
          <div className="relative mb-12 group cursor-pointer" onClick={startScan}>
            <div className="w-32 h-32 rounded-full border-2 border-[#00FFC2]/30 flex items-center justify-center relative glow-box transition-all group-hover:scale-105">
               {/* Orbital ring decoration */}
               <div className="absolute inset-[-10px] rounded-full border border-cyan-500/10 animate-spin-slow"></div>
               <div className="absolute top-0 right-4 w-3 h-3 bg-[#00FFC2] rounded-full glow-text"></div>
               
               <div className="p-4 bg-gradient-to-t from-[#00FFC2]/20 to-transparent rounded-full">
                  <Fingerprint size={64} className="text-[#00FFC2] drop-shadow-xl animate-pulse" />
               </div>
            </div>
          </div>

          <h1 className="text-7xl font-bold tracking-[0.2em] uppercase mb-4 glow-text text-[#00FFC2]">
            Inhuman
          </h1>
          <p className="text-[#00FFC2]/60 tracking-[0.5em] text-sm uppercase mb-32">
            Human-Only Access
          </p>

          <div className="w-64 h-0.5 bg-gray-800 relative overflow-hidden">
            <div 
              className="absolute h-full bg-[#00FFC2] transition-all duration-300 shadow-[0_0_8px_rgba(0,255,194,1)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {appState === AppState.SCANNING && (
        <div className="flex flex-col items-center z-10">
          <div className="scan-line"></div>
          <Cpu className="w-16 h-16 text-[#00FFC2] mb-8 animate-pulse" />
          <h2 className="text-2xl tracking-widest uppercase mb-4">Biometric Analysis</h2>
          <div className="w-80 h-1 bg-gray-800 mb-4">
            <div 
              className="h-full bg-[#00FFC2]" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="text-[10px] text-[#00FFC2]/50 font-mono">
            {log[0] || "INITIALIZING..."}
          </div>
        </div>
      )}

      {appState === AppState.VERIFYING && (
        <div className="max-w-xl w-full px-8 z-10 space-y-8">
          <div className="flex items-center gap-3 border-b border-[#00FFC2]/20 pb-4">
            <TerminalIcon size={20} className="text-[#00FFC2]" />
            <span className="uppercase tracking-[0.3em] text-xs">Humanity Audit Required</span>
          </div>
          
          <div className="space-y-4">
            <p className="text-xl leading-relaxed text-[#00FFC2] font-light">
              {challenge || "Decrypting challenge payload..."}
            </p>
            <textarea
              className="w-full bg-[#03221c]/80 border border-[#00FFC2]/30 rounded p-4 text-[#00FFC2] focus:outline-none focus:border-[#00FFC2] placeholder:text-[#00FFC2]/20 min-h-[120px]"
              placeholder="Your biological response..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>

          <button 
            onClick={handleVerify}
            className="w-full py-4 border border-[#00FFC2] text-[#00FFC2] uppercase tracking-[0.4em] hover:bg-[#00FFC2] hover:text-[#021612] transition-all glow-box disabled:opacity-50"
            disabled={!answer.trim()}
          >
            Submit for Validation
          </button>
        </div>
      )}

      {appState === AppState.GRANTED && (
        <div className="flex flex-col items-center z-10 animate-in zoom-in duration-500">
          <Zap size={100} className="text-[#00FFC2] mb-8 glow-text" />
          <h1 className="text-5xl font-bold tracking-[0.2em] uppercase mb-4 glow-text">ACCESS GRANTED</h1>
          <p className="text-sm opacity-60 max-w-md text-center">
            Welcome, citizen. Your biological signature has been verified against the master ledger.
          </p>
          <div className="mt-12 p-6 border border-[#00FFC2]/20 rounded-lg w-full max-w-md bg-[#00FFC2]/5">
            <div className="text-xs space-y-2 opacity-70">
              <div className="flex justify-between"><span>TOKEN ID:</span><span>0xH78B...99F</span></div>
              <div className="flex justify-between"><span>AUTH LEVEL:</span><span>PRIME_HUMAN</span></div>
              <div className="flex justify-between"><span>LOCATION:</span><span>SECTOR_7_OUTPOST</span></div>
            </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-12 text-[10px] uppercase border-b border-[#00FFC2]/50 pb-1"
          >
            Terminal Reset
          </button>
        </div>
      )}

      {appState === AppState.DENIED && (
        <div className="flex flex-col items-center z-10 text-red-500 animate-bounce">
          <AlertTriangle size={100} className="mb-8 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          <h1 className="text-5xl font-bold tracking-[0.2em] uppercase mb-4">ACCESS DENIED</h1>
          <p className="text-sm opacity-80 uppercase tracking-widest">Non-Biological Entity Detected</p>
        </div>
      )}

      <Footer />
    </div>
  );
}
