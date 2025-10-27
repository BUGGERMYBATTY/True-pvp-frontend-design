class SolanaGoldRushEngine {
    constructor() {
        this.players = [];
        this.round = 0;
        this.roundNumber = 0;
        this.roundNumbers = [];
        this.gameOver = false;
        this.winnerId = null;
        this.isDraw = false;
        this.roundMessage = 'Waiting for players to choose...';
        this.soundEvents = [];
    }

    init(players) {
        this.players = players.map(p => ({
            ...p,
            nuggets: [1, 2, 3, 4, 5],
            score: 0,
            choice: null,
            isBot: p.isBot || false,
        }));
        this.roundNumbers = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 5);
        this.startNextRound();
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    startNextRound() {
        this.round++;
        if (this.round > 5) {
            this.endGame();
            return;
        }
        this.roundNumber = this.roundNumbers[this.round - 1];
        this.players.forEach(p => p.choice = null);
        this.roundMessage = 'Choose your nugget!';
        this.soundEvents.push('roundStart');
        
        // If a bot needs to play in this round, handle its input
        if (this.isBotTurn()) {
            this.handleBotInput();
        }
    }

    handleInput(playerId, data) {
        const player = this.players.find(p => p.id === playerId);
        if (player && player.choice === null && player.nuggets.includes(data.choice)) {
            player.choice = data.choice;
            player.nuggets = player.nuggets.filter(n => n !== data.choice);
            
            this.roundMessage = `${player.nickname} has chosen.`;

            if (this.players.every(p => p.choice !== null)) {
                this.processRound();
            } else {
                 // If the other player is a bot, make it play now
                const otherPlayer = this.players.find(p => p.id !== playerId);
                if(otherPlayer.isBot) {
                    this.handleBotInput();
                }
            }
        }
    }
    
    isBotTurn() {
        // In this game, bots can play at the same time as players.
        // We'll check if there's any bot that hasn't made a choice yet.
        return this.players.some(p => p.isBot && p.choice === null);
    }
    
    handleBotInput() {
        const bot = this.players.find(p => p.isBot && p.choice === null);
        if (bot) {
            // Simple AI: play a random available nugget
            const randomNugget = bot.nuggets[Math.floor(Math.random() * bot.nuggets.length)];
            this.handleInput(bot.id, { choice: randomNugget });
        }
    }

    processRound() {
        const [p1, p2] = this.players;
        let roundWinner = null;

        if (p1.choice > p2.choice) {
            roundWinner = p1;
        } else if (p2.choice > p1.choice) {
            roundWinner = p2;
        }

        if (roundWinner) {
            const scoreToAdd = this.roundNumber + p1.choice + p2.choice;
            roundWinner.score += scoreToAdd;
            this.roundMessage = `${roundWinner.nickname} wins the round and gets ${scoreToAdd} points!`;
            this.soundEvents.push('score');
        } else {
            this.roundMessage = "It's a draw! No points awarded.";
            this.soundEvents.push('draw');
        }

        setTimeout(() => this.startNextRound(), 3000); // Wait 3 seconds before next round
    }

    endGame() {
        this.gameOver = true;
        const [p1, p2] = this.players;
        if (p1.score > p2.score) {
            this.winnerId = p1.id;
            this.roundMessage = `${p1.nickname} wins the game!`;
        } else if (p2.score > p1.score) {
            this.winnerId = p2.id;
             this.roundMessage = `${p2.nickname} wins the game!`;
        } else {
            this.winnerId = null; // Draw
            this.isDraw = true;
             this.roundMessage = "The game is a draw!";
        }
    }

    forfeit(playerId) {
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
        
        const showOpponentChoice = this.players.every(p => p.choice !== null);

        return {
            round: this.round,
            roundNumber: this.roundNumber,
            roundMessage: this.roundMessage,
            you: {
                name: player.nickname,
                score: player.score,
                nuggets: player.nuggets,
                choice: player.choice,
            },
            opponent: {
                name: opponent.nickname,
                score: opponent.score,
                choice: showOpponentChoice ? opponent.choice : (opponent.choice ? 'Chosen' : null),
            },
            isPlayerTurn: player.choice === null,
            showOpponentChoice,
            gameOver: this.gameOver,
            winnerId: this.winnerId,
            isDraw: this.isDraw,
            soundEvents: [...this.soundEvents],
        };
    }
}

module.exports = SolanaGoldRushEngine;
