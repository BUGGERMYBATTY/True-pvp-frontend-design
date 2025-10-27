// --- TRUEPVP.io Matchmaking & Game Server ---
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3001;

// --- HTTP Server Setup (Matchmaking) ---
// Use a more permissive CORS policy for development to avoid "Failed to fetch" errors.
// This allows requests from any origin. For production, you might want to restrict this
// to your actual frontend domain.
app.use(cors());
app.use(express.json());

const playerPool = new Map();
const matchedPairs = new Map();

app.post('/api/matchmaking/join', (req, res) => {
    const { gameId, betAmount, walletAddress } = req.body;
    if (!gameId || !betAmount || !walletAddress) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const playerType = walletAddress.startsWith('GUEST_') ? 'guest' : 'phantom';
    const matchKey = `${gameId}-${betAmount}-${playerType}`;

    const waitingPlayer = playerPool.get(matchKey);

    if (waitingPlayer && waitingPlayer.walletAddress !== walletAddress) {
        const gameInstanceId = uuidv4();
        console.log(`[MATCH] ${walletAddress} vs ${waitingPlayer.walletAddress} in game ${gameInstanceId} [Pool: ${playerType}]`);
        matchedPairs.set(walletAddress, { opponent: waitingPlayer.walletAddress, gameId: gameInstanceId });
        matchedPairs.set(waitingPlayer.walletAddress, { opponent: walletAddress, gameId: gameInstanceId });
        playerPool.delete(matchKey);
        res.json({ matched: true, gameId: gameInstanceId });
    } else {
        console.log(`[QUEUE] ${walletAddress} is waiting for a match for ${matchKey}`);
        playerPool.set(matchKey, { walletAddress });
        res.json({ matched: false, gameId: null });
    }
});

app.get('/api/matchmaking/status/:walletAddress', (req, res) => {
    const { walletAddress } = req.params;
    if (matchedPairs.has(walletAddress)) {
        const matchInfo = matchedPairs.get(walletAddress);
        // Do not delete from matchedPairs here; let the game logic handle cleanup.
        console.log(`[STATUS] Player ${walletAddress} is matched for game ${matchInfo.gameId}`);
        res.json({ status: 'matched', gameId: matchInfo.gameId });
    } else {
        res.json({ status: 'waiting' });
    }
});

app.post('/api/matchmaking/cancel', (req, res) => {
    const { gameId, betAmount, walletAddress } = req.body;
     if (!gameId || !betAmount || !walletAddress) {
        return res.status(400).json({ error: 'Missing required fields for cancel' });
    }
    const playerType = walletAddress.startsWith('GUEST_') ? 'guest' : 'phantom';
    const matchKey = `${gameId}-${betAmount}-${playerType}`;

    const waitingPlayer = playerPool.get(matchKey);

    if (waitingPlayer && waitingPlayer.walletAddress === walletAddress) {
        playerPool.delete(matchKey);
        console.log(`[CANCEL] ${walletAddress} removed from pool for ${matchKey}.`);
        res.status(200).json({ message: 'Search cancelled' });
    } else {
        res.status(200).json({ message: 'Player not found in queue' });
    }
});

app.get('/api/matchmaking/pool-stats', (req, res) => {
    res.json({ totalPlayers: playerPool.size });
});


// --- WebSocket Server & Game Logic ---
const activeGames = new Map();

// --- Game Engine Imports ---
const createSolanaGoldRushEngine = require('./game_engines/solanaGoldRushEngine');
const createNeonPongEngine = require('./game_engines/neonPongEngine');
const createCosmicDodgeEngine = require('./game_engines/cosmicDodgeEngine');

const gameEngines = {
    'solana-gold-rush': createSolanaGoldRushEngine,
    'neon-pong': createNeonPongEngine,
    'cosmic-dodge': createCosmicDodgeEngine,
};

const TICK_RATE = 1000 / 60; // 60 FPS for loop-based games

wss.on('connection', (ws, req) => {
    console.log('[WS] Client connected');
    let currentGameId;
    let playerWallet;

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            const { type, gameId, walletAddress, nickname, ...rest } = data;

            if (type === 'join_game') {
                currentGameId = gameId;
                playerWallet = walletAddress;

                if (!activeGames.has(gameId)) {
                    const engineFactory = gameEngines[data.gameType];
                    if (!engineFactory) {
                        console.error(`[ERROR] Unknown game type: ${data.gameType}`);
                        ws.close();
                        return;
                    }
                    const engine = engineFactory();
                    const gameState = engine.init();
                    
                    const gameSession = {
                        gameId,
                        gameType: data.gameType,
                        engine,
                        gameState,
                        players: [{ walletAddress, nickname, ws }],
                        intervalId: null,
                    };
                    activeGames.set(gameId, gameSession);
                    console.log(`[GAME] Game ${gameId} (${data.gameType}) created by ${walletAddress}`);
                } else {
                    const gameSession = activeGames.get(gameId);
                    if (gameSession.players.length < 2 && !gameSession.players.find(p => p.walletAddress === walletAddress)) {
                        gameSession.players.push({ walletAddress, nickname, ws });
                        console.log(`[GAME] Player ${walletAddress} joined game ${gameId}`);
                        
                        // Clean up matchmaking data
                        matchedPairs.delete(gameSession.players[0].walletAddress);
                        matchedPairs.delete(gameSession.players[1].walletAddress);

                        if (gameSession.engine.start) {
                           gameSession.engine.start(gameSession);
                        }

                        if (gameSession.engine.update) {
                           gameSession.intervalId = setInterval(() => gameLoop(gameId), TICK_RATE);
                        }
                    }
                }
            } else {
                 const gameSession = activeGames.get(currentGameId);
                 if (gameSession && gameSession.engine.handleInput) {
                    gameSession.engine.handleInput(gameSession, playerWallet, data);
                 }
            }
        } catch (e) {
            console.error('[WS] Error processing message:', e);
        }
    });

    ws.on('close', () => {
        console.log(`[WS] Client ${playerWallet} disconnected`);
        if (currentGameId && activeGames.has(currentGameId)) {
             const gameSession = activeGames.get(currentGameId);
             
             // Forfeit logic: if a player disconnects mid-game, the other player wins.
             if (!gameSession.gameState.gameOver && gameSession.players.length === 2) {
                const winner = gameSession.players.find(p => p.walletAddress !== playerWallet);
                const loser = gameSession.players.find(p => p.walletAddress === playerWallet);
                if (winner && loser) {
                    console.log(`[FORFEIT] ${loser.walletAddress} disconnected. ${winner.walletAddress} wins game ${currentGameId}.`);
                    gameSession.gameState.gameOver = true;
                    gameSession.gameState.winnerId = gameSession.players.findIndex(p => p.walletAddress === winner.walletAddress) + 1;
                    gameSession.gameState.forfeited = true; // Set the forfeit flag
                    broadcastGameState(currentGameId);
                }
             }

             // Clean up the game session if it's over or wasn't full
             if (gameSession.gameState.gameOver || gameSession.players.length < 2) {
                if (gameSession.intervalId) clearInterval(gameSession.intervalId);
                activeGames.delete(currentGameId);
                console.log(`[GAME] Game ${currentGameId} terminated and cleaned up.`);
             } else {
                // If the game is running, we might mark the player as disconnected but keep the session
                // For simplicity here, we'll just log it. A more robust system would handle reconnection.
                console.log(`[GAME] Player ${playerWallet} disconnected from active game ${currentGameId}.`);
             }
        }
    });
});

function gameLoop(gameId) {
    const gameSession = activeGames.get(gameId);
    if (!gameSession) return;
    
    gameSession.engine.update(gameSession);
    broadcastGameState(gameId);
    
    if (gameSession.gameState.gameOver) {
        console.log(`[GAME] Game ${gameId} finished. Winner ID: ${gameSession.gameState.winnerId}`);
        clearInterval(gameSession.intervalId);
        // Delay cleanup to allow final state to be sent
        setTimeout(() => {
            activeGames.delete(gameId);
            console.log(`[GAME] Cleaned up game session ${gameId}.`);
        }, 5000);
    }
}

function broadcastGameState(gameId) {
    const gameSession = activeGames.get(gameId);
    if (!gameSession) return;

    gameSession.players.forEach((player, index) => {
        if (player.ws.readyState === WebSocket.OPEN) {
            // Get the base state from the engine
            const baseState = gameSession.engine.getStateForPlayer(gameSession, player.walletAddress);

            // Attach sound events to the state payload
            baseState.soundEvents = gameSession.gameState.soundEvents || [];

            // If game is over, transform winnerId to be client-specific and add forfeit flag
            // This ensures the client always knows if "it" won (winnerId: 1), lost (winnerId: 2), or drew (winnerId: null)
            if (baseState.gameOver) {
                const trueWinnerId = gameSession.gameState.winnerId; // The real winner ID (1 or 2)
                const playerNumericId = index + 1;
                
                if (trueWinnerId === null) {
                    baseState.winnerId = null; // Draw
                } else {
                    baseState.winnerId = (trueWinnerId === playerNumericId) ? 1 : 2;
                }
                baseState.forfeited = gameSession.gameState.forfeited || false;
            }

            player.ws.send(JSON.stringify(baseState));
        }
    });

    // Clear sound events after they have been broadcast to all players
    if (gameSession.gameState.soundEvents) {
        gameSession.gameState.soundEvents = [];
    }
}

global.broadcastGameState = broadcastGameState; // Make it accessible to engines

server.listen(PORT, () => {
    console.log(`Server is live on http://localhost:${PORT}`);
});
