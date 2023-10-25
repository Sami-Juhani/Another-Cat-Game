import {
  Standing,
  Sitting,
  Running,
  Jumping,
  Falling,
  GetHit,
  Attack,
  Rolling,
  Dead,
  Ultimate,
} from "./states.js";

import { Splash } from "./particles.js";
import { GroundExplosion, AirExplosion } from "./particles.js";
import { Health, Star } from "./powerups.js";

export default class Player {
  constructor(game) {
    this.game = game;
    this.image = document.getElementById("player");
    this.spriteWidth = 1284;
    this.spriteHeight = 951;
    this.width = this.spriteWidth * 0.1;
    this.height = this.spriteHeight * 0.1;
    this.x = 0;
    this.y = this.game.height - this.height - this.game.groundMargin;
    this.vy = 0;
    this.gravity = 1;
    this.frameX = 0;
    this.frameY = 0;
    this.maxFrame = 19;
    this.speed = 0;
    this.maxSpeed = 5;
    this.lives = 3;
    this.starGems = 0;
    this.maxLives = 9;
    this.score = 0;
    this.scoreLimit = 1;
    this.stamina = 100;
    this.staminaAttackDec = 20;
    this.staminaRollDec = 33;
    this.reGenRate = 0.1;
    this.invulnerabilityTimer = 0;
    this.idleTimer = 0;
    this.earthQuake = false;
    this.earthQuakeTimer = 0;
    this.ultimate = false;
    this.ultimateParticle = true;
    this.ultimateTimer = 0;
    this.ultimateDepletionCounter = 0;
    this.ultimateParticleInterval = 3;
    this.attackSound = new Audio("./src/sounds/Attack/attack.wav");
    this.getHitSound = new Audio("./src/sounds/Hit/cat-hit.wav");
    this.dropInWaterSound = new Audio("./src/sounds/Fail/drop-in-water.wav");
    this.dropInWaterSound.volume = 0.3;
    this.runningSound = new Audio("./src/sounds/Footsteps/running-on-grass.wav");
    this.runningSound.muted = true;
    this.runningSound2 = new Audio("./src/sounds/Footsteps/running-on-grass.wav");
    this.runningSound2.muted = true;
    this.ignoreTimeUpdate = false;
    // Using evenlisteners to loop the running sound
    this.runningSound.addEventListener("timeupdate", () => {
      if (!this.ignoreTimeUpdate && this.runningSound.currentTime > this.runningSound.duration - 0.5) {
        this.ignoreTimeUpdate = true;
        this.runningSound2.play();
        this.runningSound.currentTime = 0;
      } else {
        this.ignoreTimeUpdate = false;
      }
    });
    this.runningSound2.addEventListener("timeupdate", () => {
      if (!this.ignoreTimeUpdate && this.runningSound2.currentTime > this.runningSound2.duration - 0.5 ) {
        this.ignoreTimeUpdate = true;
        this.runningSound.play();
        this.runningSound2.currentTime = 0;
      } else {
        this.ignoreTimeUpdate = false;
      }
    });
    this.randomPrwUps = ["health", "star"];
    this.fps = 30;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
    this.states = [
      new Standing(this.game),
      new Sitting(this.game),
      new Running(this.game),
      new Jumping(this.game),
      new Falling(this.game),
      new GetHit(this.game),
      new Attack(this.game),
      new Rolling(this.game),
      new Dead(this.game),
      new Ultimate(this.game),
    ];
    this.currentState = null;
    this.lastState = null;
  }
  update(deltaTime, input) {
    // Collision checks
    this.checkBoxCollision(this.game.boxes);
    this.checkEnemyCollision(this.game.enemies, deltaTime);
    this.checkPowerUpCollision(this.game.powerUps, deltaTime);
    // Utilities
    if (this.invulnerabilityTimer > 0 && this.invulnerabilityTimer < 1000)
      this.invulnerabilityTimer += deltaTime;
    else this.invulnerabilityTimer = 0;
    if (input.length === 0) this.idleTimer += deltaTime;
    else this.idleTimer = 0;
    if (this.idleTimer > 10000) {
      this.setState(1, 0);
      this.idleTimer = 0;
    }
    this.currentState.handleInput(input, deltaTime);
    // Horizontal movement
    this.x += this.speed;
    if (
      input.includes("ArrowRight") &&
      this.currentState !== this.states[1] &&
      this.currentState !== this.states[5] &&
      this.currentState !== this.states[7] &&
      this.currentState !== this.states[8]
    )
      this.speed = this.maxSpeed;
    else if (
      input.includes("ArrowLeft") &&
      this.currentState !== this.states[1] &&
      this.currentState !== this.states[5] &&
      this.currentState !== this.states[7] &&
      this.currentState !== this.states[8]
    )
      this.speed = -this.maxSpeed;
    else this.speed = 0;
    // Horizontal boundaries
    if (this.x < 0) this.x = 0;
    if (this.x > (this.game.width - this.game.player.width) / 2)
      this.x = (this.game.width - this.game.player.width) / 2;
    // Vertical movement
    if (
      this.vy > 0 &&
      this.currentState !== this.states[6] &&
      this.currentState !== this.states[7] &&
      this.currentState !== this.states[8] &&
      this.currentState !== this.states[9] &&
      this.game.input.keys.includes("ArrowRight") &&
      !this.game.gameOver
    )
      this.setState(4, 0.5);
    else if (
      this.vy > 0 &&
      this.currentState !== this.states[6] &&
      this.currentState !== this.states[7] &&
      this.currentState !== this.states[8] &&
      this.currentState !== this.states[9] &&
      !this.game.gameOver
    )
      this.setState(4, 0);
    this.vy += this.gravity;
    this.y += this.vy;
    this.checkGroundCollision(this.game.groundTiles);
    this.checkForFallingOffScreen();
    this.activateEarthQuake(deltaTime);
    this.activeUltimateTimer(deltaTime);
    // FPS cap and sprite animation
    this.frameInterval = 1000 / this.fps;
    if (this.frameTimer > this.frameInterval) {
      if (this.frameX < this.maxFrame) {
        this.frameX++;
        this.frameTimer = 0;
      } else {
        this.frameX = 0;
      }
    }
    if (this.stamina < 100) this.stamina += this.reGenRate;
    if (this.stamina > 100) this.stamina = 100;
    if (this.stamina < 0) this.stamina = 0;
    this.frameTimer += deltaTime;
  }
  draw(context) {
    if (this.game.debug) {
      // Player hitbox
      context.strokeRect(
        this.x + 40,
        this.y + 30,
        this.width - 85,
        this.height - 30
      );
      // Paw hitbox
      context.strokeRect(
        this.x + this.width - 45,
        this.y + 30,
        40,
        this.height - 30
      );
    }
    context.drawImage(
      this.image,
      this.spriteWidth * this.frameX,
      this.spriteHeight * this.frameY,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
  setState(state, speed) {
    this.game.speed = speed * this.game.maxSpeed;
    this.currentState = this.states[state];
    this.currentState.enter();
  }
  isCenter() {
    return (
      this.game.player.x === (this.game.width - this.game.player.width) / 2
    );
  }
  isOnGrass() {
    return this.y === this.game.height - this.height - this.game.groundMargin;
  }
  activateEarthQuake(deltaTime) {
    if (this.earthQuakeTimer < 1000 && this.earthQuakeTimer > 0) {
      this.earthQuake = true;
      this.earthQuakeTimer += deltaTime;
    } else {
      this.earthQuake = false;
      this.earthQuakeTimer = 0;
    }
  }
  activeUltimateTimer(deltaTime) {
    if (this.ultimateTimer > 0 && this.ultimateTimer < 10000 && this.ultimate) {
      this.ultimateTimer += deltaTime;
      if (this.ultimateTimer > 8000) {
        this.ultimateParticle = false;
        if (this.ultimateDepletionCounter < this.ultimateParticleInterval) {
          this.ultimateDepletionCounter += deltaTime;
        } else {
          this.ultimateParticle = true;
          this.ultimateParticleInterval *= 1.1;
          this.ultimateDepletionCounter = 0;
        }
      }
    } else {
      this.ultimateTimer = 0;
      this.ultimateDepletionCounter = 0;
      this.ultimateParticleInterval = 3;
      this.ultimate = false;
      this.ultimateParticle = true;
    }
  }
  checkGroundCollision(groundtiles) {
    groundtiles.every((tile) => {
      const playerTop = this.y;
      const playerBottom = playerTop + this.height;
      const playerLeft = this.x + 40;
      const playerRight = playerLeft + this.width - 85;
      const tileTop = tile.y;
      const tileBottom = tile.y + tile.height;
      const tileLeft = tile.x;
      const tileRight = tile.x + tile.width;
      // Collision with tile
      if (
        playerLeft <= tileRight &&
        playerRight >= tileLeft &&
        playerBottom >= tileTop &&
        playerTop <= tileBottom
      ) {
        // Left of tile
        if (
          playerRight >= tileLeft &&
          playerRight <= tileRight &&
          playerTop > tileTop
        ) {
          this.x = tileLeft - this.width + 45;
          this.onGround = false;
          return false;
        }
        // Right of tile
        if (
          playerLeft <= tileRight &&
          playerLeft >= tileLeft &&
          playerTop > tileTop
        ) {
          this.x = tileRight - 44;
          this.onGround = false;
          return false;
        }
        // Top of tile
        if (playerBottom > tileTop && playerBottom < tileBottom + 20) {
          this.gravity = 0;
          this.vy = 0;
          this.y = tileTop - this.height;
          this.onGround = true;
          return false;
        }
      } else if (
        playerRight < tileLeft ||
        playerLeft > tileRight ||
        playerBottom < tileTop ||
        playerTop > tileBottom
      ) {
        this.gravity = 1;
        this.onGround = false;
        return true;
      }
    });
  }
  checkForFallingOffScreen() {
    if (this.y > this.game.height - this.game.groundMargin && !this.game.gameOver) {
      this.game.sounds.push(new Audio("./src/sounds/Fail/drop-in-water.wav"));
    this.game.sounds[this.game.sounds.length - 1].volume = 0.3;
    this.game.sounds[this.game.sounds.length - 1].play();
    this.markedForDeletion = true;
    for (let i = 0; i < 50; i++)
    this.game.particles.unshift(
      new Splash(
        this.game,
        this.x + this.width * 0.5,
        this.game.height - this.game.groundMargin
      )
    );
    this.game.backgroundMusic.pause();
    this.game.gameOverSound.play();
    this.game.speed = 0;
    this.lives -= this.lives;
    this.runningSoundOff();
    this.game.gameOver = true;
    }
  }
  checkBoxCollision(boxes) {
    boxes.every((box) => {
      const playerTop = this.y;
      const playerBottom = playerTop + this.height;
      const playerLeft = this.x + 40;
      const playerRight = playerLeft + this.width - 85;
      const boxTop = box.y;
      const boxBottom = box.y + box.height;
      const boxLeft = box.x;
      const boxRight = box.x + box.width;
      // Collision with box
      if (
        playerLeft <= boxRight &&
        playerRight >= boxLeft &&
        playerBottom >= boxTop &&
        playerTop <= boxBottom
      ) {
        // Bottom of box
        if (
          playerTop <= boxBottom &&
          playerBottom > boxBottom &&
          this.game.height - this.game.groundMargin - boxBottom >=
            this.height - 30
        ) {
          this.y = boxBottom;
          this.vy = 0;
          this.onGround = false;
          // Add new power up from mystery box to game
          if (box.mysteryBox) {
            box.mysteryBox = false;
            box.image = document.getElementById("mystery-box-opened");
            const randomPwrUp =
              this.randomPrwUps[
                Math.floor(Math.random() * this.randomPrwUps.length)
              ];
            if (randomPwrUp === "health")
              this.game.powerUps.unshift(
                new Health(this.game, box.x + 2, boxTop)
              );
            else if (randomPwrUp === "star")
              this.game.powerUps.unshift(
                new Star(this.game, box.x + 2, boxTop)
              );
          }
          return false;
        }
        // Left of box
        if (
          playerRight >= boxLeft &&
          playerRight <= boxRight &&
          playerTop > boxTop
        ) {
          this.x = boxLeft - this.width + 45;
          this.onGround = false;
          return false;
        }
        // Right of box
        if (
          playerLeft <= boxRight &&
          playerLeft >= boxLeft &&
          playerTop > boxTop
        ) {
          this.x = boxRight - 44;
          this.onGround = false;
          return false;
        }
        // Top of box
        if (
          playerBottom > boxTop &&
          playerTop < boxTop &&
          (playerLeft >= boxLeft || playerRight <= boxRight) &&
          this.currentState != this.states[3]
        ) {
          this.gravity = 0;
          this.vy = 0;
          this.y = boxTop - this.height;
          this.onGround = true;
          return false;
        }
      } else if (
        playerRight < boxLeft ||
        playerLeft > boxRight ||
        playerBottom < boxTop ||
        playerTop > boxBottom
      ) {
        return true;
      }
    });
  }
  checkEnemyCollision(enemies, deltaTime) {
    enemies.forEach((enemy) => {
      const playerTop = this.y + 30;
      const playerBottom = playerTop + this.height - 30;
      const playerLeft = this.x + 40;
      const playerRight = playerLeft + this.width - 85;
      const PawLeft = playerRight;
      const PawRight = playerRight + 40;
      const enemyTop = enemy.y;
      const enemyBottom = enemy.y + enemy.height;
      const enemyLeft = enemy.x;
      const enemyRight = enemy.x + enemy.width;
      if (
        playerLeft < enemyRight &&
        playerRight > enemyLeft &&
        playerTop < enemyBottom &&
        playerBottom > enemyTop &&
        this.invulnerabilityTimer === 0 &&
        enemy.invulnerabilityTimer == 0
      ) {
        if (
          this.currentState === this.states[7] ||
          this.currentState === this.states[9]
        ) {
          enemy.markedForDeletion = true;
          this.game.groundEnemyIntervalMin -= 10;
          this.game.groundEnemyIntervalMax -= 10;
          this.game.flyingEnemyIntervalMin -= 10;
          this.game.flyingEnemyIntervalMax -= 10;
          this.game.waterTileProbability -= 0.005;
          this.score++;
          if (enemyBottom >= this.game.height - this.game.groundMargin)
            this.game.particles.push(
              new GroundExplosion(
                this.game,
                enemy.x,
                this.game.height - this.game.groundMargin
              )
            );
          else
            this.game.particles.push(
              new AirExplosion(this.game, enemy.x, enemy.y + enemy.height)
            );
        } else {
          this.setState(5, 0);
          this.lives--;
          this.vy = -5;
          this.invulnerabilityTimer += deltaTime;
          if (this.lives <= 0) {
            this.game.backgroundMusic.pause();
            this.game.gameOverSound.play();
            this.setState(8, 0);
          }
        }
      }
      if (
        enemyLeft < PawRight &&
        enemyRight > PawLeft &&
        enemyTop < playerBottom &&
        enemyBottom > playerTop &&
        this.currentState === this.states[6] &&
        this.frameX <= 11 &&
        this.frameX >= 9 &&
        enemy.invulnerabilityTimer === 0
      ) {
        enemy.setState(1);
        enemy.speedX *= -1;
        enemy.lives--;
        enemy.invulnerabilityTimer += deltaTime;
        if (enemy.lives <= 0) {
          enemy.markedForDeletion = true;
          this.game.groundEnemyIntervalMin -= 10;
          this.game.groundEnemyIntervalMax -= 10;
          this.game.flyingEnemyIntervalMin -= 10;
          this.game.flyingEnemyIntervalMax -= 10;
          this.game.waterTileProbability -= 0.005;
          this.score++;
          if (enemyBottom >= this.game.height - this.game.groundMargin)
            this.game.particles.push(
              new GroundExplosion(
                this.game,
                enemy.x,
                this.game.height - this.game.groundMargin
              )
            );
          else
            this.game.particles.push(
              new AirExplosion(this.game, enemy.x, enemy.y + enemy.height)
            );
        }
      }
    });
  }
  checkPowerUpCollision(powerUps, deltaTime) {
    powerUps.forEach((powerUp) => {
      const playerTop = this.y;
      const playerBottom = playerTop + this.height;
      const playerLeft = this.x + 40;
      const playerRight = playerLeft + this.width - 85;
      const powerUpTop = powerUp.y;
      const powerUpBottom = powerUp.y + powerUp.height;
      const powerUpLeft = powerUp.x;
      const powerUpRight = powerUp.x + powerUp.width;
      if (
        playerLeft < powerUpRight &&
        playerRight > powerUpLeft &&
        playerTop < powerUpBottom &&
        playerBottom > powerUpTop
      ) {
        if (powerUp.type === "health" && this.lives < 9) {
          powerUp.sound.play();
          this.lives++;
          powerUp.markedForDeletion = true;
        } else if (powerUp.type === "star" && this.starGems < 3) {
          powerUp.sound.play();
          this.starGems++;
          if (this.starGems > 2) {
            this.setState(9, 0.5);
            this.starGems = 0;
            this.ultimate = true;
            this.ultimateTimer += deltaTime;
          }
          powerUp.markedForDeletion = true;
        }
      }
    });
  }
  runningSoundOn() {
      if (this.isOnGrass()){
      this.runningSound.play();
      this.runningSound.muted = false;
      this.runningSound2.muted = false;
      }
  }
  runningSoundOff() {
      this.runningSound.muted = true;
      this.runningSound2.muted = true;
      this.runningSound.currentTime = 0;
      this.runningSound2.currentTime = 0;
  }
}
