const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const SolanaGoldRushEngine = require('./game_engines/solanaGoldRushEngine.js');
const NeonPongEngine = require('./game_engines/neonPongEngine.js');
const CosmicDodgeEngine = require('./game_engines/cosmicDodgeEngine.js');
const ChessEngine = require('./game_engines/chessEngine.js');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// --- Data Stores (In-Memory) ---
const lobbies = {
    'solana-gold-rush': {},
    'neon-pong': {},
    'cosmic-dodge': {},
    'chess': {},
};
const activeGames = {};
const clients = new Map(); // For WebSocket connections

// --- Game Engine Mapping ---
const gameEngines = {
    'solana-gold-rush': SolanaGoldRushEngine,
    'neon-pong': NeonPongEngine,
    'cosmic-dodge': CosmicDodgeEngine,
    'chess': ChessEngine,
};


// --- HTTP API Endpoints ---

// LOBBY: Create a new lobby
app.post('/api/lobbies/create', (req, res) => {
    const { gameType, betAmount, creator, walletType } = req.body;
    if (!lobbies[gameType] || !creator) {
        return res.status(400).json({ error: 'Invalid game type or creator' });
    }
    const lobbyId = uuidv4();
    lobbies[gameType][lobbyId] = {
        lobbyId,
        gameType,
        betAmount,
        creator,
        walletType, // 'guest' or 'phantom'
        players: [creator],
    };
    console.log(`[Lobby Created] Game: ${gameType}, ID: ${lobbyId}, Bet: ${betAmount}`);
    broadcastLobbyUpdate(gameType);
    res.status(201).json({ lobbyId });
});

// LOBBY: List open lobbies for a game type
app.get('/api/lobbies/list/:gameType/:walletType', (req, res) => {
    const { gameType, walletType } = req.params;
    if (!lobbies[gameType]) {
        return res.status(400).json({ error: 'Invalid game type' });
    }
    // Filter lobbies to only show those matching the player's wallet type
    const availableLobbies = Object.values(lobbies[gameType]).filter(lobby => lobby.players.length === 1 && lobby.walletType === walletType);
    res.json({ lobbies: availableLobbies });
});

// LOBBY: Join an existing lobby
app.post('/api/lobbies/join', (req, res) => {
    const { lobbyId, player, gameType } = req.body;
    const lobby = lobbies[gameType]?.[lobbyId];

    if (!lobby || lobby.players.length >= 2) {
        return res.status(404).json({ error: 'Lobby not found or is full' });
    }

    lobby.players.push(player);
    console.log(`[Player Joined] Lobby ID: ${lobbyId}, Player: ${player.nickname}`);
    
    // --- Start Game ---
    const gameId = uuidv4();
    const gameEngine = new gameEngines[gameType]();
    activeGames[gameId] = {
        engine: gameEngine,
        players: lobby.players.map((p, index) => ({ ...p, id: index + 1 })), // Assign player IDs 1 and 2
        gameId,
        gameType,
        betAmount: lobby.betAmount,
        subscribers: new Set(),
    };
    gameEngine.init(activeGames[gameId].players);

    // Notify both players that the match has been found
    clients.forEach(client => {
        if (client.walletAddress === lobby.players[0].walletAddress || client.walletAddress === lobby.players[1].walletAddress) {
            client.ws.send(JSON.stringify({
                type: 'match_found',
                gameId,
                gameType,
                betAmount: lobby.betAmount,
            }));
        }
    });

    delete lobbies[gameType][lobbyId];
    broadcastLobbyUpdate(gameType);
    res.status(200).json({ gameId, message: 'Game starting' });
});

// LOBBY: Cancel a lobby you created
app.post('/api/lobbies/cancel', (req, res) => {
    const { lobbyId, gameType, walletAddress } = req.body;
    const lobby = lobbies[gameType]?.[lobbyId];
    if (lobby && lobby.creator.walletAddress === walletAddress) {
        delete lobbies[gameType][lobbyId];
        console.log(`[Lobby Canceled] ID: ${lobbyId}`);
        broadcastLobbyUpdate(gameType);
        res.status(200).json({ message: 'Lobby canceled' });
    } else {
        res.status(404).json({ error: 'Lobby not found or you are not the creator' });
    }
});


// BOT MATCH: Create an instant match against an AI
app.post('/api/bots/create-match', (req, res) => {
    const { gameType, betAmount, player } = req.body;
    if (!gameEngines[gameType]) {
        return res.status(400).json({ error: 'Invalid game type' });
    }

    const botPlayer = { walletAddress: `bot_${uuidv4()}`, nickname: 'BOT', isBot: true };

    const gameId = uuidv4();
    const gameEngine = new gameEngines[gameType]();
    activeGames[gameId] = {
        engine: gameEngine,
        players: [
            { ...player, id: 1 },
            { ...botPlayer, id: 2 }
        ],
        gameId,
        gameType,
        betAmount,
        subscribers: new Set(),
    };
    gameEngine.init(activeGames[gameId].players);
    console.log(`[Bot Match Created] Game: ${gameType}, ID: ${gameId}`);
    res.status(201).json({ gameId });
});


// --- WebSocket Server Logic ---
wss.on('connection', (ws) => {
    const clientId = uuidv4();
    clients.set(clientId, { ws });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            const clientInfo = clients.get(clientId);

            switch (data.type) {
                case 'join_game':
                    clientInfo.walletAddress = data.walletAddress;
                    const game = activeGames[data.gameId];
                    if (game) {
                        game.subscribers.add(ws);
                        clientInfo.gameId = data.gameId;
                        broadcastGameState(data.gameId);
                    }
                    break;

                // Game-specific actions
                case 'move_paddle':
                case 'stop_paddle':
                case 'keydown':
                case 'keyup':
                case 'play_choice':
                case 'move': // For Chess
                    handleGameAction(clientInfo, data);
                    break;
            }
        } catch (error) {
            console.error('Failed to parse message or handle action:', error);
        }
    });

    ws.on('close', () => {
        const clientInfo = clients.get(clientId);
        if (clientInfo && clientInfo.gameId) {
            const game = activeGames[clientInfo.gameId];
            if (game) {
                game.subscribers.delete(ws);
                // Forfeit logic
                if (game.engine && !game.engine.isGameOver()) {
                    const forfeitingPlayer = game.players.find(p => p.walletAddress === clientInfo.walletAddress);
                    const winner = game.players.find(p => p.walletAddress !== clientInfo.walletAddress);
                    if (forfeitingPlayer && winner) {
                        console.log(`[Forfeit] Player ${forfeitingPlayer.nickname} disconnected. ${winner.nickname} wins.`);
                        game.engine.forfeit(forfeitingPlayer.id);
                        broadcastGameState(clientInfo.gameId, true);
                    }
                }
            }
        }
        clients.delete(clientId);
    });
});


// --- Helper Functions ---

function handleGameAction(clientInfo, data) {
    const game = activeGames[clientInfo.gameId];
    if (game && game.engine) {
        const player = game.players.find(p => p.walletAddress === clientInfo.walletAddress);
        if (player) {
            game.engine.handleInput(player.id, data);
            
            // If it's a bot match and now the bot's turn, trigger bot action
            if (game.engine.isBotTurn && game.engine.isBotTurn()) {
                 setTimeout(() => {
                    game.engine.handleBotInput();
                    broadcastGameState(clientInfo.gameId);
                }, 500); // Small delay for bot "thinking"
            }
            
            // For real-time games, the broadcast is handled by the game loop
            if (game.gameType === 'solana-gold-rush' || game.gameType === 'chess') {
                 broadcastGameState(clientInfo.gameId);
            }
        }
    }
}

function broadcastGameState(gameId, forfeited = false) {
    const game = activeGames[gameId];
    if (!game) return;
    
    game.subscribers.forEach(ws => {
        const player = game.players.find(p => clients.get(findClientId(ws))?.walletAddress === p.walletAddress);
        if (player) {
            const state = game.engine.getState(player.id);
            state.forfeited = forfeited;
            ws.send(JSON.stringify(state));
        }
    });

    // Cleanup finished games
    if (game.engine.isGameOver()) {
        console.log(`[Game Over] ID: ${gameId}. Cleaning up.`);
        // Keep game for a bit for final state retrieval, then delete
        setTimeout(() => delete activeGames[gameId], 10000);
    }
}

function broadcastLobbyUpdate(gameType) {
    // This would be more efficient with a proper pub/sub system,
    // but for this scale, we can just notify all clients.
    const availableLobbies = Object.values(lobbies[gameType]).filter(lobby => lobby.players.length === 1);
    const payload = JSON.stringify({
        type: 'lobbies_update',
        gameType: gameType,
        lobbies: availableLobbies
    });
    // This is a simplified broadcast. A real app would track lobby subscriptions.
    clients.forEach(client => {
        client.ws.send(payload);
    });
}

function findClientId(ws) {
    for (let [id, client] of clients.entries()) {
        if (client.ws === ws) {
            return id;
        }
    }
}

// Start game loops for real-time games
setInterval(() => {
    for (const gameId in activeGames) {
        const game = activeGames[gameId];
        if (game.gameType === 'neon-pong' || game.gameType === 'cosmic-dodge') {
            if (game.engine && !game.engine.isGameOver()) {
                game.engine.update();
                broadcastGameState(gameId);
            }
        }
    }
}, 1000 / 60); // 60 FPS


const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
