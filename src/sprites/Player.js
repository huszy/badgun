import Phaser from 'phaser'
import CarExplosion from './CarExplosion';

export default class extends Phaser.Sprite {
  constructor ({ game, x, y, asset }) {
    super(game, x, y, asset)
    this.game = game
    this.anchor.setTo(0.5)
  }

}
