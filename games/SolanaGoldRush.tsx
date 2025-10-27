import React, { useState, useEffect } from 'react';
import { Screen } from '../types';
import LobbyScreen from '../components/LobbyScreen';
import GameScreen from '../components/GameScreen';
import WinnerScreen from '../components/WinnerScreen';
import HowToPlayModal from '../components/HowToPlayModal';
import { playSound } from '../utils/audio';

interface SolanaGoldRushProps {
  walletAddress: string;
  nickname: string;
  balance: number;
  onExitGame: () => void;
  refetchBalance: () => void;
  walletType: 'guest' | 'phantom';
}

const SolanaGoldRush: React.FC<SolanaGoldRushProps> = ({
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
            gameType="solana-gold-rush"
            gameName="Solana Gold Rush"
            colorTheme="yellow"
            walletType={walletType}
          />
        );
      case Screen.Game:
        return (
          <GameScreen
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
            gameId="solana-gold-rush"
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
          title="How to Play Solana Gold Rush"
          onClose={() => setShowHowToPlay(false)}
          borderColorClass="border-yellow"
        >
          <ul className="list-disc list-outside ml-5 space-y-2">
            <li>Each round, a "Round Value" card is revealed (from 1 to 10).</li>
            <li>You and your opponent each have a hand of 5 "Nugget" cards (valued 1 to 5).</li>
            <li>Secretly, you both choose one Nugget card from your hand to play.</li>
            <li>The player who played the higher value Nugget wins the round. The winner's score increases by the Round Value PLUS the value of both played Nuggets.</li>
            <li>If both players play the same value Nugget, it's a draw, and no one scores.</li>
            <li>Each Nugget card can only be used once per game! Choose wisely.</li>
            <li>The player with the highest total score after 5 rounds wins the entire pot!</li>
          </ul>
        </HowToPlayModal>
      )}
    </div>
  );
};

export default SolanaGoldRush;
