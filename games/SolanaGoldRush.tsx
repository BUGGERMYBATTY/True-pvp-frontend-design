import React, { useState, useCallback, useEffect } from 'react';
import { Screen, BET_AMOUNTS } from '../types.ts';
import BettingScreen from '../components/BettingScreen.tsx';
import MatchingScreen from '../components/MatchingScreen.tsx';
import GameScreen from '../components/GameScreen.tsx';
import WinnerScreen from '../components/WinnerScreen.tsx';
import HowToPlayModal from '../components/HowToPlayModal.tsx';
import { playSound } from '../utils/audio.ts';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

interface SolanaGoldRushProps {
  walletAddress: string;
  nickname: string;
  balance: number;
  onExitGame: () => void;
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
  onRequestMatch,
  onCancelMatch,
  refetchBalance,
}) => {
  const [screen, setScreen] = useState<Screen>(Screen.Betting);
  const [betAmount, setBetAmount] = useState<number>(BET_AMOUNTS[0]);
  const [gameResult, setGameResult] = useState<{ winnerId: number | null, forfeited: boolean }>({ winnerId: null, forfeited: false });
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);

  const handleFindOpponent = useCallback(async (amount: number) => {
    if (balance < amount) return;
    setBetAmount(amount);
    setScreen(Screen.Matching);
    const matchResult = await onRequestMatch('solana-gold-rush', amount);
    if (matchResult?.matched && matchResult.gameId) {
      playSound('matchFound');
      setGameId(matchResult.gameId);
      setScreen(Screen.Game);
    } else if (matchResult === null) {
      setScreen(Screen.Betting);
    }
  }, [balance, onRequestMatch]);

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
    // After the game, refetch the balance from the blockchain for an authoritative update.
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
    onCancelMatch('solana-gold-rush', betAmount);
    setScreen(Screen.Betting);
  }, [betAmount, onCancelMatch]);

  const renderScreen = () => {
    switch (screen) {
      case Screen.Matching:
        return (
          <MatchingScreen
            betAmount={betAmount}
            onCancelSearch={handleCancelSearch}
            colorTheme="yellow"
          />
        );
      case Screen.Game:
        if (!gameId) return <div className="text-center text-xl text-red-500">Error: No Game ID. Please return to lobby.</div>;
        return <GameScreen onGameOver={handleGameOver} betAmount={betAmount} gameId={gameId} walletAddress={walletAddress} nickname={nickname} />;
      case Screen.Winner:
        return <WinnerScreen gameId="solana-gold-rush" winnerId={gameResult.winnerId} betAmount={betAmount} onPlayAgain={handlePlayAgain} onExitGame={handleExit} forfeited={gameResult.forfeited} />;
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