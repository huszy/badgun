import Phaser from 'phaser'

export default class Coin extends Phaser.Sprite {
  constructor ({ game, x, y }) {
    super(game, x, y, 'stageFinish')
    this.anchor.setTo(0.5)
  }
}
