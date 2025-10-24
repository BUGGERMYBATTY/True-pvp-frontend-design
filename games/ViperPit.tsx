import React, { useState, useCallback, useEffect } from 'react';
import { Screen, BET_AMOUNTS } from '../types.ts';
import BettingScreen from '../components/BettingScreen.tsx';
import ViperPitGameScreen from '../components/ViperPitGameScreen.tsx';
import WinnerScreen from '../components/WinnerScreen.tsx';
import HowToPlayModal from '../components/HowToPlayModal.tsx';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

interface ViperPitProps {
  walletAddress: string;
  walletConnected: boolean;
  balance: number;
  onExitGame: () => void;
  onBalanceUpdate: (amount: number) => void;
  // FIX: Updated prop type to match the implementation in App.tsx.
  onRequestMatch: (gameId: string, betAmount: number) => Promise<{ matched: boolean; gameId: string | null } | null>;
  onCancelMatch: (gameId: string, betAmount: number) => void;
}

const ViperPit: React.FC<ViperPitProps> = ({
  walletAddress,
  walletConnected,
  balance,
  onExitGame,
  onBalanceUpdate,
  onRequestMatch,
  onCancelMatch,
}) => {
  const [screen, setScreen] = useState<Screen>(Screen.Betting);
  const [betAmount, setBetAmount] = useState<number>(BET_AMOUNTS[0]);
  const [gameWinnerId, setGameWinnerId] = useState<number | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [forfeited, setForfeited] = useState(false);

    // Effect to handle the actual match request after the UI has updated
  useEffect(() => {
    const performMatchRequest = async () => {
      const matchResult = await onRequestMatch('viper-pit', betAmount);
      // FIX: Correctly handle the object returned from onRequestMatch.
      if (matchResult?.matched) {
        setScreen(Screen.Game); // Instantly matched
      } else if (matchResult === null) {
        // Request failed, go back to betting screen
        setScreen(Screen.Betting);
      }
      // If matchResult.matched is false, we stay on the Matching screen and wait for the polling effect.
    };

    if (screen === Screen.Matching) {
      performMatchRequest();
    }
  }, [screen, betAmount, onRequestMatch]);

  // Polling effect to check for a match
  useEffect(() => {
    if (screen !== Screen.Matching) return;
    const intervalId = setInterval(async () => {
      try {
        // FIX: Corrected the polling URL to match the server's endpoint.
        const response = await fetch(`${API_BASE_URL}/api/matchmaking/status/${walletAddress}`);
        const data = await response.json();
        if (data.status === 'matched') {
          clearInterval(intervalId);
          setScreen(Screen.Game);
        }
      } catch (error) { console.error("Error polling for match status:", error); }
    }, 2000);
    return () => clearInterval(intervalId);
  }, [screen, betAmount, walletAddress]);

  // UX FIX: This now provides immediate feedback by changing the screen first.
  const handleFindOpponent = useCallback((amount: number) => {
    if (!walletConnected || balance < amount) return;
    setBetAmount(amount);
    setScreen(Screen.Matching); // Go to matching screen immediately
  }, [walletConnected, balance]);

  const handleGameOver = useCallback((winnerId: number | null) => {
    setForfeited(false);
    setGameWinnerId(winnerId);
    if (winnerId === 1) {
      const totalPot = betAmount * 2;
      const siteFee = totalPot * 0.015;
      onBalanceUpdate((totalPot - siteFee) - betAmount);
    } else if (winnerId === 2) {
      onBalanceUpdate(-betAmount);
    }
    setScreen(Screen.Winner);
  }, [betAmount, onBalanceUpdate]);

  const handlePlayAgain = useCallback(() => {
    setGameWinnerId(null);
    setForfeited(false);
    setScreen(Screen.Betting);
  }, []);

  const handleCancelSearch = useCallback(() => {
    onCancelMatch('viper-pit', betAmount);
    setScreen(Screen.Betting);
  }, [betAmount, onCancelMatch]);
  
  const handleForfeit = useCallback(() => {
    if (window.confirm("Are you sure you want to forfeit? You will lose your wager.")) {
        onBalanceUpdate(-betAmount);
        setGameWinnerId(2);
        setForfeited(true);
        setScreen(Screen.Winner);
    }
  }, [onBalanceUpdate, betAmount]);

  const renderScreen = () => {
    switch (screen) {
      case Screen.Matching:
        return (
          <div className="flex flex-col items-center justify-center h-full animate-fadeIn text-center">
            <h2 className="text-3xl font-bold font-display text-pink mb-4">Finding Opponent...</h2>
            <p className="text-white mb-8">Wagering {betAmount} SOL</p>
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-pink"></div>
            <p className="text-gray-400 mt-8 max-w-sm">You have been added to the player pool. The game will begin as soon as another player selects the same wager.</p>
            <button onClick={handleCancelSearch} className="mt-6 bg-pink/80 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink transition-colors">Cancel Search</button>
          </div>
        );
      case Screen.Game:
        return <ViperPitGameScreen onGameOver={handleGameOver} betAmount={betAmount} onForfeit={handleForfeit} />;
      case Screen.Winner:
        return <WinnerScreen winnerId={gameWinnerId} betAmount={betAmount} onPlayAgain={handlePlayAgain} onExitGame={onExitGame} forfeited={forfeited} />;
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