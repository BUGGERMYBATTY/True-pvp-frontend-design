const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

// --- Game Engines ---
const createSolanaGoldRushEngine = require('./game_engines/solanaGoldRushEngine.js');
const createNeonPongEngine = require('./game_engines/neonPongEngine.js');
const createCosmicDodgeEngine = require('./game_engines/cosmicDodgeEngine.js');
const createChessEngine = require('./game_engines/chessEngine.js');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// --- Server State ---
let lobbies = {
    guest: {},
    phantom: {}
};
let gameSessions = {};

const gameEngines = {
    'solana-gold-rush': createSolanaGoldRushEngine(),
    'neon-pong': createNeonPongEngine(),
    'cosmic-dodge': createCosmicDodgeEngine(),
    'chess': createChessEngine(),
};

// --- API Endpoints for Lobby System ---
app.post('/api/lobbies/create', (req, res) => {
    const { gameType, betAmount, walletAddress, nickname, walletType } = req.body;
    if (!['guest', 'phantom'].includes(walletType)) {
        return res.status(400).json({ error: 'Invalid wallet type.' });
    }
    
    // Prevent user from creating multiple lobbies
    for (const lobbyId in lobbies[walletType]) {
        if (lobbies[walletType][lobbyId].creator.walletAddress === walletAddress) {
            return res.status(400).json({ error: 'You already have an active lobby.' });
        }
    }

    const lobbyId = uuidv4();
    lobbies[walletType][lobbyId] = {
        lobbyId,
        gameType,
        betAmount,
        creator: { walletAddress, nickname },
        createdAt: Date.now(),
    };
    console.log(`[Lobby Created][${walletType}] ${nickname} created ${gameType} lobby for ${betAmount} SOL.`);
    res.status(201).json({ lobbyId });
});

app.get('/api/lobbies/list/:walletType', (req, res) => {
    const { walletType } = req.params;
     if (!['guest', 'phantom'].includes(walletType)) {
        return res.status(400).json({ error: 'Invalid wallet type.' });
    }
    res.json(Object.values(lobbies[walletType]));
});

app.post('/api/lobbies/join', (req, res) => {
    const { lobbyId, joinerWalletAddress, joinerNickname, walletType } = req.body;
    if (!['guest', 'phantom'].includes(walletType)) {
        return res.status(400).json({ error: 'Invalid wallet type.' });
    }

    const lobby = lobbies[walletType][lobbyId];
    if (!lobby) {
        return res.status(404).json({ error: 'Lobby not found.' });
    }

    if (lobby.creator.walletAddress === joinerWalletAddress) {
        return res.status(400).json({ error: "You can't join your own lobby." });
    }

    const gameId = uuidv4();
    const engine = gameEngines[lobby.gameType];
    if (!engine) {
        return res.status(400).json({ error: 'Invalid game type.' });
    }

    const players = [
        { ...lobby.creator },
        { walletAddress: joinerWalletAddress, nickname: joinerNickname }
    ];

    gameSessions[gameId] = {
        gameId,
        gameType: lobby.gameType,
        players,
        betAmount: lobby.betAmount,
        gameState: engine.init(),
        clients: new Set(),
        isRealTime: ['neon-pong', 'cosmic-dodge'].includes(lobby.gameType),
    };

    delete lobbies[walletType][lobbyId];
    console.log(`[Game Started] ${lobby.creator.nickname} vs ${joinerNickname} in ${lobby.gameType}. Game ID: ${gameId}`);
    res.status(200).json({ gameId });
});

app.get('/api/lobbies/status/:lobbyId', (req, res) => {
    const { lobbyId } = req.params;
    
    // Check both pools for the lobby
    let foundLobby = Object.values(lobbies.guest).find(l => l.lobbyId === lobbyId) || 
                     Object.values(lobbies.phantom).find(l => l.lobbyId === lobbyId);
    
    // If lobby is not found, check if a game has been created from it
    let gameId = null;
    if (!foundLobby) {
        const game = Object.values(gameSessions).find(gs => gs.players.some(p => p.lobbyId === lobbyId));
        if (game) {
            gameId = game.gameId;
        }
    }
    
    const game = Object.values(gameSessions).find(gs => gs.players[0].lobbyId === lobbyId);
    if (!foundLobby && game) {
        return res.json({ status: 'matched', gameId: game.gameId });
    }
    
    if (foundLobby) {
        return res.json({ status: 'waiting' });
    }

    // After a join, the lobby is deleted. The client that created the lobby polls this status.
    // We need to find the game that was just created from this lobby.
    const activeGame = Object.values(gameSessions).find(g => g.lobbyId === lobbyId);
    if(activeGame) {
        return res.json({ status: 'matched', gameId: activeGame.gameId });
    }
    
    // Find game by checking players if lobbyId was attached to creator
    const gameFromCreator = Object.values(gameSessions).find(g => g.players[0].lobbyId === lobbyId);
     if (gameFromCreator) {
        return res.json({ status: 'matched', gameId: gameFromCreator.gameId });
    }


    return res.json({ status: 'not_found' });
});

app.post('/api/lobbies/cancel', (req, res) => {
    const { lobbyId, walletType } = req.body;
    if (lobbies[walletType] && lobbies[walletType][lobbyId]) {
        console.log(`[Lobby Canceled] Lobby ${lobbyId} canceled.`);
        delete lobbies[walletType][lobbyId];
        res.status(200).json({ message: 'Lobby canceled.' });
    } else {
        res.status(404).json({ message: 'Lobby not found.' });
    }
});


// --- WebSocket Server ---
global.broadcastGameState = (gameId) => {
    const gameSession = gameSessions[gameId];
    if (!gameSession) return;

    gameSession.clients.forEach(client => {
        const engine = gameEngines[gameSession.gameType];
        const stateForPlayer = engine.getStateForPlayer(gameSession, client.walletAddress);

        if (stateForPlayer.gameOver) {
            let winnerId = null;
            if (gameSession.gameState.winnerId) {
                const winnerIndex = gameSession.gameState.winnerId - 1;
                winnerId = client.walletAddress === gameSession.players[winnerIndex].walletAddress ? 1 : 2;
            }
            client.send(JSON.stringify({
                gameOver: true,
                winnerId: winnerId,
                forfeited: gameSession.gameState.forfeited,
            }));
        } else {
             // Attach sound events and clear them
            if (gameSession.gameState.soundEvents && gameSession.gameState.soundEvents.length > 0) {
                stateForPlayer.soundEvents = [...gameSession.gameState.soundEvents];
                gameSession.gameState.soundEvents = [];
            }
            client.send(JSON.stringify(stateForPlayer));
        }
    });
};

const gameLoop = () => {
    for (const gameId in gameSessions) {
        const session = gameSessions[gameId];
        if (session.isRealTime && session.clients.size === 2) {
            const engine = gameEngines[session.gameType];
            if (engine.update) {
                engine.update(session);
                broadcastGameState(gameId);
            }
        }
    }
};

setInterval(gameLoop, 1000 / 60); // 60 FPS game loop

wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // --- Game Logic ---
            if (data.type === 'join_game') {
                const { gameId, walletAddress, gameType } = data;
                const gameSession = gameSessions[gameId];
                if (gameSession && gameSession.gameType === gameType) {
                    ws.walletAddress = walletAddress;
                    gameSession.clients.add(ws);
                    console.log(`${walletAddress} joined game ${gameId}`);
                    
                    if (gameSession.clients.size === 2) {
                        const engine = gameEngines[gameType];
                        engine.start(gameSession);
                        if (!gameSession.isRealTime) {
                            broadcastGameState(gameId);
                        }
                    }
                }
            } else if (ws.walletAddress) {
                const gameSession = Object.values(gameSessions).find(gs => gs.clients.has(ws));
                if (gameSession) {
                    const engine = gameEngines[gameSession.gameType];
                    engine.handleInput(gameSession, ws.walletAddress, data);
                     if (!gameSession.isRealTime) {
                         broadcastGameState(gameSession.gameId);
                     }
                }
            }

        } catch (error) {
            console.error('Failed to parse message or handle client input:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        const gameSession = Object.values(gameSessions).find(gs => gs.clients.has(ws));
        if (gameSession && !gameSession.gameState.gameOver) {
            console.log(`${ws.walletAddress} disconnected from game ${gameSession.gameId}, initiating forfeit.`);
            gameSession.gameState.forfeited = true;
            gameSession.gameState.gameOver = true;
            
            // The player who did NOT disconnect is the winner.
            const winnerIndex = gameSession.players.findIndex(p => p.walletAddress !== ws.walletAddress);
            gameSession.gameState.winnerId = winnerIndex + 1; // winnerId is 1 or 2
            
            broadcastGameState(gameSession.gameId);
        }
    });
});


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});