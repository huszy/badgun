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

  static initialize (game, enemyCollisionGroup, playerCollisionGroup) {
    this.game = game
    this.enemyCollisionGroup = enemyCollisionGroup
    this.playerCollisionGroup = playerCollisionGroup
    this.enemyGroup = new Phaser.Group(game, undefined, 'enemies', false, true)
    this.enemyGroup.physicsBodyType = Phaser.Physics.P2JS
    this.enemyGroup.enableBody = true
    game.world.bringToTop(this.enemyGroup)
  }

  static getDefinitionByName (name) {
    return enemyDefs.enemies.find((x) => x.name === name)
  }

  static getAvailableEnemies () {
    return enemyDefs.enemies.map(x => 'enemy_' + x.name)
  }

  static addRandomEnemy (worldCurrentVelocity, worldMaxVelocity) {
    let enemyDef = new EnemySprite({
      game: this.game,
      x: 250 + (125 / 2),
      y: -125,
      asset: collection.sample(this.getAvailableEnemies())
    })
    let enemy = new Enemy(enemyDef, this.game, { worldCurrentVelocity: worldCurrentVelocity, worldMaxVelocity: worldMaxVelocity, velocity: 300 + (Math.random() * 400) })
    this.enemies.push(enemy)
    this.enemyGroup.add(enemy.sprite)
    // enemy.sprite.body.setRectangle(enemy.sprite.width, enemy.sprite.height)
    enemy.sprite.body.setCollisionGroup(this.enemyCollisionGroup)
    enemy.sprite.body.collideWorldBounds = false
    enemy.sprite.body.angularDamping = 1
    enemy.sprite.body.damping = 0.2
    enemy.sprite.body.collides([this.enemyCollisionGroup, this.playerCollisionGroup])
  }

  static setWorldVelocity (velocity) {
    EnemyManager.enemies.forEach(x => { x.worldCurrentVelocity = velocity })
  }

  static updateEnemies (blockMatrix, firstBlockY, player) {
    let bm = JSON.parse(JSON.stringify(blockMatrix))
    this.enemies.forEach(x => { bm.data[x.getPositionData(firstBlockY).idx] = 2 })
    this.enemies.forEach(x => { x.update(bm, firstBlockY); if (x.sprite.y > this.game.height + 100) { this.removeEnemy(x) } })

    
    let playerCollided = false
    /*
    this.enemies.forEach(x => {
      let collided = EnemyManager.game.physics.arcade.collide(player, x.sprite)
      if (!playerCollided && collided) {
        playerCollided = true
      }
    })*/
    return playerCollided
  }

  static removeEnemy (enemy) {
    this.enemies.splice(this.enemies.indexOf(enemy), 1)
    enemy.sprite.destroy()
    enemy = null
  }
}
