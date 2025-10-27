import React, { useEffect } from 'react';
import { playSound } from '../utils/audio.ts';

// --- Animation Components ---

const GoldNuggetAnimation = () => (
  <div className="absolute inset-0 z-0 pointer-events-none">
    {Array.from({ length: 15 }).map((_, i) => (
      <div
        key={i}
        className="absolute bg-yellow rounded-full animate-[fall_5s_linear_infinite]"
        style={{
          left: `${Math.random() * 100}%`,
          top: '-10px',
          width: `${Math.random() * 8 + 4}px`,
          height: `${Math.random() * 8 + 4}px`,
          animationDelay: `${Math.random() * 5}s`,
          opacity: Math.random() * 0.5 + 0.3,
        }}
      />
    ))}
    <style>{`
      @keyframes fall {
        to {
          transform: translateY(110vh) rotate(360deg);
        }
      }
    `}</style>
  </div>
);

const PongPaddleAnimation = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
     <div className="absolute bg-blue shadow-[0_0_10px] shadow-blue w-2 h-16 animate-[paddle-move_2s_ease-in-out_infinite]" style={{ left: '20%', top: '40%' }} />
     <div className="absolute bg-white rounded-full w-3 h-3 shadow-[0_0_15px] shadow-white animate-[ball-hit_2s_ease-in-out_infinite]" style={{ left: 'calc(20% + 10px)', top: '55%' }} />
     <style>{`
        @keyframes paddle-move {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-30px); }
        }
        @keyframes ball-hit {
            0%, 20% { transform: translate(0, 0); opacity: 1; }
            80%, 100% { transform: translate(400px, -100px); opacity: 0; }
        }
     `}</style>
  </div>
);

const StarburstAnimation = () => (
    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
        <div className="relative w-1 h-1">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-20 bg-gradient-to-b from-transparent to-pink-light animate-[burst_1.5s_ease-out_forwards]"
                    style={{
                        top: '50%',
                        left: '50%',
                        transformOrigin: 'top center',
                        transform: `rotate(${i * 45}deg)`,
                        opacity: 0,
                        animationDelay: '0.2s',
                    }}
                />
            ))}
        </div>
        <style>{`
            @keyframes burst {
                0% { transform: rotate(var(--deg)) scaleY(0); opacity: 0; }
                50% { opacity: 1; }
                100% { transform: rotate(var(--deg)) scaleY(1); opacity: 0; }
            }
        `}</style>
    </div>
);

const QuantumGambitAnimation = () => (
    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
      <div className="text-purple-light text-[12rem] opacity-0 animate-[king-glow_2s_ease-out_forwards]" style={{ textShadow: '0 0 20px #A855F7' }}>
        ♔
      </div>
      <style>{`
        @keyframes king-glow {
          0% { transform: scale(0.5); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: scale(1.2); opacity: 0; }
        }
      `}</style>
    </div>
);

const ConfettiAnimation = () => {
  const colors = ['#FFD700', '#7DF9FF', '#FF7ED4', '#FFFFFF', '#00BFFF'];
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 150 }).map((_, i) => (
        <div
          key={i}
          className="absolute animate-[confetti-fall_5s_linear_infinite]"
          style={{
            left: `${Math.random() * 100}vw`,
            top: '-10%',
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 6 + 5}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            animationDelay: `${Math.random() * 5}s`,
            opacity: Math.random() * 0.7 + 0.3,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};


interface WinnerScreenProps {
  winnerId: number | null;
  betAmount: number;
  onPlayAgain: () => void;
  onExitGame: () => void;
  forfeited?: boolean;
  gameId: 'solana-gold-rush' | 'neon-pong' | 'cosmic-dodge' | 'chess';
}

const WinnerScreen: React.FC<WinnerScreenProps> = ({ winnerId, betAmount, onPlayAgain, onExitGame, forfeited, gameId }) => {
  const isPlayerWinner = winnerId === 1;
  const isDraw = winnerId === null;
  const totalPot = betAmount * 2;

  useEffect(() => {
    if (forfeited && !isPlayerWinner) {
       playSound('gameLose');
       return;
    }
    
    if (isDraw) {
      playSound('draw');
    } else if (isPlayerWinner) {
      playSound('gameWin');
    } else {
      playSound('gameLose');
    }
  }, [isPlayerWinner, isDraw, forfeited]);

  let title = '';
  let subtext = '';
  let emoji = '';
  let titleColor = 'text-blue';

  if (forfeited) {
    if (isPlayerWinner) {
        title = 'Opponent Forfeited';
        subtext = `You won the pot of ${totalPot.toFixed(4)} SOL! Your winnings have been sent to your wallet.`;
        emoji = '🏆';
        titleColor = 'text-yellow';
    } else {
        title = 'Match Forfeited';
        subtext = `You lost your wager of ${betAmount.toFixed(4)} SOL plus the 1.5% fee.`;
        emoji = '🏳️';
        titleColor = 'text-gray-400';
    }
  } else if (isDraw) {
    title = "It's a Draw!";
    subtext = `Your wager of ${betAmount.toFixed(4)} SOL has been returned. The 1.5% fee was kept by the house.`;
    emoji = '🤝';
  } else if (isPlayerWinner) {
    title = 'You Won!';
    subtext = `You won the pot of ${totalPot.toFixed(4)} SOL! Your winnings have been sent to your wallet.`;
    emoji = '🏆';
    titleColor = 'text-yellow';
  } else {
    title = 'Better Luck Next Time';
    subtext = `You lost your wager of ${betAmount.toFixed(4)} SOL plus the 1.5% fee.`;
    emoji = '😥';
    titleColor = 'text-pink';
  }
  
  const primaryButtonClass = "bg-blue text-brand-dark font-bold py-3 px-8 rounded-lg text-lg hover:bg-blue-light transition-transform transform hover:scale-105 shadow-md";
  const secondaryButtonClass = "bg-gray-700 text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-gray-600 transition-colors";

  const renderWinningAnimation = () => {
    if (!isPlayerWinner) return null;
    switch (gameId) {
      case 'solana-gold-rush': return <GoldNuggetAnimation />;
      case 'neon-pong': return <PongPaddleAnimation />;
      case 'cosmic-dodge': return <StarburstAnimation />;
      case 'chess': return <QuantumGambitAnimation />;
      default: return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-brand-gray p-10 rounded-xl shadow-2xl shadow-blue/10 animate-fadeIn w-full max-w-lg text-center relative overflow-hidden">
      {renderWinningAnimation()}
      {isPlayerWinner && <ConfettiAnimation />}
      <div className="relative z-10">
        <div className="text-6xl mb-4">{emoji}</div>
        <h2 className={`text-5xl font-extrabold font-display ${titleColor} mb-4`}>{title}</h2>
        <p className="text-xl text-gray-300 mb-8">{subtext}</p>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
          <button
            onClick={onPlayAgain}
            className={primaryButtonClass}
          >
            Play Again
          </button>
          <button
            onClick={onExitGame}
            className={secondaryButtonClass}
          >
            Back to Lobby
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerScreen;