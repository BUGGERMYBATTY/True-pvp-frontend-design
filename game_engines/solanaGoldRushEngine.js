// A turn-based engine for Solana Gold Rush

const createSolanaGoldRushEngine = () => {
    // --- Helper Functions ---
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // --- Engine Methods ---
    const init = () => {
        const roundNumbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 5);
        return {
            round: 0,
            roundNumber: null,
            players: [
                { id: 1, name: 'Player 1', score: 0, nuggets: [1, 2, 3, 4, 5], choice: null },
                { id: 2, name: 'Player 2', score: 0, nuggets: [1, 2, 3, 4, 5], choice: null }
            ],
            roundWinnerId: null,
            winnerId: null, // The "true" winner ID (1 or 2)
            gameOver: false,
            forfeited: false,
            availableRoundNumbers: roundNumbers,
            roundMessage: 'Waiting for players...',
            turnState: 'waiting', // waiting, choosing, revealing, finished
        };
    };

    const start = (gameSession) => {
        const { gameState, players } = gameSession;
        gameState.players[0].name = players[0].nickname;
        gameState.players[1].name = players[1].nickname;
        gameState.roundMessage = "Game starting...";
        global.broadcastGameState(gameSession.gameId);

        setTimeout(() => startNextRound(gameSession), 2000);
    };
    
    const startNextRound = (gameSession) => {
        const { gameState } = gameSession;
        gameState.round += 1;
        gameState.roundNumber = gameState.availableRoundNumbers[gameState.round - 1];
        gameState.players.forEach(p => p.choice = null);
        gameState.roundWinnerId = null;
        gameState.roundMessage = `Round ${gameState.round}: Place your bet. Round Value: ${gameState.roundNumber}`;
        gameState.turnState = 'choosing';
        global.broadcastGameState(gameSession.gameId);
    };

    const handleInput = (gameSession, playerWallet, data) => {
        const { gameState, players } = gameSession;
        if (gameState.turnState !== 'choosing' || gameState.gameOver) return;

        const playerIndex = players.findIndex(p => p.walletAddress === playerWallet);
        if (playerIndex === -1) return;

        if (data.type === 'play_choice' && gameState.players[playerIndex].nuggets.includes(data.choice)) {
            gameState.players[playerIndex].choice = data.choice;
            
            const bothPlayersChosen = gameState.players.every(p => p.choice !== null);
            if (bothPlayersChosen) {
                processRound(gameSession);
            } else {
                global.broadcastGameState(gameSession.gameId);
            }
        }
    };

    const processRound = (gameSession) => {
        const { gameState } = gameSession;
        gameState.turnState = 'revealing';
        gameState.roundMessage = 'Revealing choices...';
        global.broadcastGameState(gameSession.gameId);

        setTimeout(() => {
            const player1 = gameState.players[0];
            const player2 = gameState.players[1];
            const roundValue = gameState.roundNumber || 0;

            // Remove used nuggets
            player1.nuggets = player1.nuggets.filter(n => n !== player1.choice);
            player2.nuggets = player2.nuggets.filter(n => n !== player2.choice);

            let roundWinnerId = null;
            let roundMessage = '';

            if (player1.choice > player2.choice) {
                roundWinnerId = 1;
                const points = roundValue + player1.choice + player2.choice;
                player1.score += points;
                roundMessage = `${player1.name} wins the round! +${points} points.`;
            } else if (player2.choice > player1.choice) {
                roundWinnerId = 2;
                const points = roundValue + player1.choice + player2.choice;
                player2.score += points;
                roundMessage = `${player2.name} wins the round. +${points} points.`;
            } else {
                roundWinnerId = null; // Draw
                roundMessage = "It's a draw! No points awarded.";
            }
            
            gameState.roundWinnerId = roundWinnerId;
            gameState.roundMessage = roundMessage;
            global.broadcastGameState(gameSession.gameId);
            
            setTimeout(() => {
                if (gameState.round >= 5) {
                    endGame(gameSession);
                } else {
                    startNextRound(gameSession);
                }
            }, 3000);

        }, 1500); // Wait 1.5s to show opponent choice
    };

    const endGame = (gameSession) => {
        const { gameState } = gameSession;
        const player1 = gameState.players[0];
        const player2 = gameState.players[1];

        if (player1.score > player2.score) {
            gameState.winnerId = 1;
        } else if (player2.score > player1.score) {
            gameState.winnerId = 2;
        } else {
            gameState.winnerId = null; // Draw
        }
        
        gameState.gameOver = true;
        gameState.turnState = 'finished';
        gameState.roundMessage = 'Game Over!';
        global.broadcastGameState(gameSession.gameId);
    };

    const getStateForPlayer = (gameSession, playerWallet) => {
        const { gameState, players } = gameSession;
        const playerIndex = players.findIndex(p => p.walletAddress === playerWallet);
        const opponentIndex = playerIndex === 0 ? 1 : 0;
        
        const you = gameState.players[playerIndex];
        const opponent = gameState.players[opponentIndex];
        
        if (gameState.gameOver) {
            // The `winnerId` transformation happens in server.js `broadcastGameState`
            return {
                gameOver: true,
                you: { name: you.name, score: you.score, choice: you.choice },
                opponent: { name: opponent.name, score: opponent.score, choice: opponent.choice },
                roundMessage: gameState.roundMessage,
            };
        }

        return {
            round: gameState.round,
            roundNumber: gameState.roundNumber,
            roundMessage: gameState.roundMessage,
            you: {
                name: you.name,
                score: you.score,
                nuggets: you.nuggets,
                choice: you.choice,
            },
            opponent: {
                name: opponent.name,
                score: opponent.score,
                // Only show opponent's choice during the 'revealing' or 'finished' phase
                choice: (gameState.turnState === 'revealing' || gameState.turnState === 'finished') ? opponent.choice : (opponent.choice !== null ? 'Chosen' : null),
            },
            isPlayerTurn: gameState.turnState === 'choosing' && you.choice === null,
            showOpponentChoice: gameState.turnState === 'revealing' || gameState.turnState === 'finished',
        };
    };

    return { init, start, handleInput, getStateForPlayer };
};

module.exports = createSolanaGoldRushEngine;
