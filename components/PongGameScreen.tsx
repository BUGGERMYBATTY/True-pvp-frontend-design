import React, { useState, useEffect, useRef } from 'react';

// Game constants (for rendering only)
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 12;
const BALL_SIZE = 12;
const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;

const WS_URL = (import.meta as any).env?.VITE_WS_BASE_URL || 'ws://localhost:3001';

interface PongGameScreenProps {
  onGameOver: (winnerId: number | null, forfeited: boolean) => void;
  betAmount: number;
  gameId: string;
  walletAddress: string;
  nickname: string;
}

const PongGameScreen: React.FC<PongGameScreenProps> = ({ onGameOver, betAmount, gameId, walletAddress, nickname }) => {
  const [gameState, setGameState] = useState<any>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket(WS_URL);
    
    ws.current.onopen = () => {
      console.log('Neon Pong WebSocket connected');
      ws.current?.send(JSON.stringify({
        type: 'join_game',
        gameType: 'neon-pong',
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
      console.log('Neon Pong WebSocket disconnected');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 's') {
        ws.current?.send(JSON.stringify({ type: 'move_paddle', direction: e.key === 'w' ? 'up' : 'down' }));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
       if (e.key === 'w' || e.key === 's') {
        ws.current?.send(JSON.stringify({ type: 'stop_paddle', direction: e.key === 'w' ? 'up' : 'down' }));
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      ws.current?.close();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameId, walletAddress, nickname, onGameOver]);

  if (!gameState) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white text-2xl font-display">Waiting for server...</div>
      </div>
    );
  }

  const { you, opponent, ball, message } = gameState;

  return (
    <div className="w-full h-full flex flex-col justify-center items-center p-4 animate-fadeIn relative">
      <div className="w-full flex justify-between items-center mb-4 px-4" style={{width: GAME_WIDTH}}>
        <div className="text-left">
            <h3 className="text-2xl font-bold font-display">{you.nickname}</h3>
            <p className="text-xl text-blue">Score: {you.score} <span className="text-gray-400 text-base">| Rounds: {you.roundsWon}</span></p>
        </div>
        <div className="text-center">
          <h4 className="text-lg font-display text-gray-400">Total Pot</h4>
          <p className="text-2xl font-bold text-blue-light">{(betAmount * 2).toFixed(2)} SOL</p>
        </div>
        <div className="text-right">
            <h3 className="text-2xl font-bold font-display">{opponent.nickname}</h3>
            <p className="text-xl text-pink">Score: {opponent.score} <span className="text-gray-400 text-base">| Rounds: {opponent.roundsWon}</span></p>
        </div>
      </div>
      <div 
        className="relative bg-brand-dark border-2 border-blue/50" 
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-full border-l-2 border-dashed border-blue/20"></div>
        <div
          className="absolute bg-blue shadow-[0_0_10px] shadow-blue"
          style={{
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            left: you.x,
            top: you.y,
          }}
        />
        <div
          className="absolute bg-pink shadow-[0_0_10px] shadow-pink"
          style={{
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            right: opponent.x,
            top: opponent.y,
          }}
        />
        <div
          className="absolute bg-white rounded-full shadow-[0_0_15px] shadow-white"
          style={{
            width: BALL_SIZE,
            height: BALL_SIZE,
            left: ball.x,
            top: ball.y,
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl font-display text-gray-500 opacity-70">
            {message}
        </div>
      </div>
    </div>
  );
};

export default PongGameScreen;