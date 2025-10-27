const { Chess } = require('chess.js');

class ChessEngine {
    constructor() {
        this.game = new Chess();
        this.players = [];
        this.gameOver = false;
        this.winnerId = null;
        this.isDraw = false;
        this.soundEvents = [];
    }

    init(players) {
        // Randomly assign colors
        const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
        this.players = [
            { ...shuffledPlayers[0], id: 1, color: 'w' }, // White
            { ...shuffledPlayers[1], id: 2, color: 'b' }, // Black
        ];
    }

    handleInput(playerId, data) {
        const player = this.players.find(p => p.id === playerId);
        if (!player || this.game.turn() !== player.color || this.gameOver) {
            return; // Not this player's turn or game is over
        }

        if (data.type === 'move') {
            try {
                const move = this.game.move({ from: data.from, to: data.to, promotion: 'q' }); // Auto-promote to queen for simplicity
                if (move) {
                    this.soundEvents.push('roundStart'); // Using generic sound for move
                    this.checkGameState();
                }
            } catch (e) {
                console.log('Invalid move:', e.message);
            }
        }
    }
    
    isBotTurn() {
        const currentPlayerColor = this.game.turn();
        const bot = this.players.find(p => p.isBot && p.color === currentPlayerColor);
        return !!bot;
    }

    handleBotInput() {
        if (this.gameOver) return;
        
        const possibleMoves = this.game.moves();
        if (possibleMoves.length > 0) {
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            this.game.move(randomMove);
            this.soundEvents.push('roundStart');
            this.checkGameState();
        }
    }

    checkGameState() {
        if (this.game.isCheckmate()) {
            this.gameOver = true;
            const winnerColor = this.game.turn() === 'w' ? 'b' : 'w';
            const winner = this.players.find(p => p.color === winnerColor);
            this.winnerId = winner.id;
        } else if (this.game.isDraw() || this.game.isStalemate() || this.game.isThreefoldRepetition() || this.game.isInsufficientMaterial()) {
            this.gameOver = true;
            this.isDraw = true;
            this.winnerId = null;
        }
    }

    forfeit(playerId) {
        if (this.gameOver) return;
        this.gameOver = true;
        const winner = this.players.find(p => p.id !== playerId);
        this.winnerId = winner.id;
    }
    
    isGameOver() {
        return this.gameOver;
    }

    getState(playerId) {
        const player = this.players.find(p => p.id === playerId);
        const opponent = this.players.find(p => p.id !== playerId);
        
        const possibleMoves = {};
        this.game.moves({ verbose: true }).forEach(move => {
            if (!possibleMoves[move.from]) {
                possibleMoves[move.from] = [];
            }
            possibleMoves[move.from].push(move.to);
        });

        return {
            fen: this.game.fen(),
            turn: this.game.turn(),
            playerColor: player.color,
            isCheck: this.game.isCheck(),
            isCheckmate: this.game.isCheckmate(),
            isDraw: this.isDraw,
            possibleMoves,
            you: { nickname: player.nickname },
            opponent: { nickname: opponent.nickname },
            gameOver: this.gameOver,
            winnerId: this.winnerId,
            soundEvents: [...this.soundEvents],
        };
    }
}

module.exports = ChessEngine;
