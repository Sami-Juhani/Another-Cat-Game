import Player from "./player.js";
import InputHandler from "./input.js";
import UI from "./ui.js";
import { Ground, Water } from "./ground.js";
import { Background } from "./background.js";
import { Box } from "./obstacles.js";
import { GroundEnemy, FlyingEnemy } from "./enemies.js";
import { Splash } from "./particles.js";

window.addEventListener("load", function () {
  const canvas = this.document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");
  canvas.width = 2000;
  canvas.height = 516;

  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && game.gameOver) game.restart();
  });

  this.document.getElementById("music-button").addEventListener("click", (e) => {
    if (!game.backgroundMusicOn) {
    game.backgroundMusic.play();
    game.backgroundMusicOn = true;
    } else {
      game.backgroundMusic.pause();
      game.backgroundMusicOn = false;
    }
    e.target.blur();
  });
  
  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.speed = 0;
      this.maxSpeed = 10;
      this.groundTileWidth = 94 * 0.4;
      this.groundMargin = this.groundTileWidth;
      this.upperMargin = 200;
      this.debug = false;
      this.gameOver = false;
      this.backgrounds = new Background(this);
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.boxWidth = 492 * 0.1;
      this.waterTileProbability = 1;
      this.boxes = [];
      this.groundTiles = [];
      this.waterTiles = [];
      this.enemies = [];
      this.particles = [];
      this.randomPwrUps = []
      this.powerUps = [];
      this.sounds = [];
      this.boxTimer = 0;
      this.boxInterval = 1500;
      this.groundEnemyTimer = 0;
      this.groundEnemyIntervalMin = 3500;
      this.groundEnemyIntervalMax = 4500;
      this.groundEnemyInterval = this.groundEnemyIntervalMin + Math.random() * this.groundEnemyIntervalMax;
      this.flyingEnemyTimer = 0;
      this.flyingEnemyIntervalMin = 4000;
      this.flyingEnemyIntervalMax = 5500;
      this.flyingEnemyInterval = this.flyingEnemyIntervalMin + Math.random() * this.flyingEnemyIntervalMax;
      this.player.currentState = this.player.states[0];
      this.player.currentState.enter();
      this.backgroundMusic = new Audio();
      this.backgroundMusic.src = "./src/sounds/Background/roa-memories.mp3";
      this.backgroundMusic.loop = true;
      this.backgroundMusic.autoplay = true;
      this.backgroundMusicOn = true;
      this.backgroundMusic.volume = 0.3;
      this.backgroundMusic.muted = true;
      this.gameOverSound = new Audio();
      this.gameOverSound.src = "./src/sounds/GameOver/gameover.wav";
      this.gameOverSound.volume = 0.3;
    }
    update(deltaTime) {
      this.player.update(deltaTime, this.input.keys);
      // Add Obstacle
      if (this.boxTimer > this.boxInterval) {
        this.addBoxes();
        this.boxTimer = 0;
      }
      if (this.player.isCenter() && this.speed > 0) this.boxTimer += deltaTime;
      // Add Enemies
      this.addEnemy(deltaTime);
      // Update boxes
      // Update boxes
      this.boxes.forEach((obstacle) => {
        obstacle.update(this.input.keys);
      });
      // Update groundTiles
      this.groundTiles.forEach((groundTile) => {
        groundTile.update(this.input.keys);
      });
      this.waterTiles.forEach((waterTile) => {
        waterTile.update(this.input.keys);
      });
      this.enemies.forEach((enemy) => {
        enemy.update(deltaTime);
      });
      this.particles.forEach((particle) => {
        particle.update(deltaTime);
      });
      this.powerUps.forEach((powerUp) => {
        powerUp.update(this.input.keys);
    });
      // Filter
      this.boxes = this.boxes.filter((box) => !box.markedForDeletion);
      this.enemies = this.enemies.filter((enemy) => !enemy.markedForDeletion);
      this.particles = this.particles.filter((particle) => !particle.markedForDeletion);
      this.powerUps = this.powerUps.filter((powerUp) => !powerUp.markedForDeletion);
      this.sounds = this.sounds.filter((sound) => !sound.ended);
      this.filterAndAddGround(); // delete and add new groundtiles
    }
    draw(context, deltaTime) {
      // Draw all elements on canvas
      this.powerUps.forEach((powerUp) => {
           powerUp.draw(context);
      });
      this.boxes.forEach((obstacle) => {
        obstacle.draw(context);
      });
      this.waterTiles.forEach((waterTile) => {
        waterTile.draw(context, deltaTime);
      });
      this.groundTiles.forEach((groundTile) => {
        groundTile.draw(context, deltaTime);
      });
      this.enemies.forEach((enemy) => {
        enemy.draw(context);
      });
      this.particles.forEach((particle) => {
        particle.draw(context);
      });
      this.ui.draw(context, deltaTime);
      this.player.draw(context);
    }

    addBoxes() {
      const coordY = this.upperMargin + Math.random() * (this.height - this.groundMargin - this.player.height - 75 - this.upperMargin);
        this.boxes.push(
          new Box(this, this.width + this.boxWidth, coordY)
        );
    }

    initialize() {
      const buttonPanel = document.getElementById("button-panel");
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const topMargin = (windowHeight - canvas.height) * 0.5;
      const leftMargin = (windowWidth - canvas.width) * 0.5;
      buttonPanel.setAttribute("position", "absolute");
      buttonPanel.style.left = `${leftMargin + 170}px`;
      buttonPanel.style.top = `${topMargin + 10}px`;
      for (let i = 0; i < this.width / this.groundTileWidth * 0.1; i++) this.groundTiles.push(new Ground(this, i * this.groundTileWidth, false));
      for (let i = 1; i < 4; i++) 
        this.waterTiles.push(new Water(this,this.groundTiles.slice(-1)[0].x + this.groundTileWidth * i));
      this.groundTiles.push(new Ground(this,this.groundTiles.slice(-1)[0].x + this.groundTileWidth * 4, true));
      for (let i = 1; i < this.width / this.groundTileWidth * 0.9; i++) this.groundTiles.push(new Ground(this, this.groundTiles.slice(-1)[0].x + this.groundTileWidth, false));
      this.boxes.push(new Box(this, 1900 + this.boxWidth, 175));
      this.boxes.push(new Box(this, 1900, 175));
      this.boxes.push(new Box(this, 1700 + this.boxWidth, this.height - this.groundMargin - this.player.height - 75));
      this.boxes.push(new Box(this, 1700, this.height - this.groundMargin - this.player.height - 75));
      this.boxes.push(new Box(this, 1500 + this.boxWidth, 175));
      this.boxes.push(new Box(this, 1500, 175));
        this.boxes.push(new Box(this, 1300, this.height - this.groundMargin - this.player.height - 75));
        this.boxes.push(new Box(this, 1100, 175));
        this.boxes.push(new Box(this, 900, 75));
        this.boxes.push(new Box(this, 700, 175));
        this.boxes.push(new Box(this, 300, this.height - this.groundMargin - this.player.height - 75));
    }

    addEnemy(deltaTime) {
      if (this.groundEnemyTimer > this.groundEnemyInterval) {
        this.enemies.push(new GroundEnemy(this));
        this.groundEnemyTimer = 0;
        this.groundEnemyInterval = this.groundEnemyIntervalMin + Math.random() * this.groundEnemyIntervalMax;
      }
      if (this.flyingEnemyTimer > this.flyingEnemyInterval) {
        this.enemies.push(new FlyingEnemy(this));
        this.flyingEnemyTimer = 0;
        this.flyingEnemyInterval = this.flyingEnemyIntervalMin + Math.random() * this.flyingEnemyIntervalMax;
      }
      this.groundEnemyTimer += deltaTime;
      this.flyingEnemyTimer += deltaTime;
    }

    filterAndAddGround() {
      this.groundTiles.forEach((tile, index) => {
        if (tile.markedForDeletion) {
          this.groundTiles.splice(index, 1);
          if (Math.random() > this.waterTileProbability) {
            for (let i = 1; i < 4; i++) {
              this.waterTiles.push(new Water(this,this.groundTiles.slice(-1)[0].x + this.groundTileWidth * i));
            }
            this.groundTiles.push(new Ground(this,this.groundTiles.slice(-1)[0].x + this.groundTileWidth * 4, true));
          } else
            this.groundTiles.push(new Ground(this,this.groundTiles.slice(-1)[0].x + this.groundTileWidth, false));
        }
      });
    }

    splashParticlesFlying() {
      return this.particles.filter(obj => obj instanceof Splash).length > 0;
    }

    restart() {
      // Reset all variables
      game.speed = 0;
      game.player.x = 0;
      game.player.y = game.height - game.player.height - game.groundMargin;
      game.player.vy = 0;
      game.player.speed = 0;
      game.player.score = 0;
      game.player.lives = 3;
      game.player.starGems = 0;
      game.player.stamina = 100;
      game.player.currentState = game.player.states[0];
      game.player.currentState.enter();
      game.boxTimer = 0;
      game.flyingEnemyTimer = 0;
      game.groundEnemyTimer = 0;
      game.waterTileProbability = 1;
      game.groundEnemyIntervalMin = 3500;
      game.groundEnemyIntervalMax = 4500;
      game.groundEnemyInterval = game.groundEnemyIntervalMin + Math.random() * game.groundEnemyIntervalMax;
      game.flyingEnemyIntervalMin = 4000;
      game.flyingEnemyIntervalMax = 5500;
      game.flyingEnemyInterval = game.flyingEnemyIntervalMin + Math.random() * game.flyingEnemyIntervalMax;
      game.gameOver = false;
      game.boxes = [];
      game.groundTiles = [];
      game.waterTiles = [];
      game.enemies = [];
      game.particles = [];
      game.powerUps = [];
      game.backgroundMusic.currentTime = 0;
      if (game.backgroundMusicOn) game.backgroundMusic.play();
      game.initialize();
      animate(0);
    }
  }

  const game = new Game(canvas.width, canvas.height);
  game.initialize();
  let lastTime = 0;

  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.backgrounds.update(game.input.keys);
    game.backgrounds.draw(ctx);
    game.draw(ctx, deltaTime);
    if (!game.gameOver || game.splashParticlesFlying()) requestAnimationFrame(animate);
  }
  animate(0);
});
