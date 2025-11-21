import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, ClipboardList, ExternalLink } from 'lucide-react';

export const DevChecklist: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const features = [
    { id: 'ai_puzzles', label: '1. AI-Generated Cooperative Puzzles (Wolfram)' },
    { id: 'cultural', label: '2. Cross-Cultural Missions' },
    { id: 'collab', label: '3. Real-time Collaboration (Chat/Clues)' },
    { id: 'diff', label: '4. Dynamic Difficulty Balancing' },
    { id: 'pairing', label: '5. Global Pairing Algorithm' },
    { id: 'score', label: '6. Unity Score System' },
    { id: 'levels', label: '7. Replayable Quests & Adventure Mode' },
  ];

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className={`fixed bottom-4 left-4 z-50 transition-all duration-300 ${isOpen ? 'w-80' : 'w-12'}`}>
      <div className="bg-slate-900/90 backdrop-blur border border-slate-700 rounded-lg shadow-2xl overflow-hidden">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full p-3 flex items-center ${isOpen ? 'justify-between bg-slate-800' : 'justify-center hover:bg-slate-800'} transition-colors`}
        >
          {isOpen ? (
            <>
              <span className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-400" /> Feature Verification
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </>
          ) : (
            <ClipboardList className="w-5 h-5 text-emerald-400" />
          )}
        </button>

        {isOpen && (
          <div className="p-4 max-h-[60vh] overflow-y-auto">
             <p className="text-xs text-slate-500 mb-3">
               Verify BridgeQuest hackathon requirements as you test the prototype.
             </p>
             <div className="space-y-2">
               {features.map(f => (
                 <div 
                   key={f.id} 
                   onClick={() => toggleItem(f.id)}
                   className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-all ${
                     checkedItems[f.id] ? 'bg-emerald-900/20 border border-emerald-500/20' : 'hover:bg-slate-800 border border-transparent'
                   }`}
                 >
                   <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                     checkedItems[f.id] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-600 bg-slate-800'
                   }`}>
                     {checkedItems[f.id] && <CheckCircle2 className="w-3 h-3" />}
                   </div>
                   <span className={`text-xs ${checkedItems[f.id] ? 'text-emerald-300 line-through opacity-70' : 'text-slate-300'}`}>
                     {f.label}
                   </span>
                 </div>
               ))}
             </div>
             <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center">
                <span>BridgeQuest v1.0.0</span>
                <span className="flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Wolfram Enabled</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};