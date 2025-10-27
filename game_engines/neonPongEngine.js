const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const PADDLE_HEIGHT = 100;
const PADDLE_WIDTH = 12;
const BALL_SIZE = 12;
const PADDLE_SPEED = 6;
const INITIAL_BALL_SPEED = 5;
const MAX_BALL_SPEED = 10;
const POINTS_TO_WIN_ROUND = 3;
const ROUNDS_TO_WIN_MATCH = 2;

class NeonPongEngine {
    constructor() {
        this.players = [];
        this.ball = {};
        this.gameOver = false;
        this.winnerId = null;
        this.isDraw = false;
        this.message = '';
        this.soundEvents = [];
    }

    init(players) {
        this.players = players.map((p, index) => ({
            ...p,
            id: index + 1,
            x: index === 0 ? 10 : GAME_WIDTH - PADDLE_WIDTH - 10,
            y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2,
            width: PADDLE_WIDTH,
            height: PADDLE_HEIGHT,
            dy: 0,
            score: 0,
            roundsWon: 0,
            keys: { up: false, down: false },
            isBot: p.isBot || false,
        }));
        this.resetBall();
        this.startRoundCountdown();
    }

    startRoundCountdown(delay = 1000) {
        this.message = 'Get Ready!';
        setTimeout(() => {
            let count = 3;
            this.message = count;
            this.soundEvents.push('roundStart');
            const interval = setInterval(() => {
                count--;
                if (count > 0) {
                    this.message = count;
                    this.soundEvents.push('roundStart');
                } else {
                    this.message = '';
                    clearInterval(interval);
                    this.ball.dx = Math.random() > 0.5 ? INITIAL_BALL_SPEED : -INITIAL_BALL_SPEED;
                    this.ball.dy = (Math.random() - 0.5) * INITIAL_BALL_SPEED;
                }
            }, 1000);
        }, delay);
    }
    
    resetBall(direction = 1) {
        this.ball = {
            x: GAME_WIDTH / 2 - BALL_SIZE / 2,
            y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
            width: BALL_SIZE,
            height: BALL_SIZE,
            dx: 0, // No movement until countdown ends
            dy: 0,
            speed: INITIAL_BALL_SPEED,
        };
    }

    handleInput(playerId, data) {
        const player = this.players.find(p => p.id === playerId);
        if (!player) return;

        if (data.type === 'move_paddle') {
            player.keys[data.direction] = true;
        } else if (data.type === 'stop_paddle') {
            player.keys[data.direction] = false;
        }
    }

    update() {
        if (this.gameOver) return;
        
        // Move paddles
        this.players.forEach(player => {
             if (player.isBot) {
                this.handleBotInput(player);
            } else {
                if (player.keys.up) player.dy = -PADDLE_SPEED;
                else if (player.keys.down) player.dy = PADDLE_SPEED;
                else player.dy = 0;
            }

            player.y += player.dy;

            // Wall collision for paddles
            if (player.y < 0) player.y = 0;
            if (player.y > GAME_HEIGHT - PADDLE_HEIGHT) player.y = GAME_HEIGHT - PADDLE_HEIGHT;
        });

        // Move ball
        if (this.ball.dx === 0 && this.ball.dy === 0) return; // Ball is not active
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Ball wall collision (top/bottom)
        if (this.ball.y <= 0 || this.ball.y >= GAME_HEIGHT - BALL_SIZE) {
            this.ball.dy *= -1;
            this.soundEvents.push('wallHit');
        }

        // Ball paddle collision
        this.players.forEach(player => {
            if (this.isColliding(this.ball, player)) {
                this.ball.dx *= -1;

                // Increase speed
                this.ball.speed = Math.min(MAX_BALL_SPEED, this.ball.speed * 1.1);
                
                // Adjust angle based on where it hit the paddle
                const paddleCenter = player.y + PADDLE_HEIGHT / 2;
                const hitPos = (this.ball.y + BALL_SIZE / 2) - paddleCenter;
                this.ball.dy = hitPos * 0.1;
                
                 // Apply new speed
                const magnitude = Math.sqrt(this.ball.dx ** 2 + this.ball.dy ** 2);
                this.ball.dx = (this.ball.dx / magnitude) * this.ball.speed;
                this.ball.dy = (this.ball.dy / magnitude) * this.ball.speed;
                
                this.soundEvents.push('paddleHit');
            }
        });

        // Scoring
        if (this.ball.x < 0) {
            this.handleScore(this.players[1]);
        } else if (this.ball.x > GAME_WIDTH) {
            this.handleScore(this.players[0]);
        }
    }
    
    handleBotInput(bot) {
        // Simple AI: Track the ball's y position
        const paddleCenter = bot.y + PADDLE_HEIGHT / 2;
        const ballCenter = this.ball.y + BALL_SIZE / 2;
        const errorMargin = 5; 

        if (paddleCenter < ballCenter - errorMargin) {
            bot.dy = PADDLE_SPEED * 0.8; // Move slightly slower than a player
        } else if (paddleCenter > ballCenter + errorMargin) {
            bot.dy = -PADDLE_SPEED * 0.8;
        } else {
            bot.dy = 0;
        }
    }

    handleScore(scoringPlayer) {
        scoringPlayer.score++;
        this.soundEvents.push('score');
        
        if (scoringPlayer.score >= POINTS_TO_WIN_ROUND) {
            scoringPlayer.roundsWon++;
            this.message = `${scoringPlayer.nickname} wins the round!`;
            
            if (scoringPlayer.roundsWon >= ROUNDS_TO_WIN_MATCH) {
                this.endGame(scoringPlayer.id);
            } else {
                this.players.forEach(p => p.score = 0);
                this.resetBall();
                this.startRoundCountdown(2000);
            }
        } else {
            this.resetBall(scoringPlayer.id === 1 ? -1 : 1);
            this.startRoundCountdown(2000);
        }
    }
    
    endGame(winnerId) {
        this.gameOver = true;
        this.winnerId = winnerId;
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
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
        
        return {
            you: {
                id: player.id,
                x: player.x,
                y: player.y,
                score: player.score,
                roundsWon: player.roundsWon,
                nickname: player.nickname,
            },
            opponent: {
                id: opponent.id,
                x: opponent.x,
                y: opponent.y,
                score: opponent.score,
                roundsWon: opponent.roundsWon,
                nickname: opponent.nickname,
            },
            ball: {
                x: this.ball.x,
                y: this.ball.y
            },
            message: this.message,
            gameOver: this.gameOver,
            winnerId: this.winnerId,
            soundEvents: [...this.soundEvents],
        };
    }
}

module.exports = NeonPongEngine;
