import React, { useState, useEffect, useRef } from 'react';

const WS_URL = (import.meta as any).env?.VITE_WS_BASE_URL || 'ws://localhost:3001';

interface GameScreenProps {
  onGameOver: (winnerId: number | null, forfeited: boolean) => void;
  betAmount: number;
  gameId: string;
  walletAddress: string;
  nickname: string;
}

const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, betAmount, gameId, walletAddress, nickname }) => {
    const [gameState, setGameState] = useState<any>(null);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        ws.current = new WebSocket(WS_URL);
        
        ws.current.onopen = () => {
          console.log('Gold Rush WebSocket connected');
          ws.current?.send(JSON.stringify({
            type: 'join_game',
            gameType: 'solana-gold-rush',
            gameId,
            walletAddress,
            nickname,
          }));
        };

        ws.current.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.gameOver) {
            onGameOver(data.winnerId, data.forfeited || false);
          } else {
            setGameState(data);
          }
        };

        ws.current.onclose = () => {
          console.log('Gold Rush WebSocket disconnected');
        };

        return () => {
          ws.current?.close();
        };
    }, [gameId, walletAddress, nickname, onGameOver]);

    const handlePlayerChoice = (choice: number) => {
        if (gameState?.isPlayerTurn) {
            ws.current?.send(JSON.stringify({ type: 'play_choice', choice }));
        }
    };

    if (!gameState) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-white text-2xl font-display">Connecting to game...</div>
            </div>
        );
    }
    
    const { round, roundNumber, roundMessage, you, opponent, isPlayerTurn, showOpponentChoice } = gameState;
    
    const opponentChoiceDisplay = () => {
        if (showOpponentChoice) return opponent.choice;
        if (opponent.choice === 'Chosen') return '✓';
        return '?';
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-between p-8 text-white animate-fadeIn">
            <header className="w-full flex justify-between items-center mb-6">
                <div className="text-left">
                    <h2 className="text-3xl font-bold font-display text-yellow">Round {round || '...'} / 5</h2>
                </div>
                <div className="text-center bg-brand-gray p-3 rounded-lg border border-yellow/30">
                    <h3 className="text-lg text-gray-400">Round Value</h3>
                    <p className="text-4xl font-bold text-white">{roundNumber ?? '...'}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-lg text-gray-400">Total Pot</h3>
                    <p className="text-3xl font-bold text-yellow-light">{(betAmount * 2).toFixed(2)} SOL</p>
                </div>
            </header>

            <main className="w-full flex-grow flex items-center justify-around">
                <div className="flex flex-col items-center w-1/3">
                    <h3 className="text-2xl font-bold font-display text-blue-light">{you?.name}</h3>
                    <p className="text-xl">Score: {you?.score}</p>
                    <div className="h-24 w-24 my-4 border-2 border-blue-light/50 rounded-full flex items-center justify-center text-5xl font-bold bg-black/30">
                        {you?.choice ?? '?'}
                    </div>
                </div>

                <div className="text-5xl font-extrabold font-display text-gray-500">VS</div>

                <div className="flex flex-col items-center w-1/3">
                    <h3 className="text-2xl font-bold font-display text-pink-light">{opponent?.name}</h3>
                    <p className="text-xl">Score: {opponent?.score}</p>
                    <div className="h-24 w-24 my-4 border-2 border-pink-light/50 rounded-full flex items-center justify-center text-5xl font-bold bg-black/30">
                        {opponentChoiceDisplay()}
                    </div>
                </div>
            </main>

            <footer className="w-full flex flex-col items-center">
                <p className="text-xl h-8 mb-4">{roundMessage}</p>
                <div className="flex gap-4">
                    {you?.nuggets.map((nugget: number) => (
                        <button
                            key={nugget}
                            onClick={() => handlePlayerChoice(nugget)}
                            disabled={!isPlayerTurn}
                            className="w-16 h-16 rounded-full bg-yellow text-brand-dark text-3xl font-bold border-2 border-transparent transition-all duration-200 enabled:hover:scale-110 enabled:hover:border-white disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            {nugget}
                        </button>
                    ))}
                </div>
            </footer>
        </div>
    );
};

export default GameScreen;