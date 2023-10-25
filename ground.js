class Tile {
  constructor(game, x) {
    this.game = game;
    this.spriteWidth = 94;
    this.spriteHeight = 94;
    this.width = this.spriteWidth * 0.4;
    this.height = this.spriteHeight * 0.4;
    this.x = x;
    this.y = this.game.height - this.height;
    this.speedModifier = 1;
    this.markedForDeletion = false;
    this.earthquakeCounter = 0;
  }
  update(input) {
    if (this.x < -this.width) this.markedForDeletion = true;
    if (this.game.player.isCenter() && input.includes('ArrowRight'))
      this.x -= this.game.speed * this.speedModifier;
  }
  draw(context, deltaTime) {
    if (this.game.debug)
      context.strokeRect(this.x, this.y, this.width, this.height);
    if (this.game.player.earthQuake) {
      this.randomY = -2 + Math.random() * 4;
      context.drawImage(
        this.image,
        0,
        0,
        this.spriteWidth,
        this.spriteHeight,
        this.x,
        this.y + this.randomY,
        this.width,
        this.height);
        this.earthquakeCounter += deltaTime;
    } else {
    context.drawImage(
      this.image,
      0,
      0,
      this.spriteWidth,
      this.spriteHeight,
      this.x,
      this.y,
      this.width,
      this.height
    );
    }
  }
}

export class Ground extends Tile {
  constructor(game, x, waterObstacle) {
    super(game);
    this.game = game;
    this.x = x;
    this.image = document.getElementById("ground");
    this.waterObstacle = waterObstacle;
  }
  update(input) {
    super.update(input);
  }
  draw(context, deltaTime) {
    super.draw(context, deltaTime);
  }
}

export class Water extends Tile {
  constructor(game, x) {
    super(game);
    this.game = game;
    this.x = x;
    this.image = document.getElementById("water");
    
  }
  update(input) {
    super.update(input);
  }
  draw(context, deltaTime) {
    super.draw(context, deltaTime);
  }
}
