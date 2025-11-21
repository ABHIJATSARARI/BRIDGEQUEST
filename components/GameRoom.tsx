import React, { useState, useEffect, useRef } from 'react';
import { PartnerProfile, PuzzleData, ChatMessage, UnityMetrics } from '../types';
import { generatePuzzle, getPartnerChatResponse } from '../services/geminiService';
import { Button } from './Button';
import { WolframTerminal } from './WolframTerminal';
import { HelpTooltip } from './HelpTooltip';
import { Send, HelpCircle, AlertTriangle, CheckCircle2, Brain, MessageCircle, Lock, ClipboardList, Check, X, FastForward, Share2, Target } from 'lucide-react';
import { LEVEL_THEMES } from '../constants';

interface GameRoomProps {
  partner: PartnerProfile;
  onComplete: (metrics: UnityMetrics) => void;
}

type LevelStatus = 'locked' | 'active' | 'solved' | 'skipped' | 'failed';

export const GameRoom: React.FC<GameRoomProps> = ({ partner, onComplete }) => {
  const [loading, setLoading] = useState(true);
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins
  const [level, setLevel] = useState(1);
  
  // Performance Tracking for Unity Score
  const [errorCount, setErrorCount] = useState(0);
  const [levelStartTimes, setLevelStartTimes] = useState<number[]>([]);
  const [levelCompletionTimes, setLevelCompletionTimes] = useState<number[]>([]);
  
  // Wolfram Terminal State
  const [wolframLogs, setWolframLogs] = useState<string[]>([]);
  
  // Mission Log State
  const [showMissionLog, setShowMissionLog] = useState(false);
  const [levelHistory, setLevelHistory] = useState<LevelStatus[]>(
    new Array(LEVEL_THEMES.length).fill('locked')
  );
  
  // Help/Context State
  const [showContext, setShowContext] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper for unique IDs
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Helper to add terminal logs
  const addWolframLog = (log: string) => {
    setWolframLogs(prev => [...prev, log]);
  };

  // Initialize Game
  useEffect(() => {
    addWolframLog(`NotebookDirectory[] -> "/BridgeQuest/Sessions/${partner.country}"`);
    addWolframLog(`CloudConnect[${partner.name}]`);
    
    // Set initial level status
    updateLevelStatus(1, 'active');
    loadLevel(1);
    
    // Start Timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const updateLevelStatus = (lvl: number, status: LevelStatus) => {
    setLevelHistory(prev => {
      const newHistory = [...prev];
      if (lvl - 1 < newHistory.length) {
        newHistory[lvl - 1] = status;
      }
      return newHistory;
    });
  };

  const loadLevel = async (lvl: number) => {
    setLoading(true);
    setShowContext(false); // Reset context visibility
    
    // Track level start time
    setLevelStartTimes(prev => {
      const newTimes = [...prev];
      newTimes[lvl - 1] = Date.now();
      return newTimes;
    });
    
    addWolframLog(`SetDirectory["Level_${lvl}"]; Import["topology.wxf"]`);
    addWolframLog(`WolframAlpha["Calculate complexity index for Level ${lvl}"]`);

    // Use robust ID generation to prevent duplicate keys
    setChat(prev => [...prev, {
      id: generateId(),
      sender: 'system',
      text: `Entering ${LEVEL_THEMES[lvl-1]?.name || "Unknown Zone"}...`,
      timestamp: Date.now()
    }]);

    // Calculate performance metrics for adaptive difficulty
    const avgCompletionTime = levelCompletionTimes.length > 0
      ? levelCompletionTimes.reduce((a, b) => a + b, 0) / levelCompletionTimes.length
      : 0;
    const chatActivity = chat.filter(c => c.sender === 'user').length;

    const performanceMetrics = {
      errorCount,
      avgCompletionTime,
      chatActivity
    };

    const newPuzzle = await generatePuzzle(lvl, partner.country, "USA", performanceMetrics);
    setPuzzle(newPuzzle);
    
    if (newPuzzle.wolframContext) {
        // Extract the mock call from context for the log
        const mockCall = newPuzzle.wolframContext.split(';')[0] || "GeneratePuzzle[]";
        addWolframLog(mockCall);
    }
    
    setLoading(false);

    // Partner greeting
    setTimeout(async () => {
        const greeting = await getPartnerChatResponse(
            [{ role: 'system', text: 'The game has started. Greet your partner.' }],
            newPuzzle,
            partner.name,
            partner.country
        );
        addMessage('partner', greeting);
    }, 1500);
  };

  const addMessage = (sender: 'user' | 'partner' | 'system', text: string) => {
    setChat(prev => [...prev, { id: generateId(), sender, text, timestamp: Date.now() }]);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !puzzle) return;
    
    const userMsg = input;
    addMessage('user', userMsg);
    setInput("");
    
    addWolframLog(`TextStructure["${userMsg.substring(0, 15)}...", "Sentiment"]`);

    // Simulate Partner Thinking & Typing
    setTimeout(async () => {
      const history = chat.map(c => ({ 
          role: c.sender === 'user' ? 'user' : (c.sender === 'partner' ? 'model' : 'system'), 
          text: c.text 
      }));
      history.push({ role: 'user', text: userMsg });

      const response = await getPartnerChatResponse(history, puzzle, partner.name, partner.country);
      addMessage('partner', response);
    }, 2000);
  };

  const advanceLevel = (status: 'solved' | 'skipped') => {
    updateLevelStatus(level, status);
    
    // Track completion time for this level
    if (status === 'solved') {
      const completionTime = Date.now() - (levelStartTimes[level - 1] || Date.now());
      setLevelCompletionTimes(prev => {
        const newTimes = [...prev];
        newTimes[level - 1] = completionTime;
        return newTimes;
      });
    }
    
    setAnswer("");
    
    if (level < LEVEL_THEMES.length) {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        updateLevelStatus(nextLevel, 'active');
        loadLevel(nextLevel);
    } else {
        addWolframLog(`Evaluation["FinalScore"] // Total`);
        
        // Calculate Real Unity Score
        const metrics = calculateUnityMetrics();
        onComplete(metrics);
    }
  };

  // Calculate real Unity Score based on gameplay
  const calculateUnityMetrics = (): UnityMetrics => {
    const userMessages = chat.filter(c => c.sender === 'user').length;
    const partnerMessages = chat.filter(c => c.sender === 'partner').length;
    const totalMessages = userMessages + partnerMessages;
    
    // Collaboration: Based on message exchange (more communication = higher score)
    // Target: 10+ messages for 100 score
    const collaboration = Math.min(100, Math.max(50, totalMessages * 5));
    
    // Communication: Based on balanced conversation (both players talking)
    const messageBalance = Math.min(userMessages, partnerMessages) / Math.max(userMessages, partnerMessages, 1);
    const communication = Math.min(100, Math.max(60, messageBalance * 100));
    
    // Empathy: Based on positive words and error patience
    // Detect supportive language
    const supportiveWords = ['thanks', 'great', 'good', 'help', 'together', 'nice', 'awesome', 'perfect'];
    const empathyMessages = chat.filter(c => 
      c.sender === 'user' && supportiveWords.some(word => c.text.toLowerCase().includes(word))
    ).length;
    const empathy = Math.min(100, Math.max(70, 80 + empathyMessages * 5 - errorCount * 2));
    
    // Solved levels
    const solvedLevels = levelHistory.filter(s => s === 'solved').length;
    const skippedLevels = levelHistory.filter(s => s === 'skipped').length;
    
    // Penalty for skips
    const skipPenalty = skippedLevels * 10;
    
    // Bonus for solving all
    const completionBonus = solvedLevels === LEVEL_THEMES.length ? 10 : 0;
    
    return {
      collaboration: Math.max(0, Math.min(100, collaboration - skipPenalty + completionBonus)),
      empathy: Math.max(0, Math.min(100, empathy)),
      communication: Math.max(0, Math.min(100, communication - skipPenalty)),
      timeTaken: 300 - timeLeft
    };
  };

  const handleSubmitAnswer = () => {
    if (!puzzle) return;
    
    addWolframLog(`VerifySolution["${answer}", "${puzzle.solution}"]`);
    
    if (answer.toLowerCase().trim() === puzzle.solution.toLowerCase().trim()) {
      addMessage('system', 'Puzzle Solved! Unity connection strengthening...');
      addWolframLog(`Success["PatternMatched"]`);
      advanceLevel('solved');
    } else {
      // Track error for metrics
      setErrorCount(prev => prev + 1);
      setError("Incorrect. Consult your partner.");
      addWolframLog(`Error["Mismatch"]`);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleSkipLevel = () => {
    if (confirm("Are you sure you want to skip this puzzle? This will affect your Unity Score.")) {
      addMessage('system', 'Puzzle Skipped. Advancing to next sector...');
      addWolframLog(`AbortKernels[]; NextLevel[]`);
      advanceLevel('skipped');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center flex-col bg-slate-950 animate-fade-in">
         <Brain className="w-16 h-16 text-indigo-500 animate-bounce mb-4" />
         <h2 className="text-xl text-slate-300">Generating Wolfram Puzzle Topology...</h2>
         <p className="text-sm text-slate-500 mt-2">Level {level}: {LEVEL_THEMES[level-1]?.name}</p>
         <div className="flex items-center gap-2 mt-4">
            {LEVEL_THEMES.map((_, idx) => (
               <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx + 1 === level 
                        ? 'w-6 bg-indigo-500' 
                        : idx + 1 < level 
                           ? 'w-2 bg-emerald-500' 
                           : 'w-2 bg-slate-800'
                  }`}
               />
            ))}
         </div>
         <div className="mt-8 w-96 max-w-full">
            <WolframTerminal logs={wolframLogs} />
         </div>
      </div>
    );
  }

  if (!puzzle) return <div>Error loading puzzle</div>;

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 p-4 flex justify-between items-center relative z-20">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${partner.avatarColor} flex items-center justify-center text-white font-bold`}>
            {partner.name[0]}
          </div>
          <div>
            <h1 className="font-bold text-slate-200">{partner.name} <span className="text-slate-500 text-sm font-normal">({partner.country})</span></h1>
            <div className="text-xs text-emerald-400 flex items-center gap-1">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div> Connected
            </div>
          </div>
        </div>

        <div className="text-center flex flex-col items-center hidden md:flex">
           <div className="text-xs text-slate-500 uppercase tracking-widest mb-1">Current Zone</div>
           <div className={`font-bold ${LEVEL_THEMES[level-1]?.color}`}>{LEVEL_THEMES[level-1]?.name}</div>
        </div>

        <div className="flex items-center gap-3">
            {/* Mission Log Toggle */}
            <div className="relative">
              <button 
                onClick={() => setShowMissionLog(!showMissionLog)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors border ${
                  showMissionLog 
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' 
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">LOG</span>
              </button>

              {/* Mission Log Dropdown */}
              {showMissionLog && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-fade-in">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 border-b border-slate-800 pb-2 flex justify-between items-center">
                    Mission Checklist
                    <button onClick={() => setShowMissionLog(false)} className="text-slate-500 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </h4>
                  <div className="space-y-3">
                    {LEVEL_THEMES.map((theme, idx) => {
                      const status = levelHistory[idx];
                      let Icon = Lock;
                      let color = "text-slate-600";
                      
                      if (status === 'solved') { Icon = Check; color = "text-emerald-400"; }
                      if (status === 'skipped') { Icon = FastForward; color = "text-amber-400"; }
                      if (status === 'active') { Icon = Brain; color = "text-indigo-400"; }
                      if (status === 'failed') { Icon = X; color = "text-red-400"; }

                      return (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <div className={`p-1 rounded bg-slate-800 ${color}`}>
                              <Icon className="w-3 h-3" />
                            </div>
                            <span className={`${status === 'active' ? 'text-white font-bold' : 'text-slate-400'}`}>
                              Level {idx + 1}
                            </span>
                          </div>
                          <span className={`text-[10px] uppercase font-mono ${color}`}>
                            {status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700 hidden sm:block">
                <span className="text-slate-400 text-xs uppercase mr-2">Time</span>
                <span className="font-mono font-bold text-slate-200">{(timeLeft / 60).toFixed(0)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div 
        className="w-full bg-slate-900/80 border-b border-slate-800 px-6 py-3 flex items-center gap-4 backdrop-blur-md z-10"
        role="region"
        aria-label="Adventure Progress"
      >
         <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Adventure Progress</div>
         <div 
            className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden relative"
            role="progressbar"
            aria-valuenow={level}
            aria-valuemin={1}
            aria-valuemax={LEVEL_THEMES.length}
            aria-label={`Level ${level} of ${LEVEL_THEMES.length}`}
         >
            <div className="absolute inset-0 flex">
               {Array.from({ length: LEVEL_THEMES.length }).map((_, i) => (
                  <div key={i} className="flex-1 border-r border-slate-900/50 last:border-0"></div>
               ))}
            </div>
            
            <div 
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                style={{ width: `${(level / LEVEL_THEMES.length) * 100}%` }}
            />
         </div>
         <div className="text-xs font-mono text-indigo-300 font-bold whitespace-nowrap">
            LEVEL {level}<span className="text-slate-600 mx-1">/</span>{LEVEL_THEMES.length}
         </div>
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* Puzzle Area */}
        <div key={puzzle.id} className="flex-1 p-6 flex flex-col overflow-y-auto animate-fade-in">
            <div className="mb-6">
                <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-2">
                   <Lock className="w-3 h-3" /> WOLFRAM_DATA_STREAM_SECURE
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-white">{puzzle.title}</h2>
                  <button 
                    onClick={() => setShowContext(!showContext)}
                    className={`p-1.5 rounded-full transition-colors ${showContext ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500 hover:text-indigo-400'}`}
                    title="Reveal Wolfram Context"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-slate-400 leading-relaxed">{puzzle.description}</p>
                
                {showContext && (
                  <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg font-mono text-xs text-indigo-300 animate-fade-in">
                    <div className="flex items-center gap-2 mb-1 text-indigo-400 font-bold uppercase tracking-wider text-[10px]">
                      <Brain className="w-3 h-3" /> Wolfram Knowledge Engine
                    </div>
                    {puzzle.wolframContext}
                  </div>
                )}
            </div>

            {/* The Split Information View */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-indigo-400" />
                    Split Information Protocol
                  </h3>
                  <HelpTooltip text="Each player sees different clues. Work together to solve!" />
                </div>
                <p className="text-sm text-slate-400 hidden md:block">You and {partner.name} each see different clues. Share to solve!</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My View */}
                <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border-2 border-indigo-500/50 rounded-xl p-6 relative group shadow-lg shadow-indigo-500/10">
                    <div className="absolute -top-3 left-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Your Clues
                    </div>
                    <h3 className="text-lg font-semibold text-indigo-300 mb-4 mt-2">What YOU can see:</h3>
                    
                    <div className="space-y-3">
                        {puzzle.playerClues.map((clue, idx) => (
                            <div key={idx} className="bg-slate-800/60 p-4 rounded-lg border-l-4 border-indigo-500 hover:bg-slate-800 transition-colors">
                                <div className="flex items-start gap-3">
                                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-indigo-300 text-xs font-bold">{idx + 1}</span>
                                  </div>
                                  <p className="text-slate-200 font-mono text-sm leading-relaxed flex-1">{clue}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Partner's Missing Data */}
                <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center relative group shadow-inner">
                    <div className="absolute -top-3 left-4 bg-slate-700 text-slate-400 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1.5">
                        <Lock className="w-3 h-3" />
                        {partner.name}'s Clues
                    </div>
                    <div className="mb-6">
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 border-2 border-slate-700">
                        <AlertTriangle className="w-8 h-8 text-amber-500/70 animate-pulse" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-300 mb-2">Data Locked</h3>
                      <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
                          Critical information required to solve this puzzle is on {partner.name}'s screen.
                      </p>
                    </div>
                    
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 max-w-xs mx-auto">
                      <p className="text-indigo-300 text-sm italic flex items-center gap-2 justify-center">
                          <MessageCircle className="w-4 h-4" />
                          "Ask {partner.name} to share their clues!"
                      </p>
                    </div>
                </div>
              </div>
            </div>

            {/* Action Area */}
            <div className="mt-6 bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-xl border-2 border-slate-700 shadow-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <label className="text-sm text-slate-300 font-semibold uppercase tracking-wide">Submit Your Solution</label>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                  <input 
                      type="text" 
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                      className="flex-1 bg-slate-950 border-2 border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 font-mono transition-colors text-lg"
                      placeholder="Type your answer here and press Enter..."
                  />
                  <div className="flex gap-3">
                    <button 
                        onClick={handleSkipLevel}
                        className="px-5 py-3 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white font-semibold rounded-lg transition-all flex items-center gap-2 border border-slate-600 hover:border-slate-500"
                    >
                        <FastForward className="w-4 h-4" /> 
                        Skip
                    </button>
                    <button
                        onClick={handleSubmitAnswer}
                        disabled={!answer.trim()}
                        className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:shadow-none"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        Submit
                    </button>
                  </div>
                </div>
                {error && <div className="mt-3 text-red-400 text-sm animate-pulse flex items-center gap-2">
                  <X className="w-4 h-4" />
                  {error}
                </div>}
            </div>
        </div>

        {/* Chat Sidebar with Wolfram Terminal */}
        <div className="w-80 md:w-96 border-l border-slate-800 bg-slate-900 flex flex-col">
            {/* Wolfram Terminal Integrated at Top of Sidebar */}
            <div className="flex-none">
                <WolframTerminal logs={wolframLogs} />
            </div>

            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-emerald-400" /> Secure Link
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {chat.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                            msg.sender === 'user' 
                                ? 'bg-indigo-600 text-white' 
                                : msg.sender === 'system'
                                ? 'bg-slate-800 text-slate-400 text-xs text-center w-full italic'
                                : 'bg-slate-700 text-slate-100'
                        }`}>
                            {msg.sender !== 'user' && msg.sender !== 'system' && (
                                <div className="text-xs text-slate-400 mb-1 font-bold">{partner.name}</div>
                            )}
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-900">
                 <div className="relative">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Describe what you see..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                    <button 
                        onClick={handleSendMessage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-white p-1"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                 </div>
                 <div className="mt-2 flex gap-2">
                     <button 
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded flex items-center gap-1"
                        onClick={() => setInput("I see a sequence starting with...")}
                     >
                         <HelpCircle className="w-3 h-3" /> Share Clue
                     </button>
                     <button 
                         className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 px-2 py-1 rounded flex items-center gap-1"
                         onClick={() => setInput("What do you see on your side?")}
                     >
                         <HelpCircle className="w-3 h-3" /> Ask Partner
                     </button>
                 </div>
            </div>
        </div>
      </main>
    </div>
  );
};