import Phaser from 'phaser'

export default class Coin extends Phaser.Sprite {
  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)
    this.anchor.setTo(0.5)
    this.animations.add('spin')
    this.animations.play('spin', 12, true)
  }
}
