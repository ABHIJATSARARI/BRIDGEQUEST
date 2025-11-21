import React, { useEffect, useRef } from 'react';
import { Terminal, Activity } from 'lucide-react';

interface WolframTerminalProps {
  logs: string[];
}

export const WolframTerminal: React.FC<WolframTerminalProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-slate-950 border-b border-slate-800 p-4 font-mono text-xs h-48 flex flex-col relative shadow-inner">
      <div className="absolute top-3 right-3 text-emerald-500/50 animate-pulse">
        <Activity className="w-4 h-4" />
      </div>
      
      <div className="flex items-center gap-2 text-slate-500 mb-3 uppercase tracking-widest text-[10px] border-b border-slate-800 pb-2">
        <Terminal className="w-3 h-3" />
        Wolfram Kernel v14.1 [Connected]
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide pr-2">
        {logs.length === 0 && (
          <div className="text-slate-600 italic">Initializing connection...</div>
        )}
        {logs.map((log, i) => (
          <div key={i} className="break-words group leading-relaxed">
            <span className="text-slate-600 mr-2 select-none group-hover:text-slate-500 transition-colors">{`In[${i+1}]:=`}</span>
            <span className={`${
              log.includes("Error") ? "text-red-400" : 
              log.includes("Success") ? "text-emerald-400" :
              log.includes("Wolfram") ? "text-indigo-400" : "text-slate-300"
            }`}>
              {log}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/5 to-transparent pointer-events-none opacity-50" />
    </div>
  );
};