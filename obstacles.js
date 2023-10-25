class Obstacle {
  constructor(game) {
    this.game = game;
    this.markedForDeletion = false;
  }
  update(input) {
    if (this.x < -this.width) this.markedForDeletion = true;
    if (this.game.player.isCenter() && input.includes('ArrowRight'))
      this.x -= this.game.speed;
  }
  draw(context) {
    if (this.game.debug)
    context.strokeRect(
      this.x,
      this.y,
      this.width,
      this.height
    );
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

export class Box extends Obstacle {
  constructor(game, x, y) {
    super(game);
    this.game = game;
    this.mysteryBox = false;
    if (Math.random() > 0.90) { 
      this.image = document.getElementById("mystery-box");
      this.mysteryBox = true;
    }
    else this.image = document.getElementById("box");
    this.spriteWidth = 490;
    this.spriteHeight = 492;
    this.width = this.spriteWidth * 0.1;
    this.height = this.spriteHeight * 0.1;
    this.x = x;
    this.y = y;
  }
  update(input) {
    super.update(input);
  }
  draw(context) {
    super.draw(context);
  }
}
