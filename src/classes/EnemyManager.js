import EnemySprite from '../sprites/Enemy'
import Enemy from '../classes/Enemy'
import Phaser from 'phaser'

const enemyDefs = require('../enemyConfig.json')
const collection = require('lodash/collection')

export default class EnemyManager {
  static enemies = []
  static game = null
  static enemyGroup = null
  static enemyCollisionGroup = null
  static playerCollisionGroup = null
  static blockMatrix = null
  static timeSinceLastAdd = 0

  static reset () {
    this.enemies = []
    this.game = null
    this.enemyGroup = null
    this.enemyCollisionGroup = null
    this.playerCollisionGroup = null
    this.blockMatrix = null
    this.timeSinceLastAdd = 0
  }

  static initialize (game, enemyGroup, enemyCollisionGroup, playerCollisionGroup) {
    this.reset()
    this.game = game
    this.enemyGroup = enemyGroup
    this.enemyCollisionGroup = enemyCollisionGroup
    this.playerCollisionGroup = playerCollisionGroup
    this.enemyGroup.physicsBodyType = Phaser.Physics.P2JS
    this.enemyGroup.enableBody = true
    // game.world.bringToTop(this.enemyGroup)
  }

  static getDefinitionByName (name) {
    return enemyDefs.enemies.find((x) => x.name === name)
  }

  static getAvailableEnemies () {
    return enemyDefs.enemies
  }

  static addRandomEnemyIfNeeded (x, y, gameConfig, timeElapsed) {
    this.timeSinceLastAdd += timeElapsed
    if (this.enemies.length >= gameConfig.requiredEnemies) { return }
    if (this.timeSinceLastAdd < gameConfig.enemyAppearInterval) { return }
    this.addRandomEnemy(x, y)
    this.timeSinceLastAdd = 0
  }

  static addRandomEnemy (x, y) {
    let enemyDef = collection.sample(this.getAvailableEnemies())
    let enemySpriteDef = new EnemySprite({
      game: this.game,
      x: x,
      y: y,
      asset: 'enemy_' + enemyDef.name
    })
    let enemy = new Enemy(enemySpriteDef, this.game, this.enemyGroup, this.enemyCollisionGroup, Object.assign({}, enemyDef))
    this.enemies.push(enemy)
    // this.enemyGroup.add(enemy.sprite)
    // enemy.sprite.body.setRectangle(enemy.sprite.width, enemy.sprite.height)
    enemy.sprite.body.collides([this.enemyCollisionGroup, this.playerCollisionGroup])
  }

  static updateMovement (blockMatrix) {
    this.blockMatrix = Object.assign({}, blockMatrix)
    this.enemies.forEach(x => x.setBlockPositionOnBlockMatrix(this.blockMatrix))
    this.enemies.forEach(x => x.updateMovement(this.blockMatrix))

    this.enemies.forEach(x => { if (x.sprite.y > this.game.camera.view.y + this.game.camera.view.height + x.sprite.height + 100) { this.removeEnemy(x) } })
    // this.game.state.getCurrentState().debugBlockData(this.blockMatrix)
  }

  static removeEnemy (enemy) {
    this.enemies.splice(this.enemies.indexOf(enemy), 1)
    enemy.sprite.destroy()
    enemy = null
  }
}
