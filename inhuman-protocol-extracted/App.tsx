
import React, { useState, useEffect, useRef } from 'react';
import { Fingerprint, Shield, Zap, AlertTriangle, Cpu, Terminal as TerminalIcon, CheckCircle2, PartyPopper, Circle, Check } from 'lucide-react';
import { AppState } from './types';
import { getHumanityChallenge, verifyHumanity } from './services/gemini';

// --- Sub-components ---

const Header = () => (
  <div className="flex justify-between w-full px-5 py-5 text-xs sm:text-sm tracking-wide absolute top-0 z-20">
    <span className="text-gray-300 font-medium">INHUMAN // WORLD ID</span>
    <div className="flex items-center gap-2">
      <span className="text-[#00FFC2] font-medium">NETWORK ACTIVE</span>
      <div className="w-2 h-2 bg-[#00FFC2] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,255,194,0.8)]"></div>
    </div>
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
    <div className="relative min-h-screen w-screen bg-[#0a1f1a] flex flex-col items-center justify-center overflow-hidden">
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
        <div className="flex flex-col items-center justify-center min-h-screen w-full px-6 py-8">
          {/* Fingerprint Icon */}
          <div className="relative mb-6">
            <div className="w-20 h-20 rounded-full border-2 border-[#00FFC2] flex items-center justify-center relative shadow-[0_0_30px_rgba(0,255,194,0.6)]">
              <Fingerprint size={40} className="text-[#00FFC2]" />
            </div>
          </div>

          {/* INHUMAN Title */}
          <h1 className="text-5xl sm:text-6xl font-bold uppercase mb-3 text-white" style={{ textShadow: '0 0 20px rgba(0, 255, 194, 0.8), 0 0 40px rgba(0, 255, 194, 0.4)' }}>
            INHUMAN
          </h1>

          {/* Sign in to continue */}
          <p className="text-gray-300 text-sm mb-10">Sign in to continue</p>

          {/* Sign In Button */}
          <div className="w-full max-w-sm mb-8">
            {/* Continue with Google */}
            <button
              onClick={startScan}
              className="w-full py-4 bg-white text-black rounded-2xl font-semibold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-md active:scale-[0.98]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* World ID Card */}
          <div className="w-full max-w-sm bg-[#0f2a24] rounded-2xl p-6 border border-[#00FFC2]/20">
            {/* Powered by World ID Badge */}
            <div className="flex justify-center mb-4">
              <div className="px-3 py-1.5 bg-[#00FFC2] rounded-lg flex items-center gap-2">
                <Check size={14} className="text-white" />
                <span className="text-white text-xs font-bold uppercase tracking-wide">POWERED BY WORLD ID</span>
              </div>
            </div>

            {/* Description Text */}
            <p className="text-gray-300 text-sm text-center mb-6 leading-relaxed">
              Some actions require <strong className="text-white">human</strong> verification to protect the community.
            </p>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#00FFC2]/30"></div>
              <div className="w-2 h-2 rounded-full bg-[#00FFC2]"></div>
              <div className="w-2 h-2 rounded-full bg-[#00FFC2]/30"></div>
            </div>
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
        <div className="flex flex-col items-center justify-center min-h-screen w-full px-6 py-20 z-10 mt-16">
          {/* Central Checkmark Circle */}
          <div className="relative mb-10">
            {/* Outer faint ring */}
            <div className="absolute inset-0 w-44 h-44 rounded-full border border-[#00FFC2]/20 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2"></div>
            {/* Inner bright circle with checkmark */}
            <div className="relative w-36 h-36 rounded-full bg-[#00FFC2]/10 border-2 border-[#00FFC2] flex items-center justify-center shadow-[0_0_40px_rgba(0,255,194,0.6)]">
              <CheckCircle2 size={72} className="text-[#00FFC2]" strokeWidth={2.5} />
            </div>
          </div>

          {/* "You're verified" text */}
          <h1 className="text-5xl font-bold text-white mb-8">You're verified</h1>

          {/* ACCESS GRANTED with horizontal lines */}
          <div className="flex items-center gap-4 mb-12 w-full max-w-sm">
            <div className="flex-1 h-0.5 bg-[#00FFC2]"></div>
            <span className="text-[#00FFC2] text-base font-semibold tracking-wider whitespace-nowrap">ACCESS GRANTED</span>
            <div className="flex-1 h-0.5 bg-[#00FFC2]"></div>
          </div>

          {/* Verification Details Card */}
          <div className="w-full max-w-sm bg-[#0a1f1a]/80 border border-[#00FFC2]/30 rounded-3xl p-6 mb-10 backdrop-blur-sm">
            {/* Verification Method */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#00FFC2]/20 flex items-center justify-center border border-[#00FFC2]/30">
                  <Shield size={22} className="text-[#00FFC2]" fill="currentColor" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">VERIFICATION METHOD</div>
                  <div className="text-base text-white font-semibold">World ID Orb</div>
                </div>
              </div>
              <div className="px-3 py-1.5 bg-[#00FFC2]/20 border border-[#00FFC2]/50 rounded-full">
                <span className="text-[#00FFC2] text-[11px] font-bold uppercase tracking-wide">VERIFIED</span>
              </div>
            </div>

            {/* Identity Hash */}
            <div className="flex items-center justify-between pt-5 border-t border-[#00FFC2]/20">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">IDENTITY HASH</div>
              <div className="text-sm text-white font-mono font-semibold">0x4...8f2a</div>
            </div>
          </div>

          {/* Claim Reward Button */}
          <button 
            onClick={() => {
              // Handle reward claim
              console.log('Reward claimed!');
            }}
            className="w-full max-w-sm py-5 bg-[#00FFC2] text-black font-bold text-base rounded-2xl shadow-[0_0_40px_rgba(0,255,194,0.7)] hover:shadow-[0_0_50px_rgba(0,255,194,0.9)] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span className="tracking-wide">CLAIM REWARD</span>
            <PartyPopper size={18} className="group-hover:rotate-12 transition-transform" />
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

      {appState !== AppState.LOCKED && <Footer />}
    </div>
  );
}
