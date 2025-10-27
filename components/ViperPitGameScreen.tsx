import React, { useState, useEffect, useRef, useCallback } from 'react';
import { playSound } from '../utils/audio.ts';

const ARENA_WIDTH = 350;
const ARENA_HEIGHT = 450;
const SHIP_SIZE = 20;

const WS_URL = (import.meta as any).env?.VITE_WS_BASE_URL || 'ws://localhost:3001';

interface ViperPitGameScreenProps {
  onGameOver: (winnerId: number | null, forfeited: boolean) => void;
  betAmount: number;
  gameId: string;
  walletAddress: string;
  nickname: string;
}

const ViperPitGameScreen: React.FC<ViperPitGameScreenProps> = ({ onGameOver, betAmount, gameId, walletAddress, nickname }) => {
    const [gameState, setGameState] = useState<any>(null);
    const ws = useRef<WebSocket | null>(null);
    const keysPressed = useRef<{ [key: string]: boolean }>({});
    const starfieldCanvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<{ x: number; y: number; z: number }[]>([]);

    useEffect(() => {
        if (gameState?.soundEvents?.length > 0) {
            gameState.soundEvents.forEach((sound: string) => playSound(sound));
        }
    }, [gameState]);

    useEffect(() => {
        ws.current = new WebSocket(WS_URL);
        
        ws.current.onopen = () => {
            console.log('Viper Pit WebSocket connected');
            ws.current?.send(JSON.stringify({
                type: 'join_game',
                gameType: 'cosmic-dodge',
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
            console.log('Viper Pit WebSocket disconnected');
        };
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!keysPressed.current[e.key]) {
                keysPressed.current[e.key] = true;
                ws.current?.send(JSON.stringify({ type: 'keydown', key: e.key }));
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            keysPressed.current[e.key] = false;
            ws.current?.send(JSON.stringify({ type: 'keyup', key: e.key }));
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            ws.current?.close();
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [gameId, walletAddress, nickname, onGameOver]);

    // Starfield effect
    useEffect(() => {
        const canvas = starfieldCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = (ARENA_WIDTH * 2) + 80;
        canvas.height = ARENA_HEIGHT + 100;

        if (starsRef.current.length === 0) {
            starsRef.current = Array.from({ length: 200 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                z: Math.random()
            }));
        }

        let animationFrameId: number;
        const render = () => {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            starsRef.current.forEach(star => {
                star.y += star.z * 0.5; // Speed based on Z
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }
                const size = star.z * 2;
                ctx.fillStyle = `rgba(255, 255, 255, ${star.z})`;
                ctx.fillRect(star.x, star.y, size, size);
            });
            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    if (!gameState) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-white text-2xl font-display">Waiting for server...</div>
            </div>
        );
    }
    
    const { you, opponent, projectiles, countdown, message } = gameState;

    return (
        <div className="w-full h-full flex flex-col justify-center items-center p-4 animate-fadeIn relative">
            <canvas ref={starfieldCanvasRef} className="absolute inset-0 w-full h-full opacity-50 z-0" />
            <div className="w-full text-center mb-4 z-10">
                <h4 className="text-lg font-display text-gray-400">Total Pot</h4>
                <p className="text-2xl font-bold text-pink-light">{(betAmount * 2).toFixed(2)} SOL</p>
            </div>
            <div className="flex justify-center items-start gap-8 z-10">
                {/* Your Arena */}
                <div className="flex flex-col items-center">
                    <h3 className="text-2xl font-bold font-display mb-2 text-blue">{you.nickname} ({you.roundsWon})</h3>
                    <div className="relative bg-black/50 border-2 border-blue/50 overflow-hidden" style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT }}>
                        {you.ship.alive && (
                            <div className="absolute" style={{ left: you.ship.x, top: you.ship.y, width: SHIP_SIZE, height: SHIP_SIZE }}>
                               <svg viewBox="0 0 20 20" className="w-full h-full" fill="#38bdf8" stroke="white" strokeWidth="1">
                                    <path d="M10 2 L2 18 L10 14 L18 18 Z" />
                               </svg>
                            </div>
                        )}
                         {projectiles.map((p: any) => (
                            <div key={p.id} className="absolute" style={{ 
                                left: p.x, top: p.y, width: p.size, height: p.type === 'laser' ? 5 : p.size,
                                transform: `rotate(${p.rotation}deg)`,
                                background: p.type === 'asteroid' ? 'sienna' : '#f472b6',
                                borderRadius: p.type === 'asteroid' ? '50%' : '2px',
                             }} />
                        ))}
                         {you.explosions.map((p: any) => (
                            <div key={p.id} className="absolute bg-orange-400 rounded-full" style={{
                                left: p.x, top: p.y, width: p.size, height: p.size, opacity: p.life / 60
                            }} />
                        ))}
                    </div>
                </div>
                 {/* Opponent Arena */}
                <div className="flex flex-col items-center">
                    <h3 className="text-2xl font-bold font-display mb-2 text-pink">{opponent.nickname} ({opponent.roundsWon})</h3>
                    <div className="relative bg-black/50 border-2 border-pink/50 overflow-hidden" style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT }}>
                         {opponent.ship.alive && (
                            <div className="absolute" style={{ left: opponent.ship.x, top: opponent.ship.y, width: SHIP_SIZE, height: SHIP_SIZE, transform: 'rotate(180deg)' }}>
                               <svg viewBox="0 0 20 20" className="w-full h-full" fill="#ec4899" stroke="white" strokeWidth="1">
                                    <path d="M10 2 L2 18 L10 14 L18 18 Z" />
                               </svg>
                            </div>
                        )}
                        {projectiles.map((p: any) => (
                            <div key={p.id} className="absolute" style={{ 
                                left: p.x, top: p.y, width: p.size, height: p.type === 'laser' ? 5 : p.size,
                                transform: `rotate(${p.rotation}deg)`,
                                background: p.type === 'asteroid' ? 'sienna' : '#f472b6',
                                borderRadius: p.type === 'asteroid' ? '50%' : '2px',
                             }} />
                        ))}
                         {opponent.explosions.map((p: any) => (
                            <div key={p.id} className="absolute bg-orange-400 rounded-full" style={{
                                left: p.x, top: p.y, width: p.size, height: p.size, opacity: p.life / 60
                            }} />
                        ))}
                    </div>
                </div>
            </div>
             {countdown && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                    <div className="text-8xl font-display font-extrabold text-white animate-pingOnce">{countdown}</div>
                </div>
            )}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl font-display text-white opacity-80 z-20 pointer-events-none">
                {message}
            </div>
        </div>
    );
};

export default ViperPitGameScreen;
