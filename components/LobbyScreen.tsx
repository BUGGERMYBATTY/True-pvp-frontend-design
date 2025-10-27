import React, { useState, useEffect, useCallback } from 'react';
import { Lobby } from '../types';
import { playSound } from '../utils/audio';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3001';

interface LobbyScreenProps {
    walletAddress: string;
    nickname: string;
    balance: number;
    onExitGame: () => void;
    onShowHowToPlay: () => void;
    onGameStart: (gameId: string, betAmount: number) => void;
    gameType: string;
    gameName: string;
    colorTheme: 'yellow' | 'blue' | 'pink' | 'purple';
    walletType: 'guest' | 'phantom';
}

const LobbyScreen: React.FC<LobbyScreenProps> = ({
    walletAddress,
    nickname,
    balance,
    onExitGame,
    onShowHowToPlay,
    onGameStart,
    gameType,
    gameName,
    colorTheme,
    walletType
}) => {
    const [lobbies, setLobbies] = useState<Lobby[]>([]);
    const [betAmount, setBetAmount] = useState(0.01);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [myLobbyId, setMyLobbyId] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'highest' | 'lowest'>('highest');

    const fetchLobbies = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/lobbies/list/${gameType}/${walletType}`);
            if (response.ok) {
                const data = await response.json();
                setLobbies(data.lobbies || []);
            } else {
                 console.error("Failed to fetch lobbies:", response.statusText);
            }
        } catch (err) {
            console.error("Failed to fetch lobbies:", err);
        }
    }, [gameType, walletType]);

    useEffect(() => {
        fetchLobbies();
        const intervalId = setInterval(fetchLobbies, 5000);
        return () => clearInterval(intervalId);
    }, [fetchLobbies]);
    
     useEffect(() => {
        const pollMyLobby = async () => {
            if (!myLobbyId) return;
            try {
                // This is a simplified poll. A real app would use WebSockets for instant updates.
                const response = await fetch(`${API_BASE_URL}/api/lobbies/list/${gameType}/${walletType}`);
                if(response.ok) {
                    const data = await response.json();
                    const myLobbyExists = data.lobbies.some((l: Lobby) => l.lobbyId === myLobbyId);
                    if(!myLobbyExists && myLobbyId) {
                        // Our lobby is gone, which means someone joined and the game started.
                        // The server would ideally push this via WebSocket, but polling is a fallback.
                        // We rely on the parent component getting a WebSocket message for game start.
                        // This check is mainly to stop polling if the lobby is gone.
                        console.log("Lobby joined by opponent.");
                        setMyLobbyId(null);
                    }
                }
            } catch (err) {
                 console.error("Error polling lobby status:", err);
            }
        };
        const intervalId = setInterval(pollMyLobby, 3000);
        return () => clearInterval(intervalId);
    }, [myLobbyId, gameType, walletType]);

    const handleCreateLobby = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/lobbies/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameType,
                    betAmount,
                    creator: { walletAddress, nickname },
                    walletType
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setMyLobbyId(data.lobbyId);
                fetchLobbies(); // Refresh list immediately
            } else {
                const errData = await response.json();
                setError(errData.error || 'Failed to create lobby.');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleJoinLobby = async (lobby: Lobby) => {
        setIsLoading(true);
        setError(null);
        try {
             const response = await fetch(`${API_BASE_URL}/api/lobbies/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lobbyId: lobby.lobbyId,
                    gameType: lobby.gameType,
                    player: { walletAddress, nickname }
                }),
            });
             if (response.ok) {
                const data = await response.json();
                onGameStart(data.gameId, lobby.betAmount);
            } else {
                 const errData = await response.json();
                setError(errData.error || 'Failed to join lobby.');
            }
        } catch (err) {
             setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelLobby = async () => {
         if (!myLobbyId) return;
        setIsLoading(true);
        try {
             await fetch(`${API_BASE_URL}/api/lobbies/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lobbyId: myLobbyId, gameType, walletAddress }),
            });
            setMyLobbyId(null);
            fetchLobbies();
        } catch (err) {
             console.error("Failed to cancel lobby:", err);
        } finally {
             setIsLoading(false);
        }
    };
    
    const handleBotMatch = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/api/bots/create-match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameType,
                    betAmount,
                    player: { walletAddress, nickname },
                }),
            });
            if (response.ok) {
                const data = await response.json();
                onGameStart(data.gameId, betAmount);
            } else {
                setError("Failed to create bot match.");
            }
        } catch (err) {
             setError('Network error. Please try again.');
        } finally {
             setIsLoading(false);
        }
    }
    
    const sortedLobbies = [...lobbies].sort((a, b) => {
        return sortBy === 'highest' ? b.betAmount - a.betAmount : a.betAmount - b.betAmount;
    });

    const theme = {
        main: colorTheme,
        light: `${colorTheme}-light`,
        shadow: `shadow-${colorTheme}/20`,
        text: `text-${colorTheme}`,
        border: `border-${colorTheme}`,
        ring: `focus:ring-${colorTheme}`,
        gradient: `from-${colorTheme} to-${colorTheme}-dark`,
    };

    if (myLobbyId) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-fadeIn text-center w-full max-w-md">
                <h2 className={`text-4xl font-bold font-display ${theme.text} mb-4`}>Waiting for Opponent...</h2>
                <p className="text-white text-lg mb-6">
                    Wagering <span className="font-bold text-white">{betAmount.toFixed(4)}</span> SOL
                </p>
                <div className={`w-20 h-20 border-4 border-dashed rounded-full animate-spin ${theme.border} mb-8`}></div>
                <p className="text-gray-400 mb-8">Your lobby is open. An opponent can join at any moment.</p>
                <button
                    onClick={handleCancelLobby}
                    disabled={isLoading}
                    className="w-full bg-pink text-brand-dark font-bold py-3 px-8 rounded-lg text-xl hover:bg-pink-light transition-transform transform hover:scale-105 shadow-lg shadow-pink/20 disabled:bg-gray-600"
                >
                    {isLoading ? 'Canceling...' : 'Cancel Lobby'}
                </button>
            </div>
        )
    }

    return (
        <div className={`w-full max-w-3xl animate-fadeIn p-4 sm:p-6 bg-brand-gray/50 border ${theme.border}/50 rounded-2xl`}>
            <div className="text-center mb-6">
                <h2 className={`text-5xl font-extrabold font-display ${theme.text}`}>{gameName}</h2>
                <button onClick={onShowHowToPlay} className="text-gray-400 hover:text-white underline mt-1 transition-colors">
                    How to Play?
                </button>
            </div>
           
            <div className="bg-brand-dark/50 p-4 rounded-lg border border-gray-700 mb-6">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div className="sm:col-span-1">
                        <label htmlFor="betAmount" className="block text-sm font-medium text-gray-400 mb-1">Bet Amount (SOL)</label>
                        <input
                            type="number"
                            id="betAmount"
                            value={betAmount}
                            onChange={(e) => setBetAmount(parseFloat(e.target.value))}
                            min="0.01"
                            step="0.01"
                            className="w-full bg-brand-dark/70 border-2 border-gray-600 rounded-md py-2 px-3 text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple transition"
                        />
                    </div>
                    <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2 mt-2 sm:mt-6">
                         <button
                            onClick={handleCreateLobby}
                            disabled={isLoading || betAmount <= 0}
                            className={`w-full font-bold py-2.5 px-5 rounded-lg text-white transition-all transform hover:scale-105 shadow-lg ${theme.shadow} bg-gradient-to-r ${theme.gradient} disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed`}
                        >
                            {isLoading ? 'Creating...' : 'Create Public Game'}
                        </button>
                        <button 
                            onClick={handleBotMatch}
                            disabled={isLoading || betAmount <= 0}
                            className={`w-full font-bold py-2.5 px-5 rounded-lg text-white bg-brand-gray border border-gray-600 hover:bg-gray-700 transition-colors disabled:bg-gray-800 disabled:cursor-not-allowed`}
                            >
                            Play vs. Bot
                        </button>
                    </div>
                </div>
                {error && <p className="text-pink text-center mt-3">{error}</p>}
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold font-display">Open Games</h3>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="bg-brand-dark border border-gray-600 rounded-md py-1 px-2 text-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-purple"
                    >
                        <option value="highest">Highest Price</option>
                        <option value="lowest">Lowest Price</option>
                    </select>
                </div>

                <div className="h-64 overflow-y-auto space-y-2 pr-2">
                    {sortedLobbies.length > 0 ? sortedLobbies.map(lobby => (
                        <div key={lobby.lobbyId} className={`flex justify-between items-center bg-brand-dark/60 p-3 rounded-lg border border-transparent hover:border-${colorTheme}/50 transition-colors`}>
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-gray flex items-center justify-center font-bold text-sm text-gray-400">
                                   {lobby.creator.nickname.substring(0,2)}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{lobby.creator.nickname}'s Game</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <p className="text-sm text-gray-400">
                                    <span className="font-mono text-yellow-light text-base">{lobby.betAmount.toFixed(4)} SOL</span>
                               </p>
                               <button
                                    onClick={() => handleJoinLobby(lobby)}
                                    disabled={isLoading || lobby.creator.walletAddress === walletAddress}
                                    className={`font-bold py-2 px-4 rounded-md text-brand-dark transition-colors bg-${theme.light} disabled:bg-gray-600 disabled:cursor-not-allowed`}
                                >
                                    Join
                                </button>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-500 py-16">
                            No open games right now. Why not create one?
                        </div>
                    )}
                </div>
            </div>
            <button
                onClick={onExitGame}
                className="mt-6 text-gray-400 hover:text-white transition-colors mx-auto block"
            >
                Back to Main Menu
            </button>
        </div>
    );
};

export default LobbyScreen;
