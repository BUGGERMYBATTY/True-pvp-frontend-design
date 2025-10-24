
import React, { useState, useCallback, useEffect } from 'react';
import { Screen, BET_AMOUNTS } from '../types.ts';
import BettingScreen from '../components/BettingScreen.tsx';
import GameScreen from '../components/GameScreen.tsx';
import WinnerScreen from '../components/WinnerScreen.tsx';
import HowToPlayModal from '../components/HowToPlayModal.tsx';

// Use the standard VITE_ variable name for environment variables
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

// FIX: Add missing properties to the component's props interface to match what's passed in App.tsx.
interface SolanaGoldRushProps {
  walletAddress: string;
  nickname: string;
  balance: number;
  onExitGame: () => void;
  onBalanceUpdate: (amount: number) => void;
  onRequestMatch: (gameId: string, betAmount: number) => Promise<{ matched: boolean; gameId: string | null } | null>;
  onCancelMatch: (gameId: string, betAmount: number) => void;
  provider: any;
  connection: any;
  refetchBalance: () => void;
  isDemoMode: boolean;
}

const SolanaGoldRush: React.FC<SolanaGoldRushProps> = ({
  walletAddress,
  nickname,
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
  const [gameId, setGameId] = useState<string | null>(null);

  // Effect to handle the actual match request after the UI has updated
  useEffect(() => {
    const performMatchRequest = async () => {
      const matchResult = await onRequestMatch('solana-gold-rush', betAmount);
      if (matchResult?.matched) {
        setGameId(matchResult.gameId);
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
    
    const matchKey = `solana-gold-rush-${betAmount}`;
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/matchmaking/status/${walletAddress}`);
        const data = await response.json();
        if (data.status === 'matched') {
          clearInterval(intervalId);
          setGameId(data.gameId);
          setScreen(Screen.Game);
        }
      } catch (error) { console.error("Error polling for match status:", error); }
    }, 2000);
    
    return () => clearInterval(intervalId);
  }, [screen, betAmount, walletAddress]);

  // UX FIX: This now provides immediate feedback by changing the screen first.
  const handleFindOpponent = useCallback((amount: number) => {
    if (balance < amount) return;
    setBetAmount(amount);
    setScreen(Screen.Matching); // Go to matching screen immediately
  }, [balance]);

  const handleGameOver = useCallback((winnerId: number | null) => {
    if (winnerId === 1) { // Player won
      onBalanceUpdate(betAmount * 2);
    } else if (winnerId === null) { // Draw
      onBalanceUpdate(betAmount);
    } 
    setGameWinnerId(winnerId);
    setScreen(Screen.Winner);
  }, [betAmount, onBalanceUpdate]);

  const handlePlayAgain = useCallback(() => {
    setGameWinnerId(null);
    setGameId(null);
    setScreen(Screen.Betting);
  }, []);

  const handleCancelSearch = useCallback(() => {
    onCancelMatch('solana-gold-rush', betAmount);
    setScreen(Screen.Betting);
  }, [betAmount, onCancelMatch]);

  const renderScreen = () => {
    switch (screen) {
      case Screen.Matching:
        return (
          <div className="flex flex-col items-center justify-center h-full animate-fadeIn text-center">
            <h2 className="text-3xl font-bold font-display text-yellow mb-4">Finding Opponent...</h2>
            <p className="text-white mb-8">Wagering {betAmount} SOL</p>
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-yellow"></div>
            <p className="text-gray-400 mt-8 max-w-sm">You have been added to the player pool. The game will begin as soon as another player selects the same wager.</p>
            <button onClick={handleCancelSearch} className="mt-6 bg-pink/80 text-white font-bold py-2 px-6 rounded-lg hover:bg-pink transition-colors">Cancel Search</button>
          </div>
        );
      case Screen.Game:
        if (!gameId) return <div className="text-center text-xl text-red-500">Error: No Game ID. Please return to lobby.</div>;
        return <GameScreen onGameOver={handleGameOver} betAmount={betAmount} gameId={gameId} walletAddress={walletAddress} nickname={nickname} />;
      case Screen.Winner:
        return <WinnerScreen winnerId={gameWinnerId} betAmount={betAmount} onPlayAgain={handlePlayAgain} onExitGame={onExitGame} />;
      default:
        return <BettingScreen onFindOpponent={handleFindOpponent} walletConnected={!!walletAddress} balance={balance} onExitGame={onExitGame} onShowHowToPlay={() => setShowHowToPlay(true)} gameName="Gold Rush" colorTheme="yellow" />;
    }
  };

  return (
    <div className="w-full max-w-4xl h-[650px] flex items-center justify-center border-2 border-yellow/50 bg-black/20 rounded-lg shadow-2xl p-4 shadow-yellow/10 animate-fadeIn relative">
      {renderScreen()}
      {showHowToPlay && (
        <HowToPlayModal title="How to Play: Gold Rush" onClose={() => setShowHowToPlay(false)} borderColorClass="border-yellow">
          <p>Gold Rush is a game of bidding and bluffing.</p>
          <ol className="list-decimal list-inside space-y-2 mt-4">
            <li>The game consists of <strong>5 rounds</strong>.</li>
            <li>In each round, a random "Round Number" is revealed.</li>
            <li>Both players have five "Data Chips" valued 1 through 5. You can only use each chip once.</li>
            <li>Simultaneously, both players choose one of their available chips to play.</li>
            <li>The player who played the <strong>higher value chip</strong> wins the round.</li>
            <li>The round winner scores points equal to: <strong>Round Number + Your Chip + Opponent's Chip</strong>.</li>
            <li>If both players play the same chip, it's a draw and no points are awarded.</li>
            <li>The player with the most points after 5 rounds wins the entire pot!</li>
          </ol>
        </HowToPlayModal>
      )}
    </div>
  );
};

export default SolanaGoldRush;
