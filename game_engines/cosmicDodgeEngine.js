const ARENA_WIDTH = 350;
const ARENA_HEIGHT = 450;
const SHIP_SIZE = 20;
const SHIP_SPEED = 4;
const ROUNDS_TO_WIN_MATCH = 3;

class CosmicDodgeEngine {
    constructor() {
        this.players = [];
        this.projectiles = [];
        this.nextProjectileId = 0;
        this.gameOver = false;
        this.winnerId = null;
        this.isDraw = false;
        this.countdown = null;
        this.message = '';
        this.gameTime = 0;
        this.spawnTimer = 0;
        this.soundEvents = [];
    }

    init(players) {
        this.players = players.map((p, index) => ({
            ...p,
            id: index + 1,
            ship: {
                x: ARENA_WIDTH / 2 - SHIP_SIZE / 2,
                y: ARENA_HEIGHT - SHIP_SIZE - 20,
                alive: true,
            },
            keys: { w: false, a: false, s: false, d: false },
            roundsWon: 0,
            explosions: [],
             isBot: p.isBot || false,
        }));
        this.startRound();
    }
    
    startRound() {
        this.gameTime = 0;
        this.spawnTimer = 0;
        this.projectiles = [];
        this.players.forEach(p => {
            p.ship.x = ARENA_WIDTH / 2 - SHIP_SIZE / 2;
            p.ship.y = ARENA_HEIGHT - SHIP_SIZE - 20;
            p.ship.alive = true;
            p.explosions = [];
        });
        
        this.message = '';
        this.countdown = 3;
        this.soundEvents.push('roundStart');
        const interval = setInterval(() => {
            this.countdown--;
             if (this.countdown > 0) {
                this.soundEvents.push('roundStart');
             }
            if (this.countdown <= 0) {
                this.countdown = null;
                clearInterval(interval);
            }
        }, 1000);
    }

    handleInput(playerId, data) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            if (data.type === 'keydown') player.keys[data.key] = true;
            if (data.type === 'keyup') player.keys[data.key] = false;
        }
    }

    update() {
        if (this.gameOver || this.countdown) return;

        this.gameTime++;
        this.spawnTimer++;
        
        // --- Move Ships ---
        this.players.forEach(player => {
            if (!player.ship.alive) return;
            
             if (player.isBot) {
                this.handleBotInput(player);
            }

            if (player.keys.w) player.ship.y -= SHIP_SPEED;
            if (player.keys.s) player.ship.y += SHIP_SPEED;
            if (player.keys.a) player.ship.x -= SHIP_SPEED;
            if (player.keys.d) player.ship.x += SHIP_SPEED;

            // Boundary checks
            player.ship.x = Math.max(0, Math.min(ARENA_WIDTH - SHIP_SIZE, player.ship.x));
            player.ship.y = Math.max(0, Math.min(ARENA_HEIGHT - SHIP_SIZE, player.ship.y));
            
             // Update explosions
            player.explosions = player.explosions.filter(exp => {
                exp.life--;
                exp.size += 0.5;
                return exp.life > 0;
            });
        });

        // --- Spawn Projectiles ---
        this.spawnProjectiles();

        // --- Move Projectiles & Check Collisions ---
        this.projectiles.forEach(p => {
            p.x += p.dx;
            p.y += p.dy;
        });
        
        this.projectiles = this.projectiles.filter(p => p.x > -50 && p.x < ARENA_WIDTH + 50 && p.y > -50 && p.y < ARENA_HEIGHT + 50);

        this.players.forEach(player => {
            if (player.ship.alive) {
                for (const proj of this.projectiles) {
                    if (this.isColliding(player.ship, proj)) {
                        player.ship.alive = false;
                        this.createExplosion(player, player.ship.x, player.ship.y);
                        this.soundEvents.push('explosion');
                        break;
                    }
                }
            }
        });
        
        // --- Check for Round End ---
        const alivePlayers = this.players.filter(p => p.ship.alive);
        if (alivePlayers.length <= 1) {
            this.endRound(alivePlayers[0] || null);
        }
    }
    
    handleBotInput(bot) {
        if (!bot.ship.alive || this.projectiles.length === 0) return;

        // Simple AI: find nearest projectile and move away from it
        let nearestProj = null;
        let minDistance = Infinity;

        for (const proj of this.projectiles) {
            const dx = proj.x - bot.ship.x;
            const dy = proj.y - bot.ship.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDistance) {
                minDistance = dist;
                nearestProj = proj;
            }
        }
        
        bot.keys = { w: false, a: false, s: false, d: false }; // Reset keys

        if (nearestProj && minDistance < 100) { // Only react if close
            const dodgeSpeed = SHIP_SPEED * 0.9;
             if (bot.ship.x < nearestProj.x) {
                bot.ship.x -= dodgeSpeed;
            } else {
                bot.ship.x += dodgeSpeed;
            }
             if (bot.ship.y < nearestProj.y) {
                bot.ship.y -= dodgeSpeed;
            } else {
                bot.ship.y += dodgeSpeed;
            }
        }
    }

    spawnProjectiles() {
        // Spawn patterns based on game time
        if (this.spawnTimer % 60 === 0) { // Asteroid from top
            this.projectiles.push({
                id: this.nextProjectileId++, type: 'asteroid',
                x: Math.random() * ARENA_WIDTH, y: -20,
                dx: (Math.random() - 0.5) * 2, dy: 2 + (this.gameTime / 300),
                size: Math.random() * 15 + 10,
            });
        }
        if (this.gameTime > 300 && this.spawnTimer % 120 === 0) { // Laser from side
            const fromLeft = Math.random() > 0.5;
            this.projectiles.push({
                id: this.nextProjectileId++, type: 'laser',
                x: fromLeft ? -50 : ARENA_WIDTH, y: Math.random() * (ARENA_HEIGHT - 100),
                dx: (fromLeft ? 4 : -4) + (this.gameTime / 500) * (fromLeft ? 1 : -1), dy: 0,
                size: 50, rotation: 0,
            });
        }
    }
    
    createExplosion(player, x, y) {
        for(let i=0; i<15; i++) {
             player.explosions.push({
                 id: Math.random(),
                 x: x + (Math.random() - 0.5) * 20,
                 y: y + (Math.random() - 0.5) * 20,
                 size: Math.random() * 10 + 5,
                 life: 30
             });
        }
    }

    isColliding(ship, projectile) {
        return ship.x < projectile.x + projectile.size &&
               ship.x + SHIP_SIZE > projectile.x &&
               ship.y < projectile.y + projectile.size &&
               ship.y + SHIP_SIZE > projectile.y;
    }

    endRound(winner) {
        if (winner) {
            winner.roundsWon++;
            this.message = `${winner.nickname} wins the round!`;
            this.soundEvents.push('roundWin');
            if (winner.roundsWon >= ROUNDS_TO_WIN_MATCH) {
                this.endGame(winner.id);
            } else {
                setTimeout(() => this.startRound(), 3000);
            }
        } else { // Draw
            this.message = "Round Draw!";
            this.soundEvents.push('draw');
            setTimeout(() => this.startRound(), 3000);
        }
    }
    
    endGame(winnerId) {
        this.gameOver = true;
        this.winnerId = winnerId;
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
                ship: player.ship,
                roundsWon: player.roundsWon,
                nickname: player.nickname,
                explosions: player.explosions,
            },
            opponent: {
                ship: opponent.ship,
                roundsWon: opponent.roundsWon,
                nickname: opponent.nickname,
                 explosions: opponent.explosions,
            },
            projectiles: this.projectiles,
            countdown: this.countdown,
            message: this.message,
            gameOver: this.gameOver,
            winnerId: this.winnerId,
            soundEvents: [...this.soundEvents],
        };
    }
}

module.exports = CosmicDodgeEngine;
