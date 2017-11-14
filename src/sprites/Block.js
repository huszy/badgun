import Phaser from 'phaser'

export default class extends Phaser.Sprite {
  constructor ({ game, x, y, definition }) {
    super(game, x, y, definition.sprite)
    this.definition = definition
  }
}
