import React, { useState, useCallback, useEffect } from 'react';
import { Screen, BET_AMOUNTS } from '../types.ts';
import BettingScreen from '../components/BettingScreen.tsx';
import MatchingScreen from '../components/MatchingScreen.tsx';
import PongGameScreen from '../components/PongGameScreen.tsx';
import WinnerScreen from '../components/WinnerScreen.tsx';
import HowToPlayModal from '../components/HowToPlayModal.tsx';
import { playSound } from '../utils/audio.ts';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

interface NeonPongProps {
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

const NeonPong: React.FC<NeonPongProps> = ({
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
    if (balance < amount) {
      alert('Insufficient balance.');
      return;
    }
    setBetAmount(amount);
    setScreen(Screen.Matching);
    const matchResult = await onRequestMatch('neon-pong', amount);
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
  }, [screen, betAmount, walletAddress, gameId]);

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
    onCancelMatch('neon-pong', betAmount);
    setScreen(Screen.Betting);
  }, [betAmount, onCancelMatch]);

  const renderScreen = () => {
    switch (screen) {
      case Screen.Matching:
        return (
           <MatchingScreen
            betAmount={betAmount}
            onCancelSearch={handleCancelSearch}
            colorTheme="blue"
          />
        );
      case Screen.Game:
        if (!gameId) return <div className="text-center text-xl text-red-500">Error: No Game ID. Please return to lobby.</div>;
        return (
          <PongGameScreen 
            onGameOver={handleGameOver} 
            betAmount={betAmount} 
            gameId={gameId}
            walletAddress={walletAddress}
            nickname={nickname}
          />
        );
      case Screen.Winner:
        return <WinnerScreen gameId="neon-pong" winnerId={gameResult.winnerId} betAmount={betAmount} onPlayAgain={handlePlayAgain} onExitGame={handleExit} forfeited={gameResult.forfeited}/>;
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