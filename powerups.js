class PowerUp {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
    }
    update(input) {
        if (this.x < -this.width) this.markedForDeletion = true;
        if (this.y + this.height > this.boxTop)
        this.y--;
        if (this.game.player.isCenter() && input.includes('ArrowRight'))
        this.x -= this.game.speed;
    }
    draw(context) {
        context.drawImage(this.image, 0, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }
}

export class Health extends PowerUp {
    constructor(game, x, y) {
        super(game, x, y);
        this.image = document.getElementById('health-powerup');
        this.type = 'health';
        this.spriteWidth = 508;
        this.spriteHeight = 442;
        this.width = this.spriteWidth * 0.09;
        this.height = this.spriteHeight * 0.09;
        this.boxTop = this.y;
        this.sound = new Audio();
        this.sound.src = './src/sounds/PowerUps/health-up.wav';
        this.sound.volume = 0.3;
    }
}

export class Star extends PowerUp {
    constructor(game, x, y) {
        super(game, x, y);
        this.image = document.getElementById('star-powerup');
        this.type = 'star';
        this.spriteWidth = 508;
        this.spriteHeight = 442;
        this.width = this.spriteWidth * 0.09;
        this.height = this.spriteHeight * 0.09;
        this.boxTop = this.y;
        this.sound = new Audio();
        this.sound.src = './src/sounds/PowerUps/stargem.wav';
        this.sound.volume = 0.3;
    }
}