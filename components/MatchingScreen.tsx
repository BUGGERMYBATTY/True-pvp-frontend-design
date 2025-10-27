import React, { useState, useEffect } from 'react';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

interface MatchingScreenProps {
  betAmount: number;
  onCancelSearch: () => void;
  colorTheme: 'yellow' | 'blue' | 'pink';
}

const MatchingScreen: React.FC<MatchingScreenProps> = ({ betAmount, onCancelSearch, colorTheme }) => {
  const [playersInQueue, setPlayersInQueue] = useState(0);
  const [waitTimeMessage, setWaitTimeMessage] = useState('Calculating...');

  useEffect(() => {
    const fetchPoolStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/matchmaking/pool-stats`);
        if (response.ok) {
          const data = await response.json();
          setPlayersInQueue(data.totalPlayers || 0);
          
          if (data.totalPlayers >= 5) {
            setWaitTimeMessage('< 30 seconds');
          } else if (data.totalPlayers >= 2) {
            setWaitTimeMessage('~ 1 minute');
          } else {
            setWaitTimeMessage('Searching for players...');
          }
        }
      } catch (error) {
        console.error("Failed to fetch pool stats:", error);
        setWaitTimeMessage('Unavailable');
      }
    };

    fetchPoolStats(); // Initial fetch
    const intervalId = setInterval(fetchPoolStats, 5000); // Poll every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  const colorClasses = {
    blue: { text: 'text-blue', border: 'border-blue' },
    yellow: { text: 'text-yellow', border: 'border-yellow' },
    pink: { text: 'text-pink', border: 'border-pink' },
  };
  const theme = colorClasses[colorTheme];

  return (
    <div className="flex flex-col items-center justify-center h-full animate-fadeIn text-center w-full max-w-md">
      <h2 className={`text-4xl font-bold font-display ${theme.text} mb-4`}>Finding Opponent...</h2>
      <p className="text-white text-lg mb-6">
        Wagering <span className="font-bold text-white">{betAmount.toFixed(4)}</span> SOL
      </p>

      <div className={`w-20 h-20 border-4 border-dashed rounded-full animate-spin ${theme.border} mb-8`}></div>

      <div className="w-full bg-brand-dark p-4 rounded-lg border border-gray-700 mb-8 space-y-3 text-lg">
        <div className="flex justify-between">
          <span className="text-gray-400">Players in Queue:</span>
          <span className="font-bold text-white">{playersInQueue}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Est. Wait Time:</span>
          <span className="font-bold text-white">{waitTimeMessage}</span>
        </div>
      </div>

      <button
        onClick={onCancelSearch}
        className="w-full bg-pink text-brand-dark font-bold py-3 px-8 rounded-lg text-xl hover:bg-pink-light transition-transform transform hover:scale-105 shadow-lg shadow-pink/20"
      >
        Cancel Search
      </button>
    </div>
  );
};

export default MatchingScreen;
