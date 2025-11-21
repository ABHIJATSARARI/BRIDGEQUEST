import React, { useEffect, useState } from 'react';
import { Brain, Globe, Zap, Users } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);

  const phases = [
    { icon: Brain, label: 'Initializing Wolfram Engine', color: 'text-purple-400', delay: 0 },
    { icon: Globe, label: 'Connecting Global Network', color: 'text-emerald-400', delay: 2000 },
    { icon: Users, label: 'Preparing Cooperative Protocols', color: 'text-indigo-400', delay: 4000 },
    { icon: Zap, label: 'Generating Puzzle Matrix', color: 'text-amber-400', delay: 6000 }
  ];

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.25; // 100% in 8 seconds
      });
    }, 100);

    // Phase transitions
    const phaseTimers = phases.map((phase, index) => 
      setTimeout(() => setCurrentPhase(index), phase.delay)
    );

    // Complete after 8 seconds
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 8000);

    return () => {
      clearInterval(progressInterval);
      phaseTimers.forEach(timer => clearTimeout(timer));
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const CurrentIcon = phases[currentPhase].icon;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl top-1/2 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -bottom-48 left-1/3 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        {/* Logo/Icon animation */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 animate-ping"></div>
          </div>
          <div className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-indigo-500/50 flex items-center justify-center shadow-2xl shadow-indigo-500/50">
            <CurrentIcon className={`w-16 h-16 ${phases[currentPhase].color} transition-all duration-500`} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tight">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 animate-gradient">
            BRIDGEQUEST
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-400 text-lg mb-8">
          No One Can Solve It Alone
        </p>

        {/* Phase indicator */}
        <div className="mb-8 h-12 flex items-center justify-center">
          <p className={`text-sm font-mono ${phases[currentPhase].color} transition-all duration-500 flex items-center gap-2`}>
            <span className="inline-block w-2 h-2 rounded-full bg-current animate-pulse"></span>
            {phases[currentPhase].label}
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md mx-auto">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-300 ease-out shadow-lg shadow-indigo-500/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-slate-500 text-xs mt-2 font-mono">{Math.floor(progress)}%</p>
        </div>

        {/* Phase dots */}
        <div className="flex justify-center gap-2 mt-8">
          {phases.map((phase, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-500 ${
                index <= currentPhase 
                  ? 'bg-indigo-500 scale-125' 
                  : 'bg-slate-700'
              }`}
            ></div>
          ))}
        </div>

        {/* Powered by */}
        <div className="mt-12 flex items-center justify-center gap-2 text-xs text-slate-600">
          <Zap className="w-3 h-3" />
          <span>Powered by Wolfram Alpha & Google AI</span>
        </div>
      </div>

      {/* Particle effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-indigo-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
