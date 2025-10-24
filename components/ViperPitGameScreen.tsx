

import React, { useState, useEffect, useRef, useCallback } from 'react';

// Game constants
const ARENA_WIDTH = 350;
const ARENA_HEIGHT = 450;
const SHIP_SIZE = 20;
const SHIP_SPEED = 5;
const WINNING_ROUNDS = 3;

// Types
type Ship = { x: number; y: number; alive: boolean };
type Projectile = { id: number; x: number; y: number; vx: number; vy: number; size: number; type: 'asteroid' | 'laser', rotation: number; rotationSpeed: number; };
type Particle = { id: number; x: number; y: number; vx: number; vy: number; size: number; life: number; };
type Star = { x: number; y: number; z: number };

type GameState = {
    player: Ship;
    ai: Ship;
    projectiles: Projectile[];
}

const getInitialShip = (): Ship => ({
    x: ARENA_WIDTH / 2 - SHIP_SIZE / 2,
    y: ARENA_HEIGHT - SHIP_SIZE * 2,
    alive: true,
});

const getInitialGameState = (): GameState => ({
    player: getInitialShip(),
    ai: getInitialShip(),
    projectiles: [],
});

const WAVE_PATTERNS: ((wave: number) => Omit<Projectile, 'id'>[])[] = [
    // Pattern 1: Asteroid Shower (Dense vertical with drift)
    (wave) => Array.from({ length: 5 + wave * 2 }, () => ({
        x: Math.random() * ARENA_WIDTH, y: -Math.random() * ARENA_HEIGHT,
        vx: (Math.random() - 0.5) * 2, // Add slight horizontal drift
        vy: 2.5 + Math.random() * 2 + wave * 0.4, // Faster and more variable
        size: 8 + Math.random() * 12, type: 'asteroid',
        rotation: 0, rotationSpeed: (Math.random() - 0.5) * 4
    })),
    // Pattern 2: Crossfire (Asteroids from corners)
    (wave) => Array.from({ length: 4 + wave }, () => {
        const fromLeft = Math.random() > 0.5;
        const fromTop = Math.random() > 0.5;
        return {
            x: fromLeft ? -30 : ARENA_WIDTH + 30,
            y: fromTop ? -30 : ARENA_HEIGHT + 30,
            vx: (fromLeft ? 1 : -1) * (1.5 + Math.random() + wave * 0.2),
            vy: (fromTop ? 1 : -1) * (1.5 + Math.random() + wave * 0.2),
            size: 15 + Math.random() * 5, type: 'asteroid',
            rotation: 0, rotationSpeed: (Math.random() - 0.5) * 3
        }
    }),
    // Pattern 3: Laser Grid
    (wave) => {
        const projectiles: Omit<Projectile, 'id'>[] = [];
        projectiles.push({
            x: -200 - Math.random() * 100, y: Math.random() * (ARENA_HEIGHT - 100) + 50,
            vx: 6 + wave * 0.5, vy: 0,
            size: ARENA_WIDTH + 200, type: 'laser',
            rotation: 0, rotationSpeed: 0
        });
        if (wave > 1) {
            projectiles.push({
                x: Math.random() * (ARENA_WIDTH - 100) + 50, y: -ARENA_HEIGHT,
                vx: 0, vy: 6 + wave * 0.5,
                size: ARENA_HEIGHT + 200, type: 'laser',
                rotation: 90, rotationSpeed: 0
            });
        }
        return projectiles;
    },
    // Pattern 4: Mixed Assault
    (wave) => {
        const projectiles: Omit<Projectile, 'id'>[] = [];
        for (let i = 0; i < 2 + Math.floor(wave / 2); i++) {
            projectiles.push({
                x: Math.random() * ARENA_WIDTH, y: -Math.random() * 50,
                vx: (Math.random() - 0.5) * 3,
                vy: 3 + wave * 0.3,
                size: 10 + Math.random() * 15, type: 'asteroid',
                rotation: 0, rotationSpeed: (Math.random() - 0.5) * 4
            });
        }
        projectiles.push({
            x: Math.random() > 0.5 ? -200 : ARENA_WIDTH + 200, y: Math.random() * (ARENA_HEIGHT - 200) + 100,
            vx: (5 + wave * 0.4) * (Math.random() > 0.5 ? 1 : -1), vy: 0,
            size: ARENA_WIDTH + 200, type: 'laser',
            rotation: 0, rotationSpeed: 0
        });
        return projectiles;
    }
];


interface ViperPitGameScreenProps {
  onGameOver: (winnerId: number | null) => void;
  betAmount: number;
  onForfeit: () => void;
}

const ViperPitGameScreen: React.FC<ViperPitGameScreenProps> = ({ onGameOver, betAmount, onForfeit }) => {
    // State for rendering
    const [gameState, setGameState] = useState<GameState>(getInitialGameState());
    const [roundsWon, setRoundsWon] = useState({ player: 0, ai: 0 });
    const [message, setMessage] = useState('Round 1');
    const [countdown, setCountdown] = useState<number | string | null>(null);
    const [explosions, setExplosions] = useState<Particle[]>([]);

    // Refs for game loop logic to prevent stale state
    const gameStateRef = useRef<GameState>(gameState);
    const explosionsRef = useRef<Particle[]>(explosions);
    const keysPressed = useRef<{ [key: string]: boolean }>({});
    const isGameActive = useRef(false);
    const waveTimeoutRef = useRef<number>();
    const nextProjectileId = useRef(0);
    const nextParticleId = useRef(0);
    const gameLoopRef = useRef<number>();
    const starfieldCanvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);
    
    // Sync state to ref
    useEffect(() => { gameStateRef.current = gameState; }, [gameState]);
    useEffect(() => { explosionsRef.current = explosions; }, [explosions]);

    const createExplosion = (x: number, y: number) => {
        const newParticles: Particle[] = Array.from({ length: 30 }, () => {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            return {
                id: nextParticleId.current++,
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: Math.random() * 3 + 1,
                life: 60, // frames
            };
        });
        explosionsRef.current = [...explosionsRef.current, ...newParticles];
    };

    const checkCollision = useCallback((ship: Ship, projectile: Projectile) => {
        const p_height = projectile.type === 'laser' ? 5 : projectile.size;
        const p_width = projectile.type === 'laser' ? projectile.size : projectile.size;
        
        let projX = projectile.x;
        let projY = projectile.y;
        
        if (projectile.type === 'laser' && projectile.rotation === 90) {
            projX = projectile.x - p_height/2;
            projY = projectile.y;
             return (
                ship.x < projX + p_height &&
                ship.x + SHIP_SIZE > projX &&
                ship.y < projY + p_width &&
                ship.y + SHIP_SIZE > projY
            );
        }

        return (
            ship.x < projX + p_width &&
            ship.x + SHIP_SIZE > projX &&
            ship.y < projY + p_height &&
            ship.y + SHIP_SIZE > projY
        );
    }, []);
    
    const generateNewWave = useCallback(() => {
        const newWave = Math.floor(nextProjectileId.current / 10) + 1;
        const patternIndex = Math.floor(Math.random() * WAVE_PATTERNS.length);
        const newProjectilesRaw = WAVE_PATTERNS[patternIndex](newWave);
        const newProjectiles = newProjectilesRaw.map(p => ({...p, id: nextProjectileId.current++}));
        
        gameStateRef.current.projectiles = [...gameStateRef.current.projectiles, ...newProjectiles];

        waveTimeoutRef.current = window.setTimeout(generateNewWave, 1800);
    }, []);

    const resetRound = useCallback((roundWinner: 'player' | 'ai' | 'draw') => {
        isGameActive.current = false;
        clearTimeout(waveTimeoutRef.current);

        const newRoundsWon = { ...roundsWon };
         if (roundWinner === 'player') {
            newRoundsWon.player++;
            setMessage('You win the round!');
        } else if (roundWinner === 'ai') {
            newRoundsWon.ai++;
            setMessage('Opponent wins the round!');
        } else {
            setMessage('Round Draw!');
        }
        setRoundsWon(newRoundsWon);

        if (newRoundsWon.player >= WINNING_ROUNDS || newRoundsWon.ai >= WINNING_ROUNDS) {
            setTimeout(() => onGameOver(newRoundsWon.player > newRoundsWon.ai ? 1 : 2), 2000);
        } else {
            setTimeout(() => {
                setGameState(getInitialGameState());
                nextProjectileId.current = 0;
                setMessage(`Round ${newRoundsWon.player + newRoundsWon.ai + 1}`);
                setCountdown(3);
            }, 1500);
        }
    }, [onGameOver, roundsWon]);

    const gameLoop = useCallback(() => {
        if (isGameActive.current) {
            const current = gameStateRef.current;
            
            // Player movement
            if (keysPressed.current['w']) current.player.y -= SHIP_SPEED;
            if (keysPressed.current['s']) current.player.y += SHIP_SPEED;
            if (keysPressed.current['a']) current.player.x -= SHIP_SPEED;
            if (keysPressed.current['d']) current.player.x += SHIP_SPEED;
            current.player.x = Math.max(0, Math.min(current.player.x, ARENA_WIDTH - SHIP_SIZE));
            current.player.y = Math.max(0, Math.min(current.player.y, ARENA_HEIGHT - SHIP_SIZE));

            // AI movement
            const closest = current.projectiles.reduce((prev, curr) => {
                const dist = Math.hypot(current.ai.x - curr.x, current.ai.y - curr.y);
                return dist < prev.dist ? { dist, proj: curr } : prev;
            }, { dist: Infinity, proj: null as Projectile | null });

            if (closest.proj) {
                const danger = closest.proj;
                if (Math.abs(danger.x - current.ai.x) < SHIP_SIZE * 4 && Math.abs(danger.y - current.ai.y) < SHIP_SIZE * 4) {
                    if (danger.x < current.ai.x) current.ai.x += SHIP_SPEED * 0.85; else current.ai.x -= SHIP_SPEED * 0.85;
                    if (danger.y < current.ai.y) current.ai.y += SHIP_SPEED * 0.85; else current.ai.y -= SHIP_SPEED * 0.85;
                }
            }
            current.ai.x = Math.max(0, Math.min(current.ai.x, ARENA_WIDTH - SHIP_SIZE));
            current.ai.y = Math.max(0, Math.min(current.ai.y, ARENA_HEIGHT - SHIP_SIZE));

            // Projectile movement and cleanup
            current.projectiles = current.projectiles.map(p => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                rotation: p.rotation + p.rotationSpeed
            })).filter(p =>
                p.x > -p.size - 100 && p.x < ARENA_WIDTH + 100 &&
                p.y > -p.size - 100 && p.y < ARENA_HEIGHT + 100
            );

            // Collision detection
            for (const proj of current.projectiles) {
                if (current.player.alive && checkCollision(current.player, proj)) {
                    current.player.alive = false;
                    // FIX: Pass the player's ship coordinates to create an explosion at the correct location.
                    createExplosion(current.player.x + SHIP_SIZE / 2, current.player.y + SHIP_SIZE / 2);
                }
                if (current.ai.alive && checkCollision(current.ai, proj)) {
                    current.ai.alive = false;
                    // FIX: Pass the AI's ship coordinates to create an explosion at the correct location.
                    createExplosion(current.ai.x + SHIP_SIZE / 2, current.ai.y + SHIP_SIZE / 2);
                }
            }
            
            // Explosions update
            explosionsRef.current = explosionsRef.current.map(p => ({
                ...p,
                x: p.x + p.vx,
                y: p.y + p.vy,
                life: p.life - 1,
            })).filter(p => p.life > 0);

            // Update state for rendering
            setGameState({ ...current });
            setExplosions([...explosionsRef.current]);

            // Check for round end
            if (!current.player.alive && !current.ai.alive) {
                // FIX: Pass 'draw' to resetRound when both ships are destroyed.
                resetRound('draw');
            } else if (!current.player.alive) {
                // FIX: Pass 'ai' to resetRound when the player's ship is destroyed.
                resetRound('ai');
            } else if (!current.ai.alive) {
                resetRound('player');
            }
        }
        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [checkCollision, resetRound]);
    
    // Countdown effect
    useEffect(() => {
        if (countdown !== null && typeof countdown === 'number' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            setCountdown("GO!");
            const timer = setTimeout(() => {
                setCountdown(null);
                isGameActive.current = true;
                generateNewWave();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [countdown, generateNewWave]);
    
    // Main setup effect
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.key] = true; };
        const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.key] = false; };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        setCountdown(3); // Start the first round

        gameLoopRef.current = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
            clearTimeout(waveTimeoutRef.current);
            isGameActive.current = false;
        };
    }, [gameLoop]);

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

    return (
        <div className="w-full h-full flex flex-col justify-center items-center p-4 animate-fadeIn relative">
            <canvas ref={starfieldCanvasRef} className="absolute inset-0 w-full h-full opacity-50 z-0" />
            <div className="w-full text-center mb-4 z-10">
                <h4 className="text-lg font-display text-gray-400">Total Pot</h4>
                <p className="text-2xl font-bold text-pink-light">{(betAmount * 2).toFixed(2)} SOL</p>
            </div>
            <div className="flex justify-center items-start gap-8 z-10">
                {/* Player Arena */}
                <div className="flex flex-col items-center">
                    <h3 className="text-2xl font-bold font-display mb-2 text-blue">You ({roundsWon.player})</h3>
                    <div className="relative bg-black/50 border-2 border-blue/50 overflow-hidden" style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT }}>
                        {gameState.player.alive && (
                            <div className="absolute" style={{ left: gameState.player.x, top: gameState.player.y, width: SHIP_SIZE, height: SHIP_SIZE }}>
                               <svg viewBox="0 0 20 20" className="w-full h-full" fill="#38bdf8" stroke="white" strokeWidth="1">
                                    <path d="M10 2 L2 18 L10 14 L18 18 Z" />
                               </svg>
                            </div>
                        )}
                        {/* Render projectiles and explosions for player */}
                        {gameState.projectiles.map(p => (
                            <div key={p.id} className="absolute" style={{ 
                                left: p.x, top: p.y, width: p.size, height: p.type === 'laser' ? 5 : p.size,
                                transform: `rotate(${p.rotation}deg)`,
                                background: p.type === 'asteroid' ? 'sienna' : '#f472b6',
                                borderRadius: p.type === 'asteroid' ? '50%' : '2px',
                             }} />
                        ))}
                        {explosions.map(p => (
                            <div key={p.id} className="absolute bg-orange-400 rounded-full" style={{
                                left: p.x, top: p.y, width: p.size, height: p.size, opacity: p.life / 60
                            }} />
                        ))}
                    </div>
                </div>
                 {/* Opponent Arena */}
                <div className="flex flex-col items-center">
                    <h3 className="text-2xl font-bold font-display mb-2 text-pink">Opponent ({roundsWon.ai})</h3>
                    <div className="relative bg-black/50 border-2 border-pink/50 overflow-hidden" style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT }}>
                         {gameState.ai.alive && (
                            <div className="absolute" style={{ left: gameState.ai.x, top: gameState.ai.y, width: SHIP_SIZE, height: SHIP_SIZE, transform: 'rotate(180deg)' }}>
                               <svg viewBox="0 0 20 20" className="w-full h-full" fill="#ec4899" stroke="white" strokeWidth="1">
                                    <path d="M10 2 L2 18 L10 14 L18 18 Z" />
                               </svg>
                            </div>
                        )}
                        {/* Render projectiles and explosions for opponent */}
                         {gameState.projectiles.map(p => (
                            <div key={p.id} className="absolute" style={{ 
                                left: p.x, top: p.y, width: p.size, height: p.type === 'laser' ? 5 : p.size,
                                transform: `rotate(${p.rotation}deg)`,
                                background: p.type === 'asteroid' ? 'sienna' : '#f472b6',
                                borderRadius: p.type === 'asteroid' ? '50%' : '2px',
                             }} />
                        ))}
                         {explosions.map(p => (
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
             <button
                onClick={onForfeit}
                className="absolute bottom-4 right-4 text-pink-light hover:text-white bg-pink/20 hover:bg-pink/30 transition-colors z-10 p-2 px-4 rounded-lg"
                aria-label="Forfeit Match"
            >
                Forfeit Match
            </button>
        </div>
    );
};

// FIX: Added missing default export.
export default ViperPitGameScreen;