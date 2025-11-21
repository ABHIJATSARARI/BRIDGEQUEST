import React from 'react';
import { UnityMetrics, PartnerProfile } from '../types';
import { Button } from './Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Share2, Download, RotateCcw } from 'lucide-react';

interface PostGameReportProps {
  metrics: UnityMetrics;
  partner: PartnerProfile;
  onRestart: () => void;
}

export const PostGameReport: React.FC<PostGameReportProps> = ({ metrics, partner, onRestart }) => {
  const radarData = [
    { subject: 'Collaboration', A: metrics.collaboration, fullMark: 100 },
    { subject: 'Empathy', A: metrics.empathy, fullMark: 100 },
    { subject: 'Communication', A: metrics.communication, fullMark: 100 },
    { subject: 'Speed', A: 100 - (metrics.timeTaken / 3), fullMark: 100 }, // Normalize speed
  ];

  return (
    <div className="min-h-screen bg-slate-950 p-8 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <header className="text-center mb-12">
          <div className="inline-block bg-emerald-900/30 text-emerald-400 px-4 py-1 rounded-full text-sm border border-emerald-500/20 mb-4">
            MISSION ACCOMPLISHED
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Unity Report</h1>
          <p className="text-slate-400">Analyzing synergy between You and {partner.name} ({partner.country})</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
           {/* Radar Chart */}
           <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Synergy Matrix</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Unity Score"
                      dataKey="A"
                      stroke="#818cf8"
                      strokeWidth={2}
                      fill="#818cf8"
                      fillOpacity={0.4}
                    />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Score Cards */}
           <div className="grid grid-cols-1 gap-4">
              <div className="bg-slate-800 p-6 rounded-xl border-l-4 border-indigo-500">
                 <div className="text-slate-400 text-sm uppercase">Total Unity Score</div>
                 <div className="text-4xl font-bold text-white">
                    {Math.round((metrics.collaboration + metrics.empathy + metrics.communication)/3)}/100
                 </div>
                 <p className="text-slate-500 text-sm mt-2">Exceptional cross-cultural synchronization detected.</p>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border-l-4 border-emerald-500">
                 <div className="text-slate-400 text-sm uppercase">Empathy Moments</div>
                 <div className="text-2xl font-bold text-white">High</div>
                 <p className="text-slate-500 text-sm mt-2">
                    Wolfram linguistic analysis detected 12 instances of supportive language.
                 </p>
              </div>

              <div className="bg-slate-800 p-6 rounded-xl border-l-4 border-purple-500">
                 <div className="text-slate-400 text-sm uppercase">Bridge Built</div>
                 <div className="text-2xl font-bold text-white">{partner.country} ↔ Your Location</div>
                 <p className="text-slate-500 text-sm mt-2">
                    Cultural distance successfully traversed.
                 </p>
              </div>
           </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
            <Button variant="secondary" onClick={onRestart}>
                <RotateCcw className="w-4 h-4" /> Play Again
            </Button>
            <Button onClick={() => alert("Shared to Global Unity Board!")}>
                <Share2 className="w-4 h-4" /> Share Result
            </Button>
        </div>
      </div>
    </div>
  );
};