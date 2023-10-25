import { Dust, AirDust } from "./particles.js";

const states = {
    'WALKING': 0,
    'GETHIT': 1,
}

class State {
    constructor(state, game, enemy, src, maxFrame, spriteWidth, spriteHeight, type) {
        this.state = state;
        this.game = game;
        this.enemy = enemy;
        this.src = src;
        this.maxFrame = maxFrame;
        this.spriteWidth = spriteWidth;
        this.spriteHeight = spriteHeight;
        this.width = this.spriteWidth * 0.075;
        this.height = this.spriteHeight * 0.075;
        this.enemy.height = this.height;
        this.enemy.width = this.width;
        this.type = type;
        this.images = [];
    }
}

export class Walking extends State {
    constructor(game, enemy, src, maxFrame, spriteWidth, spriteHeight, type) {
        super('WALKING', game, enemy, src, maxFrame, spriteWidth, spriteHeight, type);    
        if (this.type === 'ground') 
        for (let i = 0; i <= this.maxFrame; i++) {
            this.images.push(new Image);
            this.images[i].src = this.src + 'frame-' + [i + 1] +'.png';
        }
        else if (this.type === 'air')
        for (let i = 0; i <= this.maxFrame; i++) {
            this.images.push(new Image);
            this.images[i].src = this.src + 'skeleton-flying_' + [i] +'.png';
        }
    }
    enter() {
        this.enemy.frameX = 0;
        this.enemy.maxFrame = this.maxFrame;
    }
    handleState() {
        if (this.type === 'ground') this.game.particles.unshift(new Dust(this.game, this.enemy.x + this.enemy.width * 0.3, this.enemy.y + this.enemy.height, 'enemy'));
    }
}

export class GetHit extends State {
    constructor(game, enemy, src, maxFrame, spriteWidth, spriteHeight, type) {
        super('GETHIT', game, enemy, src, maxFrame, spriteWidth, spriteHeight, type);
        if (this.type === 'ground') 
        for (let i = 0; i <= this.maxFrame; i++) {
            this.images.push(new Image);
            this.images[i].src = this.src + 'frame-' + [i + 1] +'.png';
        }
        else if (this.type === 'air')
        for (let i = 0; i <= this.maxFrame; i++) {
            this.images.push(new Image);
            this.images[i].src = this.src + 'skeleton-got_hit_' + [i] +'.png';
        }
    }
    enter() {
        this.game.sounds.push(new Audio("./src/sounds/Hit/enemy-hit-stunned.wav"));
        this.game.sounds[this.game.sounds.length - 1].volume = 0.3;
        this.game.sounds[this.game.sounds.length - 1].play();
        this.enemy.frameX = 0;
        this.enemy.maxFrame = this.maxFrame;  
        if (this.type === 'ground') this.enemy.vy = -10;
        if (this.type === 'air') this.enemy.SpeedX *= -1;

        
    }                           
    handleState() {
        if (this.type === 'ground') { 
            if (this.enemy.gravity === 0) this.enemy.setState(states.WALKING) }
        if (this.type === 'air' && this.enemy.frameX >= this.maxFrame) {
            this.enemy.speedX *= -1;
            this.enemy.setState(states.WALKING) }
    }
}