export default class UI {
    constructor(game) {
        this.game = game;
        this.fontFamily = 'Changa';
        this.fontColor = 'black';
        this.fontSize = 30;
        this.livesImage = document.getElementById('lives');
        this.healthBar = new healthBar(this.game);
        this.abilityBar = new AbilityBar(this.game);
        this.starGemBar = new StarGemBar(this.game);
    }   
    draw(context, deltaTime) {
        context.save();
        context.font = this.fontSize + "px " + this.fontFamily;
        context.fillStyle = this.fontColor;
        context.fillText('Health', 10, 30);
        context.fillText('Ultimate', 10, 95);
        context.fillText('Score: ' + this.game.player.score, 10, 171);
        context.fillText('Stamina', this.game.width - 120, 30);
        context.fillText('Abilities', this.game.width - 120, 90);
        this.abilityBar.draw(context);
        this.healthBar.draw(context, deltaTime);
        this.starGemBar.draw(context);
        for (let i = 0; i < this.game.player.lives; i++) context.drawImage(this.livesImage, 10 + 35 * i, 40, 30, 30);
        if (this.game.gameOver) {
            context.textAlign = "center";
            context.fillStyle = 'black';
            context.font = this.fontSize * 2 + "px " + this.fontFamily;
            context.fillText('Game Over', this.game.width * 0.5, this.game.height * 0.5)
            context.font = this.fontSize + "px " + this.fontFamily;
            context.fillText('Press enter to restart...', this.game.width * 0.5, this.game.height * 0.6)
        }
        context.restore();
    }
}

class healthBar {
    constructor(game) {
        this.game = game;
        this.y = 40;
        this.maxWidth = 300;
        this.height = 20;
        this.color = 'rgb(22,40,224, 0.5)';
        this.strokeColor = 'black';
        this.errorColor = 'rgb(200,0,76)';
        this.error = false;
        this.errorTimer = 0;
    }
    draw(context, deltaTime) {
        context.lineWidth = 2;
        context.fillStyle = this.color;
        if ((this.game.player.stamina < this.game.player.staminaAttackDec && this.game.input.keys.includes(' ') && this.game.player.currentState !== this.game.player.states[6])  || (this.game.player.stamina < this.game.player.staminaRollDec && this.game.input.keys.includes('ArrowDown') && (this.game.player.currentState !== this.game.player.states[3] || this.game.player.currentState !== this.game.player.states[4]))) {
            this.error = true;
            this.errorTimer += deltaTime;
        }
        if (this.error && this.errorTimer > 0 && this.errorTimer < 1000) {
            context.lineWidth = 3;
            context.strokeStyle = this.errorColor;
            context.fillRect(this.game.width - 310, this.y, this.game.player.stamina * 3, this.height);
            context.strokeRect(this.game.width - 310, this.y, this.maxWidth, this.height);
            this.errorTimer += deltaTime;
        } else {
            context.strokeStyle = this.strokeColor;
            context.fillRect(this.game.width - 310, this.y, this.game.player.stamina * 3, this.height);
            context.strokeRect(this.game.width - 310, this.y, this.maxWidth, this.height);
            this.errorTimer = 0;
            this.error = false;
        }
    }
}

class AbilityBar {
    constructor(game) {
        this.game = game;
        this.ability1image = new Image();
        this.ability1image.src =  './src/images/Cat/Transparent PNG/06_paw_atk/skeleton-06_paw_atk_10.png';
        this.ability2image = new Image();
        this.ability2image.src = './src/images/Cat/Transparent PNG/08_rolling/skeleton-08_rolling_0.png';
        this.spriteWidth = 1284;
        this.spriteHeight = 950;
        this.width = this.spriteWidth * 0.08;
        this.height = this.spriteHeight * 0.08;
        this.spacebarImage = new Image();
        this.spacebarImage.src = './src/images/Ornaments/spacebar.png';
        this.spacebarSpriteWidth = 971;
        this.spacebarSpriteHeight = 231;
        this.spacebarWidth = this.spacebarSpriteWidth * 0.08;
        this.spacebarHeight = this.spacebarSpriteHeight * 0.08;
        this.arrowDownSpriteWidth = 625;
        this.arrowDownSpriteHeight = 362;
        this.arrowDownWidth = this.arrowDownSpriteWidth * 0.03;
        this.arrowDownHeight = this.arrowDownSpriteHeight * 0.03;
        this.fillStyle = 'rgb(22,40,224, 0.5)'
        this.loadingColor = 'rgb(200,0,76)'
        this.readyColor = 'rgb(81,225,1)'
        this.y = 100
    }
    draw(context) {
        context.fillStyle = this.fillStyle;
        context.lineWidth = 3;
        
        if (this.game.player.stamina < this.game.player.staminaAttackDec) {
            context.strokeStyle = this.loadingColor;
            context.fillRect(this.game.width - this.width * 2 - 40, this.y + this.height, this.width, -this.height / this.game.player.staminaAttackDec * this.game.player.stamina);
            context.strokeRect(this.game.width - this.width * 2 - 40, this.y, this.width, this.height);
        } else {
            context.strokeStyle = this.readyColor;
            context.fillRect(this.game.width - this.width * 2 - 40, this.y + this.height, this.width, -this.height);
            context.strokeRect(this.game.width - this.width * 2 - 40, this.y, this.width, this.height);
        }
        if (this.game.player.stamina < this.game.player.staminaRollDec) {
            context.strokeStyle = this.loadingColor;
            context.fillRect(this.game.width - this.width - 14, this.y + this.height, this.width, -this.height / this.game.player.staminaRollDec * this.game.player.stamina);
            context.strokeRect(this.game.width - this.width - 14, this.y, this.width, this.height);
        } else {
            context.strokeStyle = this.readyColor;
            context.fillRect(this.game.width - this.width - 14, this.y + this.height, this.width, -this.height);
            context.strokeRect(this.game.width - this.width - 14, this.y, this.width, this.height);
        }
        context.drawImage(this.ability1image, this.game.width - this.width * 2 - 50, this.y - 10, this.width, this.height);
        context.drawImage(this.ability2image, this.game.width - this.width - 14, this.y, this.width, this.height);
        context.drawImage(this.spacebarImage, 0, 0, this.spacebarSpriteWidth, this.spacebarSpriteHeight, this.game.width - this.width * 2 - 40, this.y + this.height + 10, this.spacebarWidth, this.spacebarHeight);
        context.drawImage(this.spacebarImage, 0, 0, this.spacebarSpriteWidth, this.spacebarSpriteHeight, this.game.width - 85, this.y + this.height + 10, this.spacebarWidth, this.spacebarHeight);
        context.fillStyle = 'black';
        context.fillText('↓+', this.game.width - this.width - 20, this.y + this.height + 28);  
    }
}

class StarGemBar {
    constructor(game) {
        this.game = game;
        this.emptyStarImage = document.getElementById('star-powerup-empty');
        this.StarImage = document.getElementById('star-powerup');
        this.spriteWidth = 508;
        this.spriteHeight = 442;
        this.width = this.spriteWidth * 0.09;
        this.height = this.spriteHeight * 0.09;
   }
   draw(context) {
    for (let i = 0; i < 3; i++) {
        context.drawImage(this.emptyStarImage, 0, 0, this.spriteWidth, this.spriteHeight, 10 + (this.width + 5) * i , 105, this.width, this.height);
    }
    for (let i = 0; i < this.game.player.starGems; i++) {
        context.drawImage(this.StarImage, 0, 0, this.spriteWidth, this.spriteHeight, 10 + (this.width + 5) * i , 105, this.width, this.height);
    }
   }
}