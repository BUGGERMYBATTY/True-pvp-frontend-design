import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import LobbyScreen from '../components/LobbyScreen';
import ViperPitGameScreen from '../components/ViperPitGameScreen';
import WinnerScreen from '../components/WinnerScreen';
import HowToPlayModal from '../components/HowToPlayModal';
import { playSound } from '../utils/audio';

interface ViperPitProps {
  walletAddress: string;
  nickname: string;
  balance: number;
  onExitGame: () => void;
  refetchBalance: () => void;
  walletType: 'guest' | 'phantom';
}

const ViperPit: React.FC<ViperPitProps> = ({
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
            gameType="cosmic-dodge"
            gameName="Cosmic Dodge"
            colorTheme="pink"
            walletType={walletType}
          />
        );
      case Screen.Game:
        return (
          <ViperPitGameScreen
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
            gameId="cosmic-dodge"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full mx-auto flex flex-col items-center justify-center p-4">
      {renderContent()}
      {showHowToPlay && (
        <HowToPlayModal
          title="How to Play Cosmic Dodge"
          onClose={() => setShowHowToPlay(false)}
          borderColorClass="border-pink"
        >
          <ul className="list-disc list-outside ml-5 space-y-2">
            <li>Use the <strong>W, A, S, D keys</strong> to control your ship (Blue).</li>
            <li>You and your opponent face identical waves of asteroids and lasers in separate arenas.</li>
            <li>The round ends when a ship is destroyed. The surviving player wins the round.</li>
            <li>The first player to win <strong>3 rounds</strong> wins the match and the pot!</li>
            <li>The longer the round goes on, the more intense the patterns become.</li>
          </ul>
        </HowToPlayModal>
      )}
    </div>
  );
};

export default ViperPit;
