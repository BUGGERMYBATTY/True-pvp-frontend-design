// --- Server-Authoritative Game Engine for Neon Pong ---

const createNeonPongEngine = () => {
    // --- Game Constants ---
    const GAME_WIDTH = 600;
    const GAME_HEIGHT = 400;
    const PADDLE_WIDTH = 12;
    const PADDLE_HEIGHT = 100;
    const BALL_SIZE = 12;
    const PADDLE_SPEED = 6;
    const PADDLE_X_OFFSET = 20; // Distance from edge
    const WINNING_SCORE = 3;
    const WINNING_ROUNDS = 2;

    let initialBallSpeedX = 5;

    // --- Engine Methods ---
    const init = () => ({
        p1: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, vy: 0, score: 0, roundsWon: 0, nickname: 'Player 1' },
        p2: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2, vy: 0, score: 0, roundsWon: 0, nickname: 'Player 2' },
        ball: { x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2, vx: 0, vy: 0 },
        countdown: 3,
        message: 'Waiting for opponent...',
        winnerId: null,
        gameOver: false,
        forfeited: false,
        countdownInterval: null,
    });

    const serveBall = (gameState) => {
        gameState.ball.x = GAME_WIDTH / 2;
        gameState.ball.y = GAME_HEIGHT / 2;
        // Alternate serve direction
        initialBallSpeedX *= -1;
        gameState.ball.vx = initialBallSpeedX;
        gameState.ball.vy = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 3);
    };

    const startCountdown = (gameSession) => {
        const { gameState } = gameSession;
        if (gameState.countdownInterval) clearInterval(gameState.countdownInterval);
        
        gameState.countdownInterval = setInterval(() => {
            gameState.countdown--;
            if (gameState.countdown <= 0) {
                clearInterval(gameState.countdownInterval);
                gameState.countdownInterval = null;
                gameState.countdown = null;
                gameState.message = '';
                serveBall(gameState);
            }
            global.broadcastGameState(gameSession.gameId);
        }, 1000);
    };

    const start = (gameSession) => {
        const { gameState, players } = gameSession;
        gameState.p1.nickname = players[0].nickname;
        gameState.p2.nickname = players[1].nickname;
        gameState.message = `Round ${gameState.p1.roundsWon + gameState.p2.roundsWon + 1}`;
        startCountdown(gameSession);
    };

    const handleInput = (gameSession, playerWallet, data) => {
        const { gameState, players } = gameSession;
        if (gameState.gameOver || gameState.countdown) return;

        const playerIndex = players.findIndex(p => p.walletAddress === playerWallet);
        const playerKey = playerIndex === 0 ? 'p1' : 'p2';
        const player = gameState[playerKey];
        
        if (data.type === 'move_paddle') {
            player.vy = data.direction === 'up' ? -PADDLE_SPEED : PADDLE_SPEED;
        } else if (data.type === 'stop_paddle') {
            if ((data.direction === 'up' && player.vy < 0) || (data.direction === 'down' && player.vy > 0)) {
                player.vy = 0;
            }
        }
    };

    const update = (gameSession) => {
        const { gameState } = gameSession;
        if (gameState.gameOver || gameState.countdown) return;

        // Move paddles
        gameState.p1.y += gameState.p1.vy;
        gameState.p2.y += gameState.p2.vy;

        // Paddle bounds
        gameState.p1.y = Math.max(0, Math.min(gameState.p1.y, GAME_HEIGHT - PADDLE_HEIGHT));
        gameState.p2.y = Math.max(0, Math.min(gameState.p2.y, GAME_HEIGHT - PADDLE_HEIGHT));
        
        // Move ball
        gameState.ball.x += gameState.ball.vx;
        gameState.ball.y += gameState.ball.vy;

        // Ball collision with top/bottom walls
        if (gameState.ball.y <= 0 || gameState.ball.y >= GAME_HEIGHT - BALL_SIZE) {
            gameState.ball.vy *= -1;
        }
        
        // Ball collision with paddles
        const p1_x = PADDLE_X_OFFSET;
        const p2_x = GAME_WIDTH - PADDLE_X_OFFSET - PADDLE_WIDTH;

        if (gameState.ball.vx < 0 && 
            gameState.ball.x < p1_x + PADDLE_WIDTH && 
            gameState.ball.x > p1_x &&
            gameState.ball.y > gameState.p1.y && 
            gameState.ball.y < gameState.p1.y + PADDLE_HEIGHT) {
                gameState.ball.vx *= -1.05; // Increase speed
                let deltaY = gameState.ball.y - (gameState.p1.y + PADDLE_HEIGHT / 2);
                gameState.ball.vy = deltaY * 0.2;
        }

        if (gameState.ball.vx > 0 &&
            gameState.ball.x > p2_x - BALL_SIZE &&
            gameState.ball.x < p2_x + PADDLE_WIDTH - BALL_SIZE &&
            gameState.ball.y > gameState.p2.y &&
            gameState.ball.y < gameState.p2.y + PADDLE_HEIGHT) {
                gameState.ball.vx *= -1.05; // Increase speed
                let deltaY = gameState.ball.y - (gameState.p2.y + PADDLE_HEIGHT / 2);
                gameState.ball.vy = deltaY * 0.2;
        }

        // Scoring
        let scored = false;
        if (gameState.ball.x < 0) {
            gameState.p2.score++;
            scored = true;
        } else if (gameState.ball.x > GAME_WIDTH) {
            gameState.p1.score++;
            scored = true;
        }
        
        if (scored) {
            if (gameState.p1.score >= WINNING_SCORE || gameState.p2.score >= WINNING_SCORE) {
                 if (gameState.p1.score > gameState.p2.score) gameState.p1.roundsWon++;
                 else gameState.p2.roundsWon++;
                 
                 if (gameState.p1.roundsWon >= WINNING_ROUNDS || gameState.p2.roundsWon >= WINNING_ROUNDS) {
                     gameState.gameOver = true;
                     gameState.winnerId = gameState.p1.roundsWon > gameState.p2.roundsWon ? 1 : 2;
                 } else {
                     gameState.p1.score = 0;
                     gameState.p2.score = 0;
                     gameState.countdown = 3;
                     gameState.message = `Round ${gameState.p1.roundsWon + gameState.p2.roundsWon + 1}`;
                     startCountdown(gameSession);
                 }
            } else {
                gameState.countdown = 1;
                gameState.message = "Score!";
                startCountdown(gameSession);
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
                x: PADDLE_X_OFFSET,
                y: you.y,
                score: you.score,
                roundsWon: you.roundsWon,
                nickname: you.nickname,
            },
            opponent: {
                x: PADDLE_X_OFFSET,
                y: opponent.y,
                score: opponent.score,
                roundsWon: opponent.roundsWon,
                nickname: opponent.nickname
            },
            ball: gameState.ball,
            message: gameState.countdown || gameState.message,
            gameOver: gameState.gameOver,
        };
    };

    return { init, start, handleInput, update, getStateForPlayer };
};

module.exports = createNeonPongEngine;
