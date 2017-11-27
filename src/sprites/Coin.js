import Phaser from 'phaser'

export default class Coin extends Phaser.Sprite {
  constructor ({ game, x, y, asset, pointValue = 100 }) {
    super(game, x, y, asset)
    this.pointValue = pointValue
    this.anchor.setTo(0.5)
    this.animations.add('spin')
    this.animations.play('spin', 12, true)
  }
}
