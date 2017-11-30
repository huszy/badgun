import Phaser from 'phaser'

export default class EnemySprite extends Phaser.Sprite {
  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)
    this.anchor.setTo(0.5, 0.5)
  }
}
