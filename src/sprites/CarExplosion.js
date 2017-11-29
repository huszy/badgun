import Phaser from 'phaser'

export default class CarExplosion extends Phaser.Sprite {
  constructor ({ game, x, y, asset, onComplete }) {
    super(game, x, y, asset)
    this.anchor.setTo(0.5)
    let explosionAnim = this.animations.add('explosion')
    explosionAnim.onComplete = onComplete
    this.animations.play('explosion', 20, false)
  }
}
