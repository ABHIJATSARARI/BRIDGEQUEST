import React, { useState } from 'react';
import { GameState, PartnerProfile, UnityMetrics } from './types';
import { SplashScreen } from './components/SplashScreen';
import { LandingPage } from './components/LandingPage';
import { Lobby } from './components/Lobby';
import { GameRoom } from './components/GameRoom';
import { PostGameReport } from './components/PostGameReport';
import { DevChecklist } from './components/DevChecklist';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [gameState, setGameState] = useState<GameState>(GameState.LANDING);
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [metrics, setMetrics] = useState<UnityMetrics | null>(null);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleStart = () => {
    setGameState(GameState.LOBBY);
  };

  const handleMatchFound = (foundPartner: PartnerProfile) => {
    setPartner(foundPartner);
    setGameState(GameState.PLAYING);
  };

  const handleGameComplete = (results: UnityMetrics) => {
    setMetrics(results);
    setGameState(GameState.VICTORY);
  };

  const handleRestart = () => {
    setGameState(GameState.LANDING);
    setPartner(null);
    setMetrics(null);
  };

  return (
    <div className="font-sans relative">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      
      {!showSplash && (
        <>
          <DevChecklist />
          
          {gameState === GameState.LANDING && (
            <LandingPage onStart={handleStart} />
          )}

          {gameState === GameState.LOBBY && (
            <Lobby onMatchFound={handleMatchFound} />
          )}

          {gameState === GameState.PLAYING && partner && (
            <GameRoom partner={partner} onComplete={handleGameComplete} />
          )}

          {gameState === GameState.VICTORY && metrics && partner && (
            <PostGameReport 
              metrics={metrics} 
              partner={partner} 
              onRestart={handleRestart} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;