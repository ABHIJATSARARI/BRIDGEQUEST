import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Button } from './Button';

interface TourStep {
  title: string;
  description: string;
  image?: string;
  highlight?: string;
}

interface TourGuideProps {
  onComplete: () => void;
  onSkip: () => void;
}

const tourSteps: TourStep[] = [
  {
    title: "Welcome to BridgeQuest! 🌍",
    description: "A cooperative puzzle game where you're paired with a stranger from another country. Together, you'll solve puzzles that neither of you can solve alone.",
    highlight: "Unity through collaboration"
  },
  {
    title: "The Split Information Mechanic 🔐",
    description: "Here's the twist: You see HALF the puzzle clues on your screen. Your partner sees the OTHER HALF on their screen. You must communicate and share information to find the solution.",
    highlight: "Communication is key"
  },
  {
    title: "Chat with Your Partner 💬",
    description: "Use the chat interface to share your clues, ask questions, and work together. Your partner is an AI with personality based on their country - be friendly and collaborative!",
    highlight: "Build trust through conversation"
  },
  {
    title: "Multiple Puzzle Types 🧩",
    description: "Face diverse challenges: Cultural puzzles (country facts, language phrases), Graph Theory (shortest paths), and Logic puzzles (sequences, patterns). Each powered by Wolfram Alpha!",
    highlight: "Fresh challenges every level"
  },
  {
    title: "Your Unity Score 📊",
    description: "After completing all levels, you'll receive a Unity Report showing how well you collaborated. Scores are based on communication, empathy, and teamwork - not just solving puzzles!",
    highlight: "Real connections matter"
  }
];

export const TourGuide: React.FC<TourGuideProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const isLastStep = currentStep === tourSteps.length - 1;
  const step = tourSteps[currentStep];

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-8 relative shadow-2xl animate-slide-up">
        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-6">
          {tourSteps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                idx <= currentStep ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">{step.title}</h2>
          <p className="text-slate-300 text-lg leading-relaxed mb-6">
            {step.description}
          </p>
          
          {step.highlight && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
              <p className="text-indigo-300 font-semibold flex items-center gap-2">
                <Play className="w-5 h-5" />
                {step.highlight}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0
                ? 'text-slate-600 cursor-not-allowed'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <div className="text-slate-500 text-sm">
            {currentStep + 1} / {tourSteps.length}
          </div>

          <Button
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            {isLastStep ? "Let's Play!" : "Next"}
            {!isLastStep && <ChevronRight className="w-5 h-5" />}
          </Button>
        </div>

        {/* Skip option */}
        {!isLastStep && (
          <button
            onClick={onSkip}
            className="w-full text-center text-slate-500 hover:text-slate-300 text-sm mt-4 transition-colors"
          >
            Skip tutorial
          </button>
        )}
      </div>
    </div>
  );
};
