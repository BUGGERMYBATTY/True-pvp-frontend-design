import React, { useState, useCallback, useEffect } from 'react';
import { Screen, BET_AMOUNTS } from '../types.ts';
import BettingScreen from '../components/BettingScreen.tsx';
import MatchingScreen from '../components/MatchingScreen.tsx';
import ViperPitGameScreen from '../components/ViperPitGameScreen.tsx';
import WinnerScreen from '../components/WinnerScreen.tsx';
import HowToPlayModal from '../components/HowToPlayModal.tsx';
import { playSound } from '../utils/audio.ts';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

interface ViperPitProps {
  walletAddress: string;
  nickname: string;
  balance: number;
  onExitGame: () => void;
  onRequestMatch: (gameId: string, betAmount: number) => Promise<{ matched: boolean; gameId: string | null } | null>;
  onCancelMatch: (gameId: string, betAmount: number) => void;
  refetchBalance: () => void;
  provider: any;
  connection: any;
  isDemoMode: boolean;
}

const ViperPit: React.FC<ViperPitProps> = ({
  walletAddress,
  nickname,
  balance,
  onExitGame,
  onRequestMatch,
  onCancelMatch,
  refetchBalance,
}) => {
  const [screen, setScreen] = useState<Screen>(Screen.Betting);
  const [betAmount, setBetAmount] = useState<number>(BET_AMOUNTS[0]);
  const [gameResult, setGameResult] = useState<{ winnerId: number | null, forfeited: boolean }>({ winnerId: null, forfeited: false });
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const walletConnected = !!walletAddress;

  const handleFindOpponent = useCallback(async (amount: number) => {
    if (!walletConnected || balance < amount) return;
    setBetAmount(amount);
    setScreen(Screen.Matching);
    const matchResult = await onRequestMatch('cosmic-dodge', amount);
    if (matchResult?.matched && matchResult.gameId) {
      playSound('matchFound');
      setGameId(matchResult.gameId);
      setScreen(Screen.Game);
    } else if (matchResult === null) {
      setScreen(Screen.Betting);
    }
  }, [walletConnected, balance, onRequestMatch]);

  useEffect(() => {
    if (screen !== Screen.Matching || gameId) return;
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/matchmaking/status/${walletAddress}`);
        const data = await response.json();
        if (data.status === 'matched' && data.gameId) {
          clearInterval(intervalId);
          playSound('matchFound');
          setGameId(data.gameId);
          setScreen(Screen.Game);
        }
      } catch (error) { console.error("Error polling for match status:", error); }
    }, 2000);
    return () => clearInterval(intervalId);
  }, [screen, walletAddress, gameId]);
  
  const handleGameOver = useCallback((winnerId: number | null, forfeited = false) => {
    setGameResult({ winnerId, forfeited });
    setScreen(Screen.Winner);
    refetchBalance();
  }, [refetchBalance]);

  const handlePlayAgain = useCallback(() => {
    playSound('uiClick');
    setGameResult({ winnerId: null, forfeited: false });
    setGameId(null);
    setScreen(Screen.Betting);
  }, []);
  
  const handleExit = useCallback(() => {
    refetchBalance();
    onExitGame();
  }, [refetchBalance, onExitGame]);

  const handleCancelSearch = useCallback(() => {
    onCancelMatch('cosmic-dodge', betAmount);
    setScreen(Screen.Betting);
  }, [betAmount, onCancelMatch]);

  const renderScreen = () => {
    switch (screen) {
      case Screen.Matching:
        return (
          <MatchingScreen
            betAmount={betAmount}
            onCancelSearch={handleCancelSearch}
            colorTheme="pink"
          />
        );
      case Screen.Game:
        if (!gameId) return <div className="text-center text-xl text-red-500">Error: No Game ID. Please return to lobby.</div>;
        return (
          <ViperPitGameScreen 
            onGameOver={handleGameOver} 
            betAmount={betAmount}
            gameId={gameId}
            walletAddress={walletAddress}
            nickname={nickname}
          />
        );
      case Screen.Winner:
        return (
          <WinnerScreen 
            gameId="cosmic-dodge"
            winnerId={gameResult.winnerId} 
            betAmount={betAmount} 
            onPlayAgain={handlePlayAgain} 
            onExitGame={handleExit} 
            forfeited={gameResult.forfeited} 
          />
        );
      default:
        return <BettingScreen onFindOpponent={handleFindOpponent} walletConnected={walletConnected} balance={balance} onExitGame={onExitGame} onShowHowToPlay={() => setShowHowToPlay(true)} gameName="Cosmic Dodge" colorTheme="pink" />;
    }
  };

  return (
    <div className="w-full max-w-4xl h-[650px] flex items-center justify-center border-2 border-pink/50 bg-black/20 rounded-lg shadow-2xl p-4 shadow-pink/10 animate-fadeIn relative">
      {renderScreen()}
      {showHowToPlay && (
        <HowToPlayModal title="How to Play: Cosmic Dodge" onClose={() => setShowHowToPlay(false)} borderColorClass="border-pink">
          <p>Cosmic Dodge is a "bullet hell" survival duel where your only goal is to outlast your opponent.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Use the <strong>W, A, S, D keys</strong> to control your ship (Blue).</li>
              <li>You and your opponent face identical waves of asteroids and lasers in separate arenas.</li>
              <li>The round ends when a ship is destroyed. The surviving player wins the round.</li>
              <li>The first player to win <strong>3 rounds</strong> wins the match and the pot!</li>
              <li>The longer the round goes on, the more intense the patterns become.</li>
              <li>Stay focused, stay moving, and survive!</li>
          </ul>
        </HowToPlayModal>
      )}
    </div>
  )
};

export default ViperPit;