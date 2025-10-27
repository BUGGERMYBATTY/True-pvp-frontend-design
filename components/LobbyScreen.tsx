import React, { useState, useEffect } from 'react';
import BettingScreen from './BettingScreen.tsx';
import { Lobby } from '../types';
import { playSound } from '../utils/audio.ts';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

interface LobbyScreenProps {
  gameType: string;
  onLobbyCreated: (lobbyId: string, wager: number) => void;
  onLobbyJoined: (gameId: string, wager: number) => void;
  onExitGame: () => void;
  onShowHowToPlay: () => void;
  walletAddress: string;
  nickname: string;
  balance: number;
  walletType: 'guest' | 'phantom';
  colorTheme: 'blue' | 'yellow' | 'pink' | 'purple';
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({
  gameType,
  onLobbyCreated,
  onLobbyJoined,
  onExitGame,
  onShowHowToPlay,
  walletAddress,
  nickname,
  balance,
  walletType,
  colorTheme,
}) => {
  const [showBettingScreen, setShowBettingScreen] = useState(true);
  const [lobbies, setLobbies] = useState<Lobby[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (showBettingScreen) return; // Don't fetch lobbies if we are on the betting screen

    const fetchLobbies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/api/lobbies/list/${walletType}`);
        if (!response.ok) throw new Error('Failed to fetch lobbies');
        const allLobbies: Lobby[] = await response.json();
        // Filter lobbies for the current game type and exclude user's own lobbies
        const filteredLobbies = allLobbies.filter(lobby => 
            lobby.gameType === gameType && lobby.creator.walletAddress !== walletAddress
        );
        setLobbies(filteredLobbies);
      } catch (err: any) {
        setError(err.message || 'Could not load lobbies.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLobbies();
    const intervalId = setInterval(fetchLobbies, 5000); // Refresh every 5 seconds

    return () => clearInterval(intervalId);
  }, [gameType, walletType, walletAddress, showBettingScreen]);

  const handleCreateLobby = async (amount: number) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/lobbies/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType,
          betAmount: amount,
          walletAddress,
          nickname,
          walletType,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create lobby.');
      onLobbyCreated(data.lobbyId, amount);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleJoinLobby = async (lobby: Lobby) => {
    playSound('uiClick');
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/lobbies/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lobbyId: lobby.lobbyId,
          joinerWalletAddress: walletAddress,
          joinerNickname: nickname,
          walletType,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to join lobby.');
      onLobbyJoined(data.gameId, lobby.betAmount);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const gameName = gameType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  const colorClasses = {
    blue: { text: 'text-blue', border: 'border-blue' },
    yellow: { text: 'text-yellow', border: 'border-yellow' },
    pink: { text: 'text-pink', border: 'border-pink' },
    purple: { text: 'text-purple', border: 'border-purple' },
  };
  const theme = colorClasses[colorTheme] || colorClasses.blue;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <div className="flex justify-center border-b-2 border-gray-700 mb-6">
        <button 
          onClick={() => setShowBettingScreen(true)}
          className={`px-6 py-3 font-display text-xl font-bold transition-colors ${showBettingScreen ? `${theme.text} border-b-2 ${theme.border}` : 'text-gray-500 border-b-2 border-transparent hover:text-white'}`}
        >
          Create Lobby
        </button>
        <button 
          onClick={() => setShowBettingScreen(false)}
          className={`px-6 py-3 font-display text-xl font-bold transition-colors ${!showBettingScreen ? `${theme.text} border-b-2 ${theme.border}` : 'text-gray-500 border-b-2 border-transparent hover:text-white'}`}
        >
          Join Lobby
        </button>
      </div>
      
      {error && <div className="text-center text-pink p-3 bg-pink/10 rounded-md mb-4 border border-pink/20 w-full max-w-md">{error}</div>}

      {showBettingScreen ? (
        <BettingScreen
          onFindOpponent={handleCreateLobby}
          walletConnected={!!walletAddress}
          balance={balance}
          onExitGame={onExitGame}
          onShowHowToPlay={onShowHowToPlay}
          gameName={gameName}
          colorTheme={colorTheme}
        />
      ) : (
        <div className="animate-fadeIn w-full max-w-lg">
          <h2 className="text-3xl font-bold font-display text-center mb-6">Available Lobbies</h2>
          {isLoading && <div className="text-center text-lg text-gray-400">Searching for lobbies...</div>}
          {!isLoading && lobbies.length === 0 && (
            <div className="text-center text-gray-400 p-8 bg-brand-gray/50 rounded-lg">
                <p className="text-xl">No available lobbies for {gameName} right now.</p>
                <p>Why not create one?</p>
            </div>
          )}
          {!isLoading && lobbies.length > 0 && (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {lobbies.map(lobby => (
                <div key={lobby.lobbyId} className="flex justify-between items-center bg-brand-gray p-4 rounded-lg border border-gray-700 hover:bg-brand-dark transition-colors">
                  <div>
                    <p className="font-bold text-lg text-white">{lobby.creator.nickname}'s Lobby</p>
                    <p className="text-gray-400">Wager: {lobby.betAmount.toFixed(4)} SOL</p>
                  </div>
                  <button
                    onClick={() => handleJoinLobby(lobby)}
                    className={`px-6 py-2 font-bold rounded-md transition-colors text-brand-dark bg-${colorTheme} hover:bg-${colorTheme}-light`}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}
           <button
             onClick={onExitGame}
             className="mt-6 text-gray-400 hover:text-white transition-colors block mx-auto"
           >
             Back to Main Menu
           </button>
        </div>
      )}
    </div>
  );
};

export default LobbyScreen;
