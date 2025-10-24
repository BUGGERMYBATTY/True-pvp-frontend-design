
import React, { useState, useCallback, useEffect } from 'react';
import { Screen, BET_AMOUNTS } from '../types.ts';
import BettingScreen from '../components/BettingScreen.tsx';
import PongGameScreen from '../components/PongGameScreen.tsx';
import WinnerScreen from '../components/WinnerScreen.tsx';
import HowToPlayModal from '../components/HowToPlayModal.tsx';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

// FIX: Add missing properties to the component's props interface to match what's passed in App.tsx.
interface NeonPongProps {
  walletAddress: string;
  balance: number;
  onExitGame: () => void;
  onBalanceUpdate: (amount: number) => void;
  onRequestMatch: (gameId: string, betAmount: number) => Promise<{ matched: boolean; gameId: string | null } | null>;
  onCancelMatch: (gameId: string, betAmount: number) => void;
  provider: any;
  connection: any;
  refetchBalance: () => void;
  // FIX: Added missing isDemoMode prop to satisfy the component's signature in App.tsx.
  isDemoMode: boolean;
}

const NeonPong: React.FC<NeonPongProps> = ({
  walletAddress,
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

  const handleFindOpponent = useCallback(async (amount: number) => {
    const fee = amount * 0.015;
    const totalCost = amount + fee;

    if (balance < totalCost) {
      alert('Insufficient balance to cover wager and fee.');
      return;
    }

    onBalanceUpdate(-totalCost);
    setBetAmount(amount);
    setScreen(Screen.Matching);
    
    const matchResult = await onRequestMatch('neon-pong', amount);
    if (matchResult?.matched) {
      setScreen(Screen.Game);
    } else if (matchResult === null) {
      onBalanceUpdate(totalCost);
      setScreen(Screen.Betting);
    }
  }, [balance, onRequestMatch, onBalanceUpdate]);

  useEffect(() => {
    if (screen !== Screen.Matching) return;
    const matchKey = `neon-pong-${betAmount}`;
    const intervalId = setInterval(async () => {
       try {
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

  const handleGameOver = useCallback((winnerId: number | null) => {
    setForfeited(false);
    setGameWinnerId(winnerId);
    if (winnerId === 1) {
      onBalanceUpdate(betAmount * 2);
    } else if (winnerId === null) {
      onBalanceUpdate(betAmount);
    }
    setScreen(Screen.Winner);
  }, [betAmount, onBalanceUpdate]);

  const handlePlayAgain = useCallback(() => {
    setGameWinnerId(null);
    setForfeited(false);
    setScreen(Screen.Betting);
  }, []);
  
  const handleCancelSearch = useCallback(() => {
    onBalanceUpdate(betAmount);
    onCancelMatch('neon-pong', betAmount);
    setScreen(Screen.Betting);
  }, [betAmount, onCancelMatch, onBalanceUpdate]);

  const handleForfeit = useCallback(() => {
    if (window.confirm("Are you sure you want to forfeit? You will lose your wager.")) {
        setGameWinnerId(2);
        setForfeited(true);
        setScreen(Screen.Winner);
    }
  }, []);

  const renderScreen = () => {
    switch (screen) {
      case Screen.Matching:
        return (
          <div className="flex flex-col items-center justify-center h-full animate-fadeIn text-center">
            <h2 className="text-3xl font-bold font-display text-blue mb-4">Finding Opponent...</h2>
            <p className="text-white mb-8">Wagering {betAmount} SOL</p>
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-blue"></div>
            <p className="text-gray-400 mt-8 max-w-sm">You have been added to the player pool. The game will begin as soon as another player selects the same wager.</p>
            <button onClick={handleCancelSearch} className="mt-6 bg-pink/80 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink transition-colors">Cancel Search</button>
          </div>
        );
      case Screen.Game:
        return <PongGameScreen onGameOver={handleGameOver} betAmount={betAmount} onForfeit={handleForfeit} />;
      case Screen.Winner:
        return <WinnerScreen winnerId={gameWinnerId} betAmount={betAmount} onPlayAgain={handlePlayAgain} onExitGame={onExitGame} forfeited={forfeited}/>;
      default:
        return <BettingScreen onFindOpponent={handleFindOpponent} walletConnected={!!walletAddress} balance={balance} onExitGame={onExitGame} onShowHowToPlay={() => setShowHowToPlay(true)} gameName="Neon Pong" colorTheme="blue"/>;
    }
  };

  return (
    <div className="w-full max-w-4xl h-[650px] flex items-center justify-center border-2 border-blue/50 bg-black/20 rounded-lg shadow-2xl p-4 shadow-blue/10 animate-fadeIn relative">
      {renderScreen()}
      {showHowToPlay && (
        <HowToPlayModal title="How to Play: Neon Pong" onClose={() => setShowHowToPlay(false)} borderColorClass="border-blue">
          <p>Neon Pong is a classic arcade game with a crypto twist.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Use the <strong>W key</strong> to move up and <strong>S key</strong> to move down.</li>
              <li>The goal is to hit the ball past your opponent's paddle to score a point.</li>
              <li>The ball's speed increases during each rally.</li>
              <li>Be the first to score <strong>3 points</strong> to win a round.</li>
              <li>The first player to win <strong>2 rounds</strong> wins the match and the pot!</li>
              <li>Good luck, and may your reflexes be swift!</li>
          </ul>
        </HowToPlayModal>
      )}
    </div>
  )
};

export default NeonPong;