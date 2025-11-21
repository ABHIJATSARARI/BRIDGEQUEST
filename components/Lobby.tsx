import React, { useEffect, useState } from 'react';
import { Globe, Radio, MapPin } from 'lucide-react';
import { PartnerProfile } from '../types';
import { MOCK_PARTNERS } from '../constants';

interface LobbyProps {
  onMatchFound: (partner: PartnerProfile) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onMatchFound }) => {
  const [status, setStatus] = useState("Initializing Wolfram Connection...");
  const [scanAngle, setScanAngle] = useState(0);

  useEffect(() => {
    // Animation loop
    const interval = setInterval(() => {
      setScanAngle(p => (p + 2) % 360);
    }, 16);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Mock matchmaking sequence
    const steps = [
      { time: 1000, msg: "Analyzing puzzle skill via Wolfram SkillAssessment[]..." },
      { time: 3000, msg: "Scanning global nodes for compatible partners..." },
      { time: 4500, msg: "Optimizing for cultural distance (Unity Protocol)..." },
      { time: 6000, msg: "Match Found!" }
    ];

    let timeouts: ReturnType<typeof setTimeout>[] = [];

    steps.forEach(step => {
      const t = setTimeout(() => {
        setStatus(step.msg);
        if (step.msg === "Match Found!") {
          // Pick random partner
          const partner = MOCK_PARTNERS[Math.floor(Math.random() * MOCK_PARTNERS.length)];
          setTimeout(() => onMatchFound(partner), 1000);
        }
      }, step.time);
      timeouts.push(t);
    });

    return () => timeouts.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-center px-4">
      <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
        {/* Radar/Globe Visual */}
        <div className="absolute inset-0 rounded-full border-2 border-indigo-900/50 animate-pulse"></div>
        <div className="absolute inset-4 rounded-full border border-indigo-500/20"></div>
        
        {/* Scanning Line */}
        <div 
          className="absolute w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 top-1/2 left-0 origin-center"
          style={{ transform: `rotate(${scanAngle}deg)` }}
        ></div>

        <Globe className="w-32 h-32 text-slate-700 animate-pulse" />
        
        {/* Decor */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 bg-slate-900 px-3 py-1 text-xs text-emerald-400 border border-emerald-900 rounded-full flex items-center gap-2">
          <Radio className="w-3 h-3 animate-ping" /> LIVE
        </div>
      </div>

      <h2 className="text-2xl font-bold text-slate-200 mb-2 font-mono">{status}</h2>
      <p className="text-slate-500 max-w-md">
        Our algorithm intentionally pairs you with someone from a different culture to maximize the Unity Score.
      </p>

      <div className="mt-12 grid grid-cols-2 gap-4 opacity-50 pointer-events-none">
         {/* Fake nodes lighting up */}
         <div className="flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="w-3 h-3" /> node_tokyo_active
         </div>
         <div className="flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="w-3 h-3" /> node_oslo_active
         </div>
      </div>
    </div>
  );
};