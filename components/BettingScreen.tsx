import React, { useState } from 'react';
// Fix: Corrected import path for types
import { BET_AMOUNTS } from '../types';
import { playSound } from '../utils/audio.ts';

interface BettingScreenProps {
  onFindOpponent: (amount: number) => void;
  walletConnected: boolean;
  balance: number;
  onExitGame: () => void;
  onShowHowToPlay: () => void;
  gameName: string;
  colorTheme: 'blue' | 'yellow' | 'pink';
}

const BettingScreen: React.FC<BettingScreenProps> = ({ 
  onFindOpponent, 
  walletConnected, 
  balance, 
  onExitGame,
  onShowHowToPlay,
  gameName,
  colorTheme
}) => {
  const [selectedAmount, setSelectedAmount] = useState(BET_AMOUNTS[0]);
  
  const fee = selectedAmount * 0.015;
  const totalCost = selectedAmount + fee;
  const canPlay = walletConnected && balance >= totalCost;

  const handleFindOpponentClick = (amount: number) => {
    playSound('uiClick');
    onFindOpponent(amount);
  };

  const colorClasses = {
    blue: {
      main: 'blue',
      light: 'blue-light',
      shadow: 'shadow-blue/20',
      text: 'text-blue',
      border: 'border-blue',
      ring: 'focus:ring-blue',
    },
    yellow: {
      main: 'yellow',
      light: 'yellow-light',
      shadow: 'shadow-yellow/20',
      text: 'text-yellow',
      border: 'border-yellow',
      ring: 'focus:ring-yellow',
    },
    pink: {
      main: 'pink',
      light: 'pink-light',
      shadow: 'shadow-pink/20',
      text: 'text-pink',
      border: 'border-pink',
      ring: 'focus:ring-pink',
    }
  };
  const theme = colorClasses[colorTheme];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full max-w-md animate-fadeIn">
      <h2 className={`text-5xl font-extrabold font-display ${theme.text} mb-2`}>{gameName}</h2>
      <button onClick={onShowHowToPlay} className="text-gray-400 hover:text-white underline mb-8 transition-colors">
        How to Play?
      </button>

      <div className="bg-brand-gray p-6 rounded-lg w-full border border-gray-700">
        <h3 className="text-2xl font-bold text-center mb-6">Place Your Wager (SOL)</h3>
        
        <div className="relative mb-6">
          <select
            value={selectedAmount}
            onChange={(e) => setSelectedAmount(Number(e.target.value))}
            className={`w-full appearance-none bg-brand-dark border-2 border-gray-600 rounded-md py-3 px-4 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 ${theme.ring} transition-colors`}
            aria-label="Select wager amount"
          >
            {BET_AMOUNTS.map(amount => (
              <option key={amount} value={amount} className="font-bold bg-brand-dark text-white">
                {amount.toFixed(3)} SOL
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
          </div>
        </div>
        
        <div className="text-center text-gray-400 mb-4">
          Total Cost: {selectedAmount.toFixed(4)} (Wager) + {fee.toFixed(4)} (Fee) = <span className="font-bold text-white">{totalCost.toFixed(4)} SOL</span>
        </div>

        {!walletConnected && (
           <div className="text-center text-yellow p-3 bg-yellow/10 rounded-md mb-4 border border-yellow/20">
             Please connect your wallet to play.
           </div>
        )}
        {walletConnected && !canPlay && (
           <div className="text-center text-pink p-3 bg-pink/10 rounded-md mb-4 border border-pink/20">
             Insufficient balance to cover wager and fee.
           </div>
        )}

        <button
          onClick={() => handleFindOpponentClick(selectedAmount)}
          disabled={!canPlay}
          className={`w-full py-4 text-2xl font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg ${theme.shadow}
            ${canPlay 
              ? `bg-${theme.main} text-brand-dark` 
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`
          }
        >
          Find Opponent
        </button>
      </div>

      <button
        onClick={onExitGame}
        className="mt-6 text-gray-400 hover:text-white transition-colors"
      >
        Back to Lobby
      </button>
    </div>
  );
};

export default BettingScreen;
