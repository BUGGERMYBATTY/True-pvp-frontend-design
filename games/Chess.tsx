import React, { useState, useCallback, useEffect } from 'react';
import { Screen } from '../types';
// Fix: Corrected import paths to be relative.
import LobbyScreen from '../components/LobbyScreen.tsx';
import ChessGameScreen from '../components/ChessGameScreen.tsx';
import WinnerScreen from '../components/WinnerScreen.tsx';
import HowToPlayModal from '../components/HowToPlayModal.tsx';
import { playSound } from '../utils/audio.ts';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

interface ChessProps {
  walletAddress: string;
  nickname: string;
  balance: number;
  onExitGame: () => void;
  refetchBalance: () => void;
  isDemoMode: boolean;
  walletType: 'guest' | 'phantom';
}

const Chess: React.FC<ChessProps> = ({
  walletAddress,
  nickname,
  balance,
  onExitGame,
  refetchBalance,
  walletType,
}) => {
  const [screen, setScreen] = useState<Screen>(Screen.Lobby);
  const [betAmount, setBetAmount] = useState<number>(0);
  const [gameResult, setGameResult] = useState<{ winnerId: number | null, forfeited: boolean }>({ winnerId: null, forfeited: false });
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);
  const [lobbyId, setLobbyId] = useState<string | null>(null);

  const handleLobbyCreated = (createdLobbyId: string, wager: number) => {
    setLobbyId(createdLobbyId);
    setBetAmount(wager);
  };

  const handleLobbyJoined = (joinedGameId: string, wager: number) => {
    playSound('matchFound');
    setGameId(joinedGameId);
    setLobbyId(null);
    setBetAmount(wager);
    setScreen(Screen.Game);
  };
  
  useEffect(() => {
    if (screen !== Screen.Lobby || !lobbyId) return;
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/lobbies/status/${lobbyId}`);
        const data = await response.json();
        if (data.status === 'matched' && data.gameId) {
          clearInterval(intervalId);
          handleLobbyJoined(data.gameId, betAmount);
        }
      } catch (error) { console.error("Error polling for lobby status:", error); }
    }, 2000);
    return () => clearInterval(intervalId);
  }, [screen, lobbyId, betAmount]);

  const handleCancelLobby = useCallback(async () => {
    if (!lobbyId) return;
    try {
        await fetch(`${API_BASE_URL}/api/lobbies/cancel`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lobbyId, walletType }),
        });
    } catch (err) { console.error("Failed to cancel lobby:", err); }
    setLobbyId(null);
  }, [lobbyId, walletType]);
  
  const handleGameOver = useCallback((winnerId: number | null, forfeited = false) => {
    setGameResult({ winnerId, forfeited });
    setScreen(Screen.Winner);
    refetchBalance();
  }, [refetchBalance]);

  const handlePlayAgain = useCallback(() => {
    playSound('uiClick');
    setGameResult({ winnerId: null, forfeited: false });
    setGameId(null);
    setLobbyId(null);
    setScreen(Screen.Lobby);
  }, []);
  
  const handleExit = useCallback(() => {
    refetchBalance();
    if (lobbyId) handleCancelLobby();
    onExitGame();
  }, [refetchBalance, onExitGame, lobbyId, handleCancelLobby]);

  const renderScreen = () => {
    switch (screen) {
      case Screen.Game:
        if (!gameId) return <div className="text-center text-xl text-red-500">Error: No Game ID. Please return to lobby.</div>;
        return (
          <ChessGameScreen 
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
            gameId="chess"
            winnerId={gameResult.winnerId} 
            betAmount={betAmount} 
            onPlayAgain={handlePlayAgain} 
            onExitGame={handleExit} 
            forfeited={gameResult.forfeited} 
          />
        );
      default:
         if (lobbyId) {
            return (
                <div className="flex flex-col items-center justify-center h-full animate-fadeIn text-center w-full max-w-md">
                  <h2 className="text-4xl font-bold font-display text-purple mb-4">Waiting for Opponent...</h2>
                  <p className="text-white text-lg mb-6">Your {betAmount.toFixed(4)} SOL lobby is open.</p>
                  <div className="w-20 h-20 border-4 border-dashed rounded-full animate-spin border-purple mb-8"></div>
                  <button onClick={handleCancelLobby} className="w-full bg-pink text-brand-dark font-bold py-3 px-8 rounded-lg text-xl hover:bg-pink-light">Cancel</button>
                </div>
            )
        }
        return (
            <LobbyScreen
                gameType="chess"
                onLobbyCreated={handleLobbyCreated}
                onLobbyJoined={handleLobbyJoined}
                onExitGame={onExitGame}
                onShowHowToPlay={() => setShowHowToPlay(true)}
                walletAddress={walletAddress}
                nickname={nickname}
                balance={balance}
                walletType={walletType}
                colorTheme="purple"
            />
        );
    }
  };

  return (
    <div className="w-full h-[700px] flex items-center justify-center border-2 border-purple/50 bg-black/20 rounded-lg shadow-2xl p-4 shadow-purple/10 animate-fadeIn relative">
      {renderScreen()}
      {showHowToPlay && (
        <HowToPlayModal title="How to Play: Quantum Gambit" onClose={() => setShowHowToPlay(false)} borderColorClass="border-purple">
          <p>Quantum Gambit is the ultimate game of strategy, reborn on a digital frontier.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>Each player starts with 16 pieces: one king, one queen, two rooks, two knights, two bishops, and eight pawns.</li>
            <li>The goal is to checkmate the other king. Checkmate happens when the king is in a position to be captured (in "check") and cannot escape from capture.</li>
            <li>Players take turns moving one of their pieces. White moves first.</li>
            <li>Create a lobby or join an existing one to be randomly assigned as White or Black.</li>
          </ul>
        </HowToPlayModal>
      )}
    </div>
  );
};

export default Chess;