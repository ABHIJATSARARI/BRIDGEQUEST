import React from 'react';
import { Info } from 'lucide-react';

interface HelpTooltipProps {
  text: string;
}

export const HelpTooltip: React.FC<HelpTooltipProps> = ({ text }) => {
  return (
    <div className="group relative inline-block">
      <Info className="w-4 h-4 text-slate-500 hover:text-indigo-400 cursor-help transition-colors" />
      <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-slate-200 text-xs rounded-lg whitespace-nowrap z-50 shadow-xl border border-slate-700">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  );
};
