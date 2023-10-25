import { Dust, AirDust, Fire } from "./particles.js";

const states = {
  STANDING: 0,
  SITTING: 1,
  RUNNING: 2,
  JUMPING: 3,
  FALLING: 4,
  GETHIT: 5,
  ATTACK: 6,
  ROLLING: 7,
  DEAD: 8,
  ULTIMATE: 9
};

class State {
  constructor(state, game) {
    this.state = state;
    this.game = game;
  }
}

export class Standing extends State {
  constructor(game) {
    super("STANDING", game);
  }
  enter() {
    this.game.player.fps = 30;
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 19;
    this.game.player.frameY = 0;
  }
  handleInput(input) {
    if (input.includes("ArrowDown")) {
      this.game.player.setState(states.SITTING, 0);
    } else if (input.includes("ArrowRight")) {
      this.game.player.setState(states.RUNNING, 0.5);
    } else if (input.includes("ArrowLeft")) {
      this.game.player.setState(states.RUNNING, 0);
    } else if (
      input.includes("ArrowUp") &&
      this.game.player.gravity === 0 &&
      input.includes("ArrowRight")
    ) {
      this.game.player.setState(states.JUMPING, 0);
    } else if (input.includes("ArrowUp") && this.game.player.gravity === 0) {
      this.game.player.setState(states.JUMPING, 0);
    } else if (
      input.includes(" ") &&
      this.game.player.stamina >= this.game.player.staminaAttackDec
    ) {
      this.game.player.setState(states.ATTACK, 0);
    }
  }
}

export class Sitting extends State {
  constructor(game) {
    super("SITTING", game);
  }
  enter() {
    this.game.player.fps = 30;
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 13;
    this.game.player.frameY = 8;
  }
  handleInput(input) {
    if (input.includes("ArrowUp")) {
      this.game.player.setState(states.STANDING, 0);
    } else if (input.includes("ArrowRight")) {
      this.game.player.setState(states.RUNNING, 0.5);
    } else if (input.includes("ArrowLeft")) {
      this.game.player.setState(states.RUNNING, 0);
    }
  }
}

export class Running extends State {
  constructor(game) {
    super("RUNNING", game);
  }
  enter() {
    this.game.player.runningSoundOn();
    this.game.player.fps = 30;
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 11;
    this.game.player.frameY = 3;
  }
  handleInput(input) {
    this.game.particles.unshift(
      new Dust(
        this.game,
        this.game.player.x + this.game.player.width * 0.3,
        this.game.player.y + this.game.player.height,
        "player"
      )
    );
    if (input.includes("ArrowDown")) {
      this.game.player.runningSoundOff();
      this.game.player.setState(states.SITTING, 0);
    } else if (input.includes("ArrowUp") && this.game.player.gravity === 0) {
      this.game.player.runningSoundOff();
      this.game.player.setState(states.JUMPING, 0);
    } else if (this.game.player.speed === 0) {
      this.game.player.runningSoundOff();
      this.game.player.setState(states.STANDING, 0);
    } else if (
      input.includes(" ") &&
      this.game.player.stamina >= this.game.player.staminaAttackDec
    ) {
      this.game.player.runningSoundOff();
      this.game.player.setState(states.ATTACK, 0);
    }
  }
}

export class Jumping extends State {
  constructor(game) {
    super("JUMPING", game);
  }
  enter() {
    this.game.player.fps = 30;
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 9;
    this.game.player.frameY = 1;
    this.game.player.vy -= 24;
    this.game.player.gravity = 1;
  }
  handleInput(input) {
    this.game.particles.unshift(
      new AirDust(
        this.game,
        this.game.player.x + this.game.player.width * 0.5,
        this.game.player.y + this.game.player.height * 0.5,
        "player"
      )
    );
    if (
      this.game.player.vy >= this.game.player.gravity &&
      input.includes("ArrowRight")
    ) {
      this.game.player.setState(states.FALLING, 0.5);
    } else if (this.game.player.vy >= this.game.player.gravity) {
      this.game.player.setState(states.FALLING, 0);
    } else if (this.game.player.gravity === 0) {
      this.game.player.setState(states.STANDING, 0);
    } else if (
      input.includes(" ") &&
      !input.includes("ArrowDown") &&
      this.game.player.stamina >= this.game.player.staminaAttackDec
    ) {
      this.game.player.setState(states.ATTACK, 0);
    } else if (
      input.includes(" ") &&
      input.includes("ArrowDown") &&
      this.game.player.stamina >= this.game.player.staminaRollDec
    ) {
      this.game.player.setState(states.ROLLING, 0);
    } else if (this.game.player.isCenter() && input.includes("ArrowRight")) {
      this.game.speed = 0.5 * this.game.maxSpeed;
    } else {
      this.game.speed = 0 * this.game.maxSpeed;
    }
  }
}

export class Falling extends State {
  constructor(game) {
    super("FALLING", game);
  }
  enter() {
    this.game.player.fps = 30;
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 9;
    this.game.player.frameY = 2;
    this.game.player.runningSoundOff();
  }
  handleInput(input) {
    this.game.particles.unshift(
      new AirDust(
        this.game,
        this.game.player.x + this.game.player.width * 0.5,
        this.game.player.y + this.game.player.height * 0.5,
        "player"
      )
    );
    if (this.game.player.gravity === 0) {
      this.game.player.setState(states.STANDING, 0);
    } else if (input.includes("ArrowRight" && this.game.player.gravity === 0)) {
      this.game.player.setState(states.RUNNING, 0.5);
    } else if (
      input.includes(" ") &&
      !input.includes("ArrowDown") &&
      this.game.player.stamina >= this.game.player.staminaAttackDec
    ) {
      this.game.player.setState(states.ATTACK, 0);
    } else if (
      input.includes(" ") &&
      input.includes("ArrowDown") &&
      this.game.player.stamina >= this.game.player.staminaRollDec
    ) {
      this.game.player.setState(states.ROLLING, 0);
    }
  }
}

export class GetHit extends State {
  constructor(game) {
    super("GETHIT", game);
  }
  enter() {
    this.game.player.getHitSound.play();
    this.game.player.fps = 30;
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 7;
    this.game.player.frameY = 4;
  }
  handleInput(input) {
    this.game.player.x--;
    if (this.game.player.frameX >= 7)
      this.game.player.setState(states.STANDING, 0);
  }
}

export class Attack extends State {
  constructor(game) {
    super("ATTACK", game);
  }
  enter() {
    this.game.player.attackSound.play();
    this.game.player.fps = 50;
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 14;
    this.game.player.frameY = 5;
    this.game.player.stamina -= this.game.player.staminaAttackDec;
  }
  handleInput(input) {
    if (this.game.player.frameX >= 14) {
      this.game.player.setState(states.STANDING, 0);
    } else if (this.game.player.isCenter() && input.includes("ArrowRight")) {
      this.game.speed = 0.5 * this.game.maxSpeed;
    } else {
      this.game.speed = 0 * this.game.maxSpeed;
    }
  }
}

export class Rolling extends State {
  constructor(game) {
    super("ROLLING", game);
  }
  enter() {
    this.game.player.fps = 40;
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 8;
    this.game.player.frameY = 7;
    this.game.player.vy = 0;
    this.game.player.gravity = 0;
    this.game.player.stamina -= this.game.player.staminaRollDec;
    this.countDown = 0;
  }
  handleInput(input, deltaTime) {
    if (this.countDown < 300) {
      this.game.player.gravity = 0;
      this.countDown += deltaTime;
    } else {
      this.game.player.gravity = 3;
    }
  if (this.game.player.onGround) {
    this.game.player.earthQuakeTimer += deltaTime;
    this.game.player.setState(states.STANDING, 0);
  } else if (input.includes("ArrowRight" && this.game.player.onGround)) {
    this.game.player.earthQuakeTimer += deltaTime;
    this.game.player.setState(states.RUNNING, 0.5);
    }
  }
}

export class Dead extends State {
  constructor(game) {
    super("DEAD", game);
  }
  enter() {
    this.game.player.fps = 30;
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 24;
    this.game.player.frameY = 10;
  }
  handleInput(input) {
    if (this.game.player.frameX >= 24) this.game.gameOver = true;
    if (input.includes("Enter")) this.game.restart();
  }
}

export class Ultimate extends State {
  constructor(game) {
    super("ULTIMATE", game);
  }
  enter() {
    this.game.player.fps = 40;
    this.game.player.frameX = 0;
    this.game.player.maxFrame = 8;
    this.game.player.frameY = 7;
  }
  handleInput(input) {
    if (this.game.player.ultimateParticle && this.game.player.ultimate) this.game.particles.unshift(new Fire(this.game, this.game.player.x + this.game.player.width * 0.5, this.game.player.y + this.game.player.height * 0.5, 'player'));
    if (input.includes("ArrowUp") && this.game.player.onGround && this.game.player.ultimate) {
      this.game.player.vy -= 24;
    } else if (this.game.player.onGround && !this.game.player.ultimate) {
      this.game.player.setState(states.STANDING, 0);
    } else if (input.includes("ArrowRight" && this.game.player.onGround && !this.game.player.ultimate)) {
      this.game.player.setState(states.RUNNING, 0.5);
    }
    if (this.game.player.isCenter() && input.includes("ArrowRight")) {
      this.game.speed = 0.7 * this.game.maxSpeed;
      } else {
      this.game.speed = 0 * this.game.maxSpeed; 
      }
  }
}
