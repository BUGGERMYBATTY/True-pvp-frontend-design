import React, { useState, useCallback } from 'react';
// Fix: Corrected import path for types
import { Screen } from '../types';
import LobbyScreen from '../components/LobbyScreen.tsx';
import ChessGameScreen from '../components/ChessGameScreen.tsx';
import WinnerScreen from '../components/WinnerScreen.tsx';
import HowToPlayModal from '../components/HowToPlayModal.tsx';
import { playSound } from '../utils/audio.ts';

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
    setBetAmount(wager);
    setScreen(Screen.Game);
  };
  
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
    onExitGame();
  }, [refetchBalance, onExitGame]);


  const renderScreen = () => {
    switch (screen) {
      case Screen.Game:
        if (!gameId) return <div className="text-center text-xl text-red-500">Error: No Game ID. Please return to lobby.</div>;
        return (
          <ChessGameScreen 
            onGameOver={handleGameOver} 
            gameId={gameId}
            walletAddress={walletAddress}
            nickname={nickname}
            betAmount={betAmount}
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
      default: // Screen.Lobby
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
          <p>The ultimate game of strategy, reborn. Capture the opponent's king to win.</p>
          <ul className="list-disc list-inside space-y-2 mt-4">
              <li>Each player starts with 16 pieces: one king, one queen, two rooks, two knights, two bishops, and eight pawns.</li>
              <li>The goal is to checkmate the other king. Checkmate happens when the king is in a position to be captured (in "check") and cannot escape from capture.</li>
              <li>Players take turns moving one of their pieces. White moves first.</li>
              <li>Create a lobby or join an existing one to be randomly assigned as White or Black.</li>
          </ul>
        </HowToPlayModal>
      )}
    </div>
  )
};

export default Chess;