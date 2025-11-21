import React, { useState } from 'react';
import { Globe, Brain, Share2, ArrowRight, HelpCircle, Zap, Users, Target, Play } from 'lucide-react';
import { Button } from './Button';
import { TourGuide } from './TourGuide';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [showTour, setShowTour] = useState(false);

  const handleStartWithTour = () => {
    setShowTour(true);
  };

  const handleTourComplete = () => {
    setShowTour(false);
    onStart();
  };

  const handleTourSkip = () => {
    setShowTour(false);
  };

  return (
    <>
      <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl top-1/2 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -bottom-48 left-1/3 animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {/* Hero Section */}
          <div className="flex-1 flex items-center justify-center px-6 py-12">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 backdrop-blur-sm">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-indigo-300 text-sm font-semibold tracking-wide">Powered by Wolfram Alpha & Google AI</span>
              </div>
              
              {/* Title */}
              <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 animate-gradient">
                  BRIDGEQUEST
                </span>
              </h1>
              
              {/* Subtitle */}
              <p className="text-2xl md:text-3xl text-slate-200 mb-4 font-semibold">
                No One Can Solve It Alone
              </p>
              <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed max-w-3xl mx-auto">
                Join forces with a stranger from across the world. Each puzzle splits information between you—
                <span className="text-indigo-300 font-semibold"> cooperation isn't optional, it's the only way forward.</span>
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <Button 
                  onClick={handleStartWithTour}
                  className="text-lg px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transform hover:scale-105 transition-all shadow-lg shadow-indigo-500/50"
                >
                  <Play className="w-5 h-5" />
                  Start Adventure
                </Button>
                
                <button
                  onClick={() => setShowTour(true)}
                  className="text-lg px-8 py-4 rounded-xl border-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-slate-500 transition-all flex items-center gap-2"
                >
                  <HelpCircle className="w-5 h-5" />
                  How to Play
                </button>
              </div>

              {/* Quick stats */}
              <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>2 Players, 1 Goal</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-400" />
                  <span>4 Levels of Unity</span>
                </div>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>AI-Generated Puzzles</span>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="max-w-6xl mx-auto px-6 pb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-slate-200">Why BridgeQuest is Different</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="group p-8 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 hover:border-indigo-500/50 transition-all duration-300 hover:scale-105">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">🧬 Split Information</h3>
                <p className="text-slate-400 leading-relaxed">
                  You see half the puzzle. Your partner sees the other half. Neither of you can succeed without sharing what you know.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-8 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">🌍 Cross-Cultural Bonds</h3>
                <p className="text-slate-400 leading-relaxed">
                  Match with partners from different countries. Solve language puzzles, discover similarities, and build real connections.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-8 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/60 hover:border-indigo-500/50 transition-all duration-300 hover:scale-105">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">⚡ Wolfram-Powered</h3>
                <p className="text-slate-400 leading-relaxed">
                  Every puzzle uses real Wolfram Alpha data. Graph theory, cultural facts, mathematical sequences—always unique.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tour Modal */}
      {showTour && (
        <TourGuide onComplete={handleTourComplete} onSkip={handleTourSkip} />
      )}
    </>
  );
};