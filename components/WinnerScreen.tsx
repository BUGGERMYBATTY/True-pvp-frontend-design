import React from 'react';

interface WinnerScreenProps {
  winnerId: number | null;
  betAmount: number;
  onPlayAgain: () => void;
  onExitGame: () => void;
  forfeited?: boolean;
}

const WinnerScreen: React.FC<WinnerScreenProps> = ({ winnerId, betAmount, onPlayAgain, onExitGame, forfeited }) => {
  const isPlayerWinner = winnerId === 1;
  const isDraw = winnerId === null;
  const totalPot = betAmount * 2;

  let title = '';
  let subtext = '';
  let emoji = '';
  let titleColor = 'text-blue';

  if (forfeited) {
    title = 'Match Forfeited';
    subtext = `You lost your wager of ${betAmount.toFixed(4)} SOL plus the 1.5% fee.`;
    emoji = '🏳️';
    titleColor = 'text-gray-400';
  } else if (isDraw) {
    title = "It's a Draw!";
    subtext = `Your wager of ${betAmount.toFixed(4)} SOL has been returned. The 1.5% fee was kept by the house.`;
    emoji = '🤝';
  } else if (isPlayerWinner) {
    title = 'You Won!';
    // FEE FIX: Updated text to reflect new fee logic
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

  return (
    <div className="flex flex-col items-center justify-center bg-brand-gray p-10 rounded-xl shadow-2xl shadow-blue/10 animate-fadeIn w-full max-w-lg text-center">
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
  );
};

export default WinnerScreen;
