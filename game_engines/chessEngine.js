const { Chess } = require('chess.js');

const createChessEngine = () => {

    const init = () => {
        const game = new Chess();
        return {
            fen: game.fen(),
            p1_color: Math.random() < 0.5 ? 'w' : 'b',
            p1: { nickname: 'Player 1' },
            p2: { nickname: 'Player 2' },
            winnerId: null, // 1 or 2
            gameOver: false,
            forfeited: false,
            status: 'waiting',
        };
    };

    const start = (gameSession) => {
        const { gameState, players } = gameSession;
        gameState.p1.nickname = players[0].nickname;
        gameState.p2.nickname = players[1].nickname;
        gameState.status = 'playing';
        global.broadcastGameState(gameSession.gameId);
    };

    const handleInput = (gameSession, playerWallet, data) => {
        const { gameState, players } = gameSession;
        if (gameState.gameOver || gameState.status !== 'playing') return;

        const playerIndex = players.findIndex(p => p.walletAddress === playerWallet);
        if (playerIndex === -1) return;
        
        const playerColor = (playerIndex === 0 ? gameState.p1_color : (gameState.p1_color === 'w' ? 'b' : 'w'));

        const game = new Chess(gameState.fen);

        if (game.turn() !== playerColor) {
            // Not this player's turn
            return;
        }

        if (data.type === 'move') {
            try {
                const move = game.move({ from: data.from, to: data.to, promotion: 'q' }); // Auto-promote to queen
                if (move) {
                    gameState.fen = game.fen();
                    // Check for game over conditions
                    if (game.isCheckmate()) {
                        gameState.gameOver = true;
                        gameState.winnerId = game.turn() === 'b' ? 1 : 2; // The winner is the one whose opponent is in checkmate
                        if(playerColor === 'b') gameState.winnerId = 2;
                        else gameState.winnerId = 1;
                    } else if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition()) {
                        gameState.gameOver = true;
                        gameState.winnerId = null; // Draw
                    }
                }
            } catch (e) {
                // Illegal move attempted, just ignore it. Client should prevent this.
                console.log(`Illegal move attempted by ${playerWallet}: ${data.from}-${data.to}`);
            }
        }
    };
    
    const getPossibleMoves = (game) => {
        const moves = {};
        game.moves({ verbose: true }).forEach(move => {
            if (!moves[move.from]) {
                moves[move.from] = [];
            }
            moves[move.from].push(move.to);
        });
        return moves;
    };

    const getStateForPlayer = (gameSession, playerWallet) => {
        const { gameState, players } = gameSession;
        const playerIndex = players.findIndex(p => p.walletAddress === playerWallet);
        const opponentIndex = playerIndex === 0 ? 1 : 0;
        
        const playerColor = (playerIndex === 0 ? gameState.p1_color : (gameState.p1_color === 'w' ? 'b' : 'w'));

        const game = new Chess(gameState.fen);

        return {
            fen: gameState.fen,
            playerColor: playerColor,
            turn: game.turn(),
            possibleMoves: game.turn() === playerColor ? getPossibleMoves(game) : {},
            isCheck: game.inCheck(),
            isCheckmate: game.isCheckmate(),
            isDraw: game.isDraw() || game.isStalemate() || game.isThreefoldRepetition(),
            gameOver: gameState.gameOver,
            you: {
                nickname: players[playerIndex].nickname,
            },
            opponent: {
                nickname: players[opponentIndex].nickname,
            }
        };
    };

    return { init, start, handleInput, getStateForPlayer };
};

module.exports = createChessEngine;
