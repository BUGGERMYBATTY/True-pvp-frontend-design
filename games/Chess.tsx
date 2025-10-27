import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import LobbyScreen from '../components/LobbyScreen';
import ChessGameScreen from '../components/ChessGameScreen';
import WinnerScreen from '../components/WinnerScreen';
import HowToPlayModal from '../components/HowToPlayModal';
import { playSound } from '../utils/audio';

interface ChessProps {
  walletAddress: string;
  nickname: string;
  balance: number;
  onExitGame: () => void;
  refetchBalance: () => void;
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
  const [screen, setScreen] = useState(Screen.Lobby);
  const [betAmount, setBetAmount] = useState(0.01);
  const [gameId, setGameId] = useState<string | null>(null);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [forfeited, setForfeited] = useState(false);
  
  useEffect(() => {
    if (screen === Screen.Game) {
      refetchBalance();
    }
  }, [screen, refetchBalance]);

  const handleGameStart = (id: string, bet: number) => {
    playSound('matchFound');
    setGameId(id);
    setBetAmount(bet);
    setScreen(Screen.Game);
  };
  
  const handleGameOver = (winId: number | null, didForfeit: boolean) => {
    setWinnerId(winId);
    setForfeited(didForfeit);
    setScreen(Screen.Winner);
    refetchBalance();
  };

  const handlePlayAgain = () => {
    setScreen(Screen.Lobby);
    setGameId(null);
    setWinnerId(null);
    setForfeited(false);
  };

  const renderContent = () => {
    switch (screen) {
      case Screen.Lobby:
        return (
          <LobbyScreen
            walletAddress={walletAddress}
            nickname={nickname}
            balance={balance}
            onExitGame={onExitGame}
            onShowHowToPlay={() => setShowHowToPlay(true)}
            onGameStart={handleGameStart}
            gameType="chess"
            gameName="Quantum Gambit"
            colorTheme="purple"
            walletType={walletType}
          />
        );
      case Screen.Game:
        return (
          <ChessGameScreen
            onGameOver={handleGameOver}
            betAmount={betAmount}
            gameId={gameId!}
            walletAddress={walletAddress}
            nickname={nickname}
          />
        );
      case Screen.Winner:
        return (
          <WinnerScreen
            winnerId={winnerId}
            betAmount={betAmount}
            onPlayAgain={handlePlayAgain}
            onExitGame={onExitGame}
            forfeited={forfeited}
            gameId="chess"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-4">
      {renderContent()}
      {showHowToPlay && (
        <HowToPlayModal
          title="How to Play Quantum Gambit"
          onClose={() => setShowHowToPlay(false)}
          borderColorClass="border-purple"
        >
          <ul className="list-disc list-outside ml-5 space-y-2">
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
