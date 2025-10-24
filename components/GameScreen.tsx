import React, { useState, useEffect, useCallback } from 'react';
import { Player, GameState as GameStateType } from '../types';

interface GameScreenProps {
  onGameOver: (winnerId: number | null) => void;
  betAmount: number;
  // FIX: Added missing props to satisfy the component's signature in the parent component.
  gameId: string;
  walletAddress: string;
  nickname: string;
}

const getInitialState = (nickname: string): GameStateType => {
    // Shuffle the available round numbers once at the start of the game
    const shuffledRoundNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].sort(() => Math.random() - 0.5);
    return {
        round: 1,
        roundNumber: null,
        players: [
            // FIX: Use the nickname from props instead of a hardcoded "You".
            { id: 1, name: nickname, score: 0, nuggets: [1, 2, 3, 4, 5], choice: null },
            { id: 2, name: 'Opponent', score: 0, nuggets: [1, 2, 3, 4, 5], choice: null }
        ],
        roundWinnerId: null,
        gameWinnerId: null,
        gameOver: false,
        availableRoundNumbers: shuffledRoundNumbers.slice(0, 5), // Take the first 5 for the 5 rounds
        roundMessage: 'Prepare for Round 1',
    };
};

const GameScreen: React.FC<GameScreenProps> = ({ onGameOver, betAmount, nickname }) => {
    const [gameState, setGameState] = useState<GameStateType>(() => getInitialState(nickname));
    const [isPlayerTurn, setIsPlayerTurn] = useState(false);
    const [showOpponentChoice, setShowOpponentChoice] = useState(false);

    const startRound = useCallback(() => {
        setGameState(prev => {
            const roundNumber = prev.availableRoundNumbers[prev.round - 1];
            return {
                ...prev,
                roundNumber: roundNumber,
                players: prev.players.map(p => ({ ...p, choice: null })) as [Player, Player],
                roundWinnerId: null,
                roundMessage: `Round ${prev.round}: Place your bet. Round Value: ${roundNumber}`,
            };
        });
        setShowOpponentChoice(false);
        setIsPlayerTurn(true);
    }, []);

    useEffect(() => {
        // Initial round start
        const timer = setTimeout(startRound, 2000);
        return () => clearTimeout(timer);
    }, [startRound]);
    
    const handlePlayerChoice = (choice: number) => {
        if (!isPlayerTurn) return;

        setIsPlayerTurn(false);

        // AI makes a choice
        const aiPlayer = gameState.players[1];
        const availableNuggets = aiPlayer.nuggets;
        // Simple AI: Use a high chip for high round numbers, save low chips for low round numbers
        let aiChoice;
        if ((gameState.roundNumber ?? 0) > 5) {
            aiChoice = Math.max(...availableNuggets);
        } else {
            aiChoice = Math.min(...availableNuggets);
        }
        if (!availableNuggets.includes(aiChoice)) {
          aiChoice = availableNuggets[0];
        }

        setGameState(prev => ({
            ...prev,
            players: [
                {
                    ...prev.players[0],
                    choice,
                    nuggets: prev.players[0].nuggets.filter(n => n !== choice)
                },
                {
                    ...prev.players[1],
                    choice: aiChoice,
                    nuggets: prev.players[1].nuggets.filter(n => n !== aiChoice)
                }
            ] as [Player, Player],
            roundMessage: 'Revealing choices...'
        }));
    };

    const processRound = useCallback(() => {
        setGameState(prev => {
            const player1 = prev.players[0];
            const player2 = prev.players[1];
            const roundValue = prev.roundNumber || 0;

            if (!player1.choice || !player2.choice) return prev;

            let newScore1 = player1.score;
            let newScore2 = player2.score;
            let roundWinnerId = null;
            let roundMessage = '';

            if (player1.choice > player2.choice) {
                roundWinnerId = 1;
                const points = roundValue + player1.choice + player2.choice;
                newScore1 += points;
                roundMessage = `You win the round! +${points} points.`;
            } else if (player2.choice > player1.choice) {
                roundWinnerId = 2;
                const points = roundValue + player1.choice + player2.choice;
                newScore2 += points;
                roundMessage = `Opponent wins the round. +${points} points.`;
            } else {
                roundWinnerId = null;
                roundMessage = "It's a draw! No points awarded.";
            }

            return {
                ...prev,
                players: [
                    { ...player1, score: newScore1 },
                    { ...player2, score: newScore2 }
                ] as [Player, Player],
                roundWinnerId,
                roundMessage,
            };
        });
    }, []);

    useEffect(() => {
        const { players, gameOver, round } = gameState;
        if (players[0].choice && players[1].choice && !gameOver) {
             // Reveal opponent's choice, then process round result
            const revealTimer = setTimeout(() => {
                setShowOpponentChoice(true);
                processRound();
            }, 1000);

            // Move to next round or end game
            const nextActionTimer = setTimeout(() => {
                if (round < 5) {
                    setGameState(prev => ({ ...prev, round: prev.round + 1 }));
                    startRound();
                } else {
                    // Game over logic
                    setGameState(prev => {
                        const finalPlayer1Score = prev.players[0].score;
                        const finalPlayer2Score = prev.players[1].score;
                        let winnerId: number | null;
                        if (finalPlayer1Score > finalPlayer2Score) {
                            winnerId = 1;
                        } else if (finalPlayer2Score > finalPlayer1Score) {
                            winnerId = 2;
                        } else {
                            winnerId = null; // Draw
                        }
                        onGameOver(winnerId);
                        return { ...prev, gameOver: true, roundMessage: 'Game Over!' };
                    });
                }
            }, 4000); // Wait 4 seconds before next round/game over

            return () => {
                clearTimeout(revealTimer);
                clearTimeout(nextActionTimer);
            };
        }
    }, [gameState, onGameOver, processRound, startRound]);

    const { players, round, roundNumber, roundMessage } = gameState;
    const player1 = players[0];
    const player2 = players[1];

    return (
        <div className="w-full h-full flex flex-col items-center justify-between p-8 text-white">
            {/* Header: Round Info & Pot */}
            <header className="w-full flex justify-between items-center mb-6">
                <div className="text-left">
                    <h2 className="text-3xl font-bold font-display text-yellow">Round {round} / 5</h2>
                </div>
                <div className="text-center bg-brand-gray p-3 rounded-lg border border-yellow/30">
                    <h3 className="text-lg text-gray-400">Round Value</h3>
                    <p className="text-4xl font-bold text-white">{roundNumber ?? '...'}</p>
                </div>
                <div className="text-right">
                    <h3 className="text-lg text-gray-400">Total Pot</h3>
                    <p className="text-3xl font-bold text-yellow-light">{(betAmount * 2).toFixed(2)} SOL</p>
                </div>
            </header>

            {/* Main Game Area: Player vs Opponent */}
            <main className="w-full flex-grow flex items-center justify-around">
                {/* Player 1 (You) */}
                <div className="flex flex-col items-center w-1/3">
                    <h3 className="text-2xl font-bold font-display text-blue-light">{player1.name}</h3>
                    <p className="text-xl">Score: {player1.score}</p>
                    <div className="h-24 w-24 my-4 border-2 border-blue-light/50 rounded-full flex items-center justify-center text-5xl font-bold bg-black/30">
                        {player1.choice ?? '?'}
                    </div>
                </div>

                {/* VS */}
                <div className="text-5xl font-extrabold font-display text-gray-500">VS</div>

                {/* Player 2 (Opponent) */}
                <div className="flex flex-col items-center w-1/3">
                    <h3 className="text-2xl font-bold font-display text-pink-light">{player2.name}</h3>
                    <p className="text-xl">Score: {player2.score}</p>
                    <div className="h-24 w-24 my-4 border-2 border-pink-light/50 rounded-full flex items-center justify-center text-5xl font-bold bg-black/30">
                        {showOpponentChoice ? player2.choice : '?'}
                    </div>
                </div>
            </main>

            {/* Footer: Player Actions & Messages */}
            <footer className="w-full flex flex-col items-center">
                <p className="text-xl h-8 mb-4">{roundMessage}</p>
                <div className="flex gap-4">
                    {player1.nuggets.map(nugget => (
                        <button
                            key={nugget}
                            onClick={() => handlePlayerChoice(nugget)}
                            disabled={!isPlayerTurn}
                            className="w-16 h-16 rounded-full bg-yellow text-brand-dark text-3xl font-bold border-2 border-transparent transition-all duration-200 enabled:hover:scale-110 enabled:hover:border-white disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                            {nugget}
                        </button>
                    ))}
                </div>
            </footer>
        </div>
    );
};

export default GameScreen;