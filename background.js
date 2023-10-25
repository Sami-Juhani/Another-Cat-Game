class Layer {
  constructor(game, width, height, speedModifier, image) {
    this.game = game;
    this.width = width;
    this.height = height;
    this.speedModifier = speedModifier;
    this.image = image;
    this.x = 0;
    this.y = 0;
  }
  update(input) {
    if (this.x < -this.width) this.x = 0;
    if (this.game.player.isCenter() && input.includes('ArrowRight')) this.x -= this.game.speed * this.speedModifier;
  }
  draw(context) {
    context.drawImage(
      this.image,
      this.x,
      this.y,
      this.width,
      this.height
    );
    context.drawImage(
        this.image,
        this.x + this.width,
        this.y,
        this.width,
        this.height
      );
  }
}

export class Background extends Layer {
    constructor(game) {
        super(game);
        this.width = 5000 * 0.4;
        this.height = 1290 * 0.4;
        this.layer1image = document.getElementById('layer1');
        this.layer2image = document.getElementById('layer2');
        this.layer3image = document.getElementById('layer3');
        this.layer4image = document.getElementById('layer4');
        this.layer5image = document.getElementById('layer5');
        this.layer6image = document.getElementById('layer6');
        this.layer7image = document.getElementById('layer7');
        this.layer8image = document.getElementById('layer8');
        this.layer9image = document.getElementById('layer9');
        this.layer1 = new Layer(this.game, this.width, this.height, 0.6, this.layer1image);
        this.layer2 = new Layer(this.game, this.width, this.height, 0.7, this.layer2image);
        this.layer3 = new Layer(this.game, this.width, this.height, 0.8, this.layer3image);
        this.layer4 = new Layer(this.game, this.width, this.height, 0.9, this.layer4image);
        this.layer5 = new Layer(this.game, this.width, this.height, 1, this.layer5image);
        this.layer6 = new Layer(this.game, this.width, this.height, 0.8, this.layer6image);
        this.layer7 = new Layer(this.game, this.width, this.height, 1, this.layer7image);
        this.layer8 = new Layer(this.game, this.width, this.height, 1, this.layer8image);
        this.layer9 = new Layer(this.game, this.width, this.height, 1, this.layer9image);
        this.backgroundLayers = [this.layer1, this.layer2, this.layer3, this.layer4, this.layer5, this.layer7, this.layer8]
    }
    update(input) {
        this.backgroundLayers.forEach(layer => {
            layer.update(input);
        })
    }
    draw(context) {
        this.backgroundLayers.forEach(layer => {
            layer.draw(context);
        })
    }
}
