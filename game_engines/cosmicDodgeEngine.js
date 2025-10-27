// --- Server-Authoritative Game Engine for Cosmic Dodge ---

const createCosmicDodgeEngine = () => {
    // --- Game Constants ---
    const ARENA_WIDTH = 350;
    const ARENA_HEIGHT = 450;
    const SHIP_SIZE = 20;
    const SHIP_SPEED = 4;
    const WINNING_ROUNDS = 3;

    // --- Engine Methods ---
    const init = () => ({
        p1: { ship: { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT - 50, alive: true, keys: {} }, roundsWon: 0, nickname: 'Player 1', explosions: [] },
        p2: { ship: { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT - 50, alive: true, keys: {} }, roundsWon: 0, nickname: 'Player 2', explosions: [] },
        projectiles: [],
        roundTimer: 0,
        wave: 1,
        countdown: 3,
        message: 'Waiting for opponent...',
        winnerId: null,
        gameOver: false,
        forfeited: false,
        countdownInterval: null,
    });
    
    const resetRound = (gameState) => {
        gameState.p1.ship = { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT - 50, alive: true, keys: {} };
        gameState.p2.ship = { x: ARENA_WIDTH / 2, y: ARENA_HEIGHT - 50, alive: true, keys: {} };
        gameState.projectiles = [];
        gameState.p1.explosions = [];
        gameState.p2.explosions = [];
        gameState.roundTimer = 0;
        gameState.wave = 1;
    };

    const startCountdown = (gameSession, newRound = false) => {
        const { gameState } = gameSession;
        if (gameState.countdownInterval) clearInterval(gameState.countdownInterval);
        
        if (newRound) {
            resetRound(gameState);
            gameState.message = `Round ${gameState.p1.roundsWon + gameState.p2.roundsWon + 1}`;
        }

        gameState.countdownInterval = setInterval(() => {
            gameState.countdown--;
            if (gameState.countdown <= 0) {
                clearInterval(gameState.countdownInterval);
                gameState.countdownInterval = null;
                gameState.countdown = null;
                gameState.message = '';
            }
            global.broadcastGameState(gameSession.gameId);
        }, 1000);
    };

    const start = (gameSession) => {
        const { gameState, players } = gameSession;
        gameState.p1.nickname = players[0].nickname;
        gameState.p2.nickname = players[1].nickname;
        gameState.message = `Round 1`;
        startCountdown(gameSession);
    };

    const handleInput = (gameSession, playerWallet, data) => {
        const { gameState, players } = gameSession;
        if (gameState.gameOver) return;

        const playerIndex = players.findIndex(p => p.walletAddress === playerWallet);
        const playerKey = playerIndex === 0 ? 'p1' : 'p2';
        
        if (data.type === 'keydown') {
            gameState[playerKey].ship.keys[data.key] = true;
        } else if (data.type === 'keyup') {
            gameState[playerKey].ship.keys[data.key] = false;
        }
    };
    
    // --- Projectile Spawner ---
    const spawnProjectiles = (gameState) => {
        const { roundTimer, wave, projectiles } = gameState;
        
        // Wave 1: Simple vertical asteroids
        if (wave === 1 && roundTimer % 60 === 0) {
            projectiles.push({ id: Math.random(), type: 'asteroid', x: Math.random() * ARENA_WIDTH, y: -20, size: 20 + Math.random() * 20, vy: 2 + Math.random() * 2, rotation: 0 });
        }
        
        // Wave 2: Add horizontal lasers
        if (wave >= 2 && roundTimer % 120 === 50) {
             projectiles.push({ id: Math.random(), type: 'laser', x: -100, y: Math.random() * (ARENA_HEIGHT / 2), size: 100, vx: 5, rotation: 0 });
        }
        if (wave >= 2 && roundTimer % 120 === 110) {
             projectiles.push({ id: Math.random(), type: 'laser', x: ARENA_WIDTH, y: Math.random() * (ARENA_HEIGHT / 2), size: 100, vx: -5, rotation: 0 });
        }

        // Increase wave number over time
        if (roundTimer > 15 * 60 && wave === 1) gameState.wave = 2;
        if (roundTimer > 30 * 60 && wave === 2) gameState.wave = 3; // Add more waves later
    };

    const update = (gameSession) => {
        const { gameState } = gameSession;
        if (gameState.gameOver || gameState.countdown) return;
        
        gameState.roundTimer++;
        
        // Move ships
        ['p1', 'p2'].forEach(pKey => {
            const ship = gameState[pKey].ship;
            if (!ship.alive) return;
            if (ship.keys['w']) ship.y -= SHIP_SPEED;
            if (ship.keys['s']) ship.y += SHIP_SPEED;
            if (ship.keys['a']) ship.x -= SHIP_SPEED;
            if (ship.keys['d']) ship.x += SHIP_SPEED;
            ship.x = Math.max(0, Math.min(ship.x, ARENA_WIDTH - SHIP_SIZE));
            ship.y = Math.max(0, Math.min(ship.y, ARENA_HEIGHT - SHIP_SIZE));
        });

        // Spawn and move projectiles
        spawnProjectiles(gameState);
        gameState.projectiles.forEach(p => {
            p.y += p.vy || 0;
            p.x += p.vx || 0;
        });
        gameState.projectiles = gameState.projectiles.filter(p => p.y < ARENA_HEIGHT + 20 && p.x > -110 && p.x < ARENA_WIDTH + 10);
        
        // Update explosions
        ['p1', 'p2'].forEach(pKey => {
            gameState[pKey].explosions.forEach(exp => exp.life--);
            gameState[pKey].explosions = gameState[pKey].explosions.filter(exp => exp.life > 0);
        });

        // Collision detection
        let roundOver = false;
        ['p1', 'p2'].forEach(pKey => {
            const ship = gameState[pKey].ship;
            if (!ship.alive) return;
            for (const p of gameState.projectiles) {
                const pHeight = p.type === 'laser' ? 5 : p.size;
                if (ship.x < p.x + p.size && ship.x + SHIP_SIZE > p.x &&
                    ship.y < p.y + pHeight && ship.y + SHIP_SIZE > p.y) {
                    ship.alive = false;
                    roundOver = true;
                    // Create explosion
                    gameState[pKey].explosions.push({id: Math.random(), x: ship.x, y: ship.y, size: 40, life: 60 });
                }
            }
        });

        if (roundOver) {
            const p1Alive = gameState.p1.ship.alive;
            const p2Alive = gameState.p2.ship.alive;
            if (p1Alive && !p2Alive) gameState.p1.roundsWon++;
            if (!p1Alive && p2Alive) gameState.p2.roundsWon++;
            // if both die on same frame, it's a draw for the round

            if (gameState.p1.roundsWon >= WINNING_ROUNDS || gameState.p2.roundsWon >= WINNING_ROUNDS) {
                gameState.gameOver = true;
                gameState.winnerId = gameState.p1.roundsWon > gameState.p2.roundsWon ? 1 : 2;
            } else {
                gameState.countdown = 3;
                startCountdown(gameSession, true);
            }
        }
    };
    
    const getStateForPlayer = (gameSession, playerWallet) => {
        const { gameState, players } = gameSession;
        const playerIndex = players.findIndex(p => p.walletAddress === playerWallet);
        const isP1 = playerIndex === 0;

        const you = isP1 ? gameState.p1 : gameState.p2;
        const opponent = isP1 ? gameState.p2 : gameState.p1;
        
        return {
            you: {
                ship: you.ship,
                roundsWon: you.roundsWon,
                nickname: you.nickname,
                explosions: you.explosions,
            },
            opponent: {
                ship: opponent.ship,
                roundsWon: opponent.roundsWon,
                nickname: opponent.nickname,
                explosions: opponent.explosions
            },
            projectiles: gameState.projectiles,
            countdown: gameState.countdown,
            message: gameState.message,
            gameOver: gameState.gameOver,
        };
    };

    return { init, start, handleInput, update, getStateForPlayer };
};

module.exports = createCosmicDodgeEngine;
