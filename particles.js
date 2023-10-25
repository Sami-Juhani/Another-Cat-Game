class Particle {
  constructor(game, object) {
    this.game = game;
    this.markedForDeletion = false;
    this.object = object
  }
  update() {
    if (this.object === 'player' && this.game.player.isCenter()) this.x -= this.speedX + this.game.speed;
    else if (this.object === 'player') this.x -= this.speedX;
    else this.x += 2;
    this.y += this.speedY;
    this.size *= 0.95;
    if (this.size < 0.5) this.markedForDeletion = true;
  }
}

export class Dust extends Particle {
  constructor(game, x, y, object) {
    super(game, object);
    this.size = Math.random() * 10 + 10;
    this.x = x;
    this.y = y;
    this.speedX = Math.random();
    this.speedY = Math.random();
    this.color = "rgba(139,69,19,0.15)";
  }
  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
  }
}

export class AirDust extends Particle {
  constructor(game, x, y, object) {
    super(game, object);
    this.size = Math.random() * 10 + 10;
    this.x = x;
    this.y = y;
    this.speedX = Math.random();
    this.speedY = Math.random();
    this.color = "rgba(0,0,125,0.1)";
  }
  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
  }
}

export class Splash extends Particle {
  constructor(game, x, y, object) {
    super(game, object);
    this.size = 2 + Math.random() * 4;
    this.x = x;
    this.offSetY = 5 + Math.random() * 10;
    this.y = y + this.offSetY;
    this.speedX = -5 + Math.random() * 10;
    this.gravity = 1;
    this.vy = -2 - this.offSetY;
    this.opacity = 1;
    this.color = "rgba(30,139,195," + this.opacity + ")";
  }
  update() {
    this.x -= this.speedX + this.game.speed;
    this.y += this.vy;
    this.vy += this.gravity;
    this.opacity -= 0.02;
    this.color = "rgba(30,139,195," + this.opacity + ")";
    if (this.y > this.game.height - this.game.groundMargin)
      this.markedForDeletion = true;
  }
  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    context.fillStyle = this.color;
    context.fill();
  }
}

export class Explosion extends Particle {
  constructor(game, x, y) {
    super(game);
    this.x = x;
    this.y = y;
    this.width = this.spriteWidth * 0.1 
    this.height = this.spriteHeight * 0.1
    this.frameX = 0;
    this.maxFrame = 4;
    this.fps = 20;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
    this.markedForDeletion = false;
  }
  update(deltaTime) {
    this.x -= this.game.speed;
    if (this.frameTimer > this.frameInterval) {
      if (this.frameX < this.maxFrame) {
        this.frameX++;
        this.frameTimer = 0;
      } else this.frameX = 0;
    }
    this.frameTimer += deltaTime;
    if (this.frameX === this.maxFrame) this.markedForDeletion = true;
  }
  draw(context) {
    context.drawImage(this.images[this.frameX], 0, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.height, this.width, this.height)
  }
}

export class GroundExplosion extends Explosion {
    constructor(game, x, y) {
        super(game, x, y);
        this.spriteWidth = 1726; 
        this.spriteHeight = 1162;
        this.width = this.spriteWidth * 0.075; 
        this.height = this.spriteHeight * 0.075;
        this.images = new Array();
        for (let i = 0; i <= this.maxFrame; i++) {
            this.images.push(new Image);
            this.images[i].src = './src/images/Enemies/Ground Explode/frame-' + [i + 1] +'.png';
        }
    }
}

export class AirExplosion extends Explosion {
    constructor(game, x, y) {
        super(game, x, y);
        this.spriteWidth = 1548;
        this.spriteHeight = 1384;
        this.width = this.spriteWidth * 0.075; 
        this.height = this.spriteHeight * 0.075;
        this.images = new Array();
        for (let i = 0; i <= this.maxFrame; i++) {
            this.images.push(new Image);
            this.images[i].src = './src/images/Enemies/Air Explode/Frame-' + [i + 1] +'.png';
        }
    }
}

export class Fire extends Particle {
  constructor(game, x, y, object){
      super(game, object);
      this.image = document.getElementById('fire');
      this.x = x;
      this.y = y;
      this.size = Math.random() * 100 + 50;
      this.speedX = 1;
      this.speedY = 1;
      this.angle = 0;
      this.va = Math.random() * 0.2 - 0.1;
  }
  update(){
      super.update();
      this.angle += this.va;
      this.x -= Math.sin(this.angle * 10);
  }
  draw(context){
      context.save();
      context.translate(this.x, this.y);
      context.rotate(this.angle);
      context.drawImage(this.image, -this.size * 0.5, -this.size * 0.5, this.size, this.size);
      context.restore();
  }
}
