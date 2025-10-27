import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import LobbyScreen from '../components/LobbyScreen';
import PongGameScreen from '../components/PongGameScreen';
import WinnerScreen from '../components/WinnerScreen';
import HowToPlayModal from '../components/HowToPlayModal';
import { playSound } from '../utils/audio';

interface NeonPongProps {
  walletAddress: string;
  nickname: string;
  balance: number;
  onExitGame: () => void;
  refetchBalance: () => void;
  walletType: 'guest' | 'phantom';
}

const NeonPong: React.FC<NeonPongProps> = ({
  walletAddress,
  nickname,
  balance,
  onExitGame,
  refetchBalance,
  walletType
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
            gameType="neon-pong"
            gameName="Neon Pong"
            colorTheme="blue"
            walletType={walletType}
          />
        );
      case Screen.Game:
        return (
          <PongGameScreen
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
            gameId="neon-pong"
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
          title="How to Play Neon Pong"
          onClose={() => setShowHowToPlay(false)}
          borderColorClass="border-blue"
        >
          <ul className="list-disc list-outside ml-5 space-y-2">
            <li>Use the <strong>W key</strong> to move your paddle (Blue) up.</li>
            <li>Use the <strong>S key</strong> to move your paddle down.</li>
            <li>The first player to score <strong>3 points</strong> wins the round.</li>
            <li>The match is a <strong>best of 3 rounds</strong>. The first player to win 2 rounds wins the pot!</li>
            <li>The ball gets faster with every paddle hit, so stay on your toes!</li>
          </ul>
        </HowToPlayModal>
      )}
    </div>
  );
};

export default NeonPong;
