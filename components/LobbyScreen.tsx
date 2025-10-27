import React, { useState, useEffect, useCallback } from 'react';
// Fix: Corrected import path for types
import { BET_AMOUNTS, Lobby } from '../types';
import { playSound } from '../utils/audio.ts';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

interface LobbyScreenProps {
  gameType: string;
  onLobbyCreated: (lobbyId: string, betAmount: number) => void;
  onLobbyJoined: (gameId: string, betAmount: number) => void;
  onExitGame: () => void;
  onShowHowToPlay: () => void;
  walletAddress: string;
  nickname: string;
  balance: number;
  walletType: 'guest' | 'phantom';
  colorTheme: 'yellow' | 'blue' | 'pink' | 'purple';
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({
  gameType,
  onLobbyCreated,
  onLobbyJoined,
  onShowHowToPlay,
  walletAddress,
  nickname,
  balance,
  walletType,
  colorTheme,
}) => {
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [betAmount, setBetAmount] = useState(BET_AMOUNTS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' for highest, 'asc' for lowest

  const fee = betAmount * 0.015;
  const totalCost = betAmount + fee;
  const canPlay = !!walletAddress && balance >= totalCost;

  const fetchLobbies = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/lobbies/list/${walletType}`);
      if (response.ok) {
        let data = await response.json();
        // Filter out lobbies created by the current user
        data = data.filter((lobby: Lobby) => lobby.creator.walletAddress !== walletAddress);
        
        // Sort
        data.sort((a: Lobby, b: Lobby) => sortOrder === 'desc' ? b.betAmount - a.betAmount : a.betAmount - b.betAmount);
        
        setLobbies(data);
      }
    } catch (err) {
      console.error("Failed to fetch lobbies:", err);
    }
  }, [walletType, walletAddress, sortOrder]);

  useEffect(() => {
    fetchLobbies();
    const interval = setInterval(fetchLobbies, 3000); // Poll for new lobbies
    return () => clearInterval(interval);
  }, [fetchLobbies]);

  const handleCreateLobby = async () => {
    if (!canPlay || isCreating) return;
    setIsCreating(true);
    setError('');
    playSound('uiClick');
    try {
      const response = await fetch(`${API_BASE_URL}/api/lobbies/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameType, betAmount, walletAddress, nickname, walletType }),
      });
      if (response.ok) {
        const { lobbyId } = await response.json();
        onLobbyCreated(lobbyId, betAmount);
      } else {
        const { error } = await response.json();
        setError(error || 'Failed to create lobby.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinLobby = async (lobby: Lobby) => {
    playSound('uiClick');
    // Check balance before attempting to join
     const joinFee = lobby.betAmount * 0.015;
     const joinTotalCost = lobby.betAmount + joinFee;
     if (balance < joinTotalCost) {
         setError(`Insufficient balance to join this ${lobby.betAmount} SOL game.`);
         return;
     }

    try {
      const response = await fetch(`${API_BASE_URL}/api/lobbies/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lobbyId: lobby.lobbyId,
          joinerWalletAddress: walletAddress,
          joinerNickname: nickname,
          walletType: walletType,
        }),
      });
      if (response.ok) {
        const { gameId } = await response.json();
        onLobbyJoined(gameId, lobby.betAmount);
      } else {
         setError('Failed to join lobby. It may have been taken or cancelled.');
         fetchLobbies(); // Refresh list
      }
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };
  
    const colorClasses = {
        blue: { main: 'blue', light: 'blue-light', text: 'text-blue', ring: 'focus:ring-blue', border: 'border-blue' },
        yellow: { main: 'yellow', light: 'yellow-light', text: 'text-yellow', ring: 'focus:ring-yellow', border: 'border-yellow' },
        pink: { main: 'pink', light: 'pink-light', text: 'text-pink', ring: 'focus:ring-pink', border: 'border-pink' },
        purple: { main: 'purple', light: 'purple-light', text: 'text-purple', ring: 'focus:ring-purple', border: 'border-purple' },
    };
    const theme = colorClasses[colorTheme];

  return (
    <div className="w-full h-full flex flex-col p-4 text-white">
      {/* Create Game Panel */}
      <div className="bg-brand-gray/80 border border-gray-700 rounded-lg p-4 mb-4 flex items-center justify-between gap-4">
        <div>
          <label htmlFor="betAmount" className="text-sm text-gray-400">Bet Amount (SOL)</label>
          <select
            id="betAmount"
            value={betAmount}
            onChange={(e) => setBetAmount(Number(e.target.value))}
            className={`w-48 appearance-none bg-brand-dark border-2 border-gray-600 rounded-md py-2 px-3 text-white text-left text-base font-bold focus:outline-none focus:ring-2 ${theme.ring} transition-colors`}
          >
            {BET_AMOUNTS.map(amount => (
              <option key={amount} value={amount}>{amount.toFixed(3)}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleCreateLobby}
          disabled={!canPlay || isCreating}
          className={`px-6 py-3 text-lg font-bold rounded-lg transition-all shadow-lg bg-${theme.main} text-brand-dark disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed`}
        >
          {isCreating ? 'Creating...' : `+ Create Game`}
        </button>
      </div>
       {error && <p className="text-pink text-center mb-2">{error}</p>}
       {!walletAddress && <p className="text-yellow text-center mb-2">Connect wallet to create or join games.</p>}

      {/* Lobby List */}
      <div className="flex-grow bg-brand-dark/50 border border-gray-800 rounded-lg p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-xl">Open Games</h3>
           <select 
             value={sortOrder} 
             onChange={e => setSortOrder(e.target.value)}
             className="bg-brand-gray border border-gray-600 rounded-md py-1 px-2 text-sm"
            >
              <option value="desc">Highest Price</option>
              <option value="asc">Lowest Price</option>
           </select>
        </div>
        <div className="space-y-2">
          {lobbies.length > 0 ? (
            lobbies.map(lobby => (
              <div key={lobby.lobbyId} className="bg-brand-gray rounded-md p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue/20 flex items-center justify-center font-bold text-lg">{lobby.creator.nickname.charAt(0)}</div>
                    <div>
                        <p className="font-semibold">{lobby.creator.nickname}</p>
                        <p className="text-xs text-gray-400">Wager</p>
                    </div>
                </div>
                <div className="text-center">
                    <p className={`font-bold text-lg ${theme.text}`}>{lobby.betAmount.toFixed(4)} SOL</p>
                </div>
                <button
                    onClick={() => handleJoinLobby(lobby)}
                    disabled={!walletAddress}
                    className={`px-6 py-2 font-bold rounded-md bg-${theme.main} text-brand-dark disabled:bg-gray-700 disabled:text-gray-500`}
                >
                    Join
                </button>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-10">
              No open games right now. Why not create one?
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LobbyScreen;