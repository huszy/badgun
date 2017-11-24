import Phaser from 'phaser'
import EnemySprite from '../sprites/Enemy'

export default class NewEnemy {
  constructor (definition, game) {
    this.definition = definition
    this.game = game
    this._createSprite()
  }

  _createSprite () {
    let enemyDef = new EnemySprite({
      game: this.game,
      x: 250,
      y: -125,
      asset: 'enemy_' + this.definition.name
    })
    this.sprite = this.game.add.existing(enemyDef)
  }
  
}