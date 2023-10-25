import { Splash } from "./particles.js";
import { Walking, GetHit } from "./enemystates.js";

class Enemy {
  constructor(game) {
    this.game = game;
    this.frameX = 0;
    this.fps = 30;
    this.invulnerabilityTimer = 0;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
    this.markedForDeletion = false;
  }
  update(deltaTime) {
    // movement
    if (this.game.player.isCenter() && this.game.speed > 0) {
      this.x -= this.speedX + this.game.speed;
      this.y += this.speedY;
    } else {
      this.x -= this.speedX;
      this.y += this.speedY;
    }
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      if (this.frameX < this.maxFrame) this.frameX++;
      else this.frameX = 0;
    } else {
      this.frameTimer += deltaTime;
    }
    if (this.invulnerabilityTimer > 0 && this.invulnerabilityTimer < 500)
      this.invulnerabilityTimer += deltaTime;
    else this.invulnerabilityTimer = 0;
    // check if off screen
    if (this.x + this.width < 0) this.markedForDeletion = true;
  }
  draw(context) {
    if (this.game.debug)
      context.strokeRect(this.x, this.y, this.width, this.height);
    context.drawImage(
      this.currentState.images[this.frameX],
      0,
      0,
      this.currentState.spriteWidth,
      this.currentState.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
  setState(state) {
    this.currentState = this.states[state];
    this.currentState.enter();
  }
  checkBoxCollision(boxes) {
    boxes.every((box) => {
      const enemyTop = this.y;
      const enemyBottom = this.y + this.height;
      const enemyLeft = this.x;
      const enemyRight = this.x + this.width;
      const boxTop = box.y;
      const boxBottom = box.y + box.height;
      const boxLeft = box.x;
      const boxRight = box.x + box.width;
      // Collision with box
      if (
        enemyLeft < boxRight &&
        enemyRight > box.x &&
        enemyBottom > boxTop &&
        enemyTop < boxBottom
      ) {
        // Bottom of box
        if (enemyTop <= boxBottom && enemyBottom > boxBottom) {
          if (
            this.game.height - this.game.groundMargin - boxBottom >=
            this.height
          ) {
            this.y = boxBottom;
            this.vy = 0;
            return false;
            // Left of box
          } else if (enemyRight >= boxLeft && enemyRight <= boxRight) {
            this.x = boxLeft - this.width;
            this.vy = -20;
            return false;
            // Right of box
          } else if (enemyLeft <= boxRight && enemyLeft >= boxLeft) {
            this.x = boxRight + 15;
            this.vy = -20;
            return false;
          }
        }
        // Top of box
        if (enemyBottom > boxTop && enemyTop < boxTop) {
          this.gravity = 0;
          this.vy = 0;
          this.speedX = 2;
          this.y = boxTop - this.height;
          return false;
        }
      } else if (
        enemyRight < boxLeft ||
        enemyLeft > boxRight ||
        enemyBottom < boxTop ||
        enemyTop > boxBottom
      ) {
        return true;
      }
    });
  }
}

export class GroundEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.speedX = 2;
    this.speedY = 0;
    this.vy = 0;
    this.lives = 2;
    this.gravity = 1;
    this.frameX = 0;
    this.randomEnemies = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    this.randomEnemy =
      this.randomEnemies[Math.floor(Math.random() * this.randomEnemies.length)];
    this.enemyWalkSpriteWidth = {
      A: 882,
      B: 890,
      C: 822,
      D: 757,
      E: 757,
      F: 772,
      G: 957,
      H: 754,
      I: 775,
    };
    this.enemyWalkSpriteHeight = {
      A: 786,
      B: 981,
      C: 797,
      D: 887,
      E: 887,
      F: 843,
      G: 749,
      H: 911,
      I: 711,
    };
    this.enemyHitSpriteWidth = {
      A: 822,
      B: 840,
      C: 760,
      D: 681,
      E: 681,
      F: 709,
      G: 880,
      H: 694,
      I: 706,
    };
    this.enemyHitSpriteHeight = {
      A: 860,
      B: 897,
      C: 825,
      D: 938,
      E: 938,
      F: 806,
      G: 782,
      H: 961,
      I: 817,
    };
    this.src = "./src/images/Enemies/monster " + this.randomEnemy + "/";
    this.states = [
      new Walking(
        this.game,
        this,
        this.src + "walk/",
        3,
        this.enemyWalkSpriteWidth[this.randomEnemy],
        this.enemyWalkSpriteHeight[this.randomEnemy],
        "ground"
      ),
      new GetHit(
        this.game,
        this,
        this.src + "got hit/",
        1,
        this.enemyHitSpriteWidth[this.randomEnemy],
        this.enemyHitSpriteHeight[this.randomEnemy],
        "ground"
      ),
    ];
    this.x = this.game.width;
    this.y = this.game.height - this.game.groundMargin - this.height;
    this.currentState = this.states[0];
    this.currentState.enter();
  }
  update(deltaTime) {
    super.update(deltaTime);
    this.vy += this.gravity;
    this.y += this.vy;
    // Collision with groundtiles
    this.checkGroundCollision(this.game.groundTiles);
    this.checkForFallingOffScreen();
    this.checkBoxCollision(this.game.boxes);
    this.currentState.handleState();
  }
  draw(context) {
    if (this.game.debug)
      context.strokeRect(this.x, this.y, this.width, this.height);
    if (this.game.player.earthQuake) {
      this.randomY = -2 + Math.random() * 4;
      context.drawImage(
        this.currentState.images[this.frameX],
        0,
        0,
        this.currentState.spriteWidth,
        this.currentState.spriteHeight,
        this.x,
        this.y + this.randomY,
        this.width,
        this.height
      );
    } else {
      context.drawImage(
        this.currentState.images[this.frameX],
        0,
        0,
        this.currentState.spriteWidth,
        this.currentState.spriteHeight,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }
  checkGroundCollision(groundtiles) {
    groundtiles.every((tile) => {
      const enemyTop = this.y;
      const enemyBottom = enemyTop + this.height;
      const enemyLeft = this.x;
      const enemyRight = enemyLeft + this.width;
      const tileTop = tile.y;
      const tileBottom = tile.y + tile.height;
      const tileLeft = tile.x;
      const tileRight = tile.x + tile.width;
      // Collision with tile
      if (
        enemyLeft <= tileRight &&
        enemyRight >= tileLeft &&
        enemyBottom >= tileTop &&
        enemyTop <= tileBottom
      ) {
        // Top of tile
        if (enemyBottom > tileTop && enemyTop < tileTop) {
          this.gravity = 0;
          this.vy = 0;
          this.speedX = 2;
          this.y = this.game.height - this.game.groundMargin - this.height;
          if (tile.waterObstacle && enemyRight < tileRight) {
            this.vy = -10 - Math.random() * (23 - 10);
            this.speedX = 4;
          }
        }
        // Left of tile
        if (
          enemyRight >= tileLeft &&
          enemyRight <= tileRight &&
          enemyTop > tileTop
        ) {
          this.x = tileLeft - this.width + 45;
          return false;
        }
        // Right of tile
        if (
          enemyLeft <= tileRight &&
          enemyLeft >= tileLeft &&
          enemyTop > tileTop
        ) {
          this.x = tileRight - 44;
          return false;
        }
      } else {
        this.gravity = 1;
        return true;
      }
    });
  }
  checkForFallingOffScreen() {
    if (this.y > this.game.height - this.game.groundMargin) { 
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
    }
  }
}

export class FlyingEnemy extends Enemy {
  constructor(game) {
    super(game);
    this.speedX = 4;
    this.vy = 0;
    this.lives = 2;
    this.frameX = 0;
    this.angle = Math.random() * 2;
    this.angleSpeed = Math.random() * 0.2;
    this.curve = Math.random() * 7;
    this.randomEnemies = ["01", "02", "03", "04", "05"];
    this.randomEnemy =
      this.randomEnemies[Math.floor(Math.random() * this.randomEnemies.length)];
    this.enemyWalkSpriteWidth = {
      "01": 930,
      "02": 930,
      "03": 930,
      "04": 952,
      "05": 952,
    };
    this.enemyWalkSpriteHeight = {
      "01": 738,
      "02": 778,
      "03": 778,
      "04": 782,
      "05": 782,
    };
    this.enemyHitSpriteWidth = {
      "01": 971,
      "02": 976,
      "03": 923,
      "04": 1002,
      "05": 1002,
    };
    this.enemyHitSpriteHeight = {
      "01": 747,
      "02": 797,
      "03": 794,
      "04": 799,
      E05: 799,
    };
    this.src = "./src/images/Enemies/Bee" + this.randomEnemy + "/";
    this.states = [
      new Walking(
        this.game,
        this,
        this.src + "Transparent Png/flying/",
        18,
        this.enemyWalkSpriteWidth[this.randomEnemy],
        this.enemyWalkSpriteHeight[this.randomEnemy],
        "air"
      ),
      new GetHit(
        this.game,
        this,
        this.src + "Transparent Png/got_hit/",
        12,
        this.enemyHitSpriteWidth[this.randomEnemy],
        this.enemyHitSpriteHeight[this.randomEnemy],
        "air"
      ),
    ];
    this.currentState = this.states[0];
    this.currentState.enter();
    this.x = this.game.width;
    this.y = Math.random() * this.game.height * 0.5;
  }
  update(deltaTime) {
    this.speedY = this.curve * Math.sin(this.angle);
    super.update(deltaTime);
    this.angle += this.angleSpeed;
    // Collision with groundtiles
    this.checkBoxCollision(this.game.boxes);
    this.currentState.handleState();
  }
}
