import Phaser from 'phaser'
import PlayerSprite from '../sprites/Player'
import { setTimeout, clearTimeout } from 'timers'
import { debugHTML } from '../utils'

export default class Player {
  playerConfig = {
    initialVelocity: -1000,
    maxVelocity: -1500,
    minVelocity: -500,
    turnVelocity: 30,
    acceleration: 10,
    deceleration: 15
  }

  constructor (game, playerGroup, playerCollisionGroup) {
    this.game = game
    this.playerGroup = playerGroup
    this.playerCollisionGroup = playerCollisionGroup
    this.playerGroup.physicsBodyType = Phaser.Physics.P2JS
    this.playerGroup.enableBody = true
    this.setupPlayer()
    // this.setupCrashEffect()
  }

  setupPlayer () {
    this.playerDef = new PlayerSprite({
      game: this.game,
      x: this.game.world.centerX,
      y: this.game.world.height - this.game.height / 2,
      asset: 'car'
    })
    this.playerDef.anchor.set(0.5)
    this.sprite = this.playerGroup.add(this.playerDef)
    this.game.physics.p2.enable(this.sprite, false)
    // this.game.physics.enable(this.player, Phaser.Physics.ARCADE)
    // this.player.body.maxAngular = 100
    // this.player.body.angularDrag = 150
    // this.player.body.collideWorldBounds = true

    // this.player.body.immovable = true
    this.sprite.body.fixedRotation = true
    this.sprite.body.damping = 0

    this.sprite.body.setCollisionGroup(this.playerCollisionGroup)

    this.game.camera.focusOn(this.sprite)
    this.sprite.body.velocity.y = this.playerConfig.initialVelocity
  }

  update () {
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
      this.sprite.rotation = Phaser.Math.clamp(this.sprite.rotation - 0.02, -0.2, 0)
      if (this.sprite.body.velocity.x > 0) {
        this.sprite.body.velocity.x = 0
      }
      this.sprite.body.velocity.x = Phaser.Math.clamp(this.sprite.body.velocity.x - this.playerConfig.turnVelocity, -1 * this.playerConfig.turnVelocity * 20, 0)
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
      this.sprite.rotation = Phaser.Math.clamp(this.sprite.rotation + 0.02, 0, 0.2)
      if (this.sprite.body.velocity.x < 0) {
        this.sprite.body.velocity.x = 0
      }
      this.sprite.body.velocity.x = Phaser.Math.clamp(this.sprite.body.velocity.x + this.playerConfig.turnVelocity, 0, this.playerConfig.turnVelocity * 20)
    } else {
      if (this.sprite.body.velocity.x > 0) {
        this.sprite.body.velocity.x = Math.min(this.sprite.body.velocity.x - this.playerConfig.turnVelocity * 1.75, 0)
      } else if (this.sprite.body.velocity.x < 0) {
        this.sprite.body.velocity.x = Math.max(this.sprite.body.velocity.x + this.playerConfig.turnVelocity * 1.75, 0)
      }
      this.game.add.tween(this.sprite).to({ rotation: this.sprite.rotation * -1 }, 100, 'Linear', true)
    }

    if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
      this.sprite.body.velocity.y = Math.max(this.sprite.body.velocity.y - this.playerConfig.acceleration, this.playerConfig.maxVelocity)
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
      this.sprite.body.velocity.y = Math.min(this.sprite.body.velocity.y + this.playerConfig.deceleration, this.playerConfig.minVelocity)
    } else {
      if (this.sprite.body.velocity.y < this.playerConfig.initialVelocity) {
        this.sprite.body.velocity.y = Math.min(this.sprite.body.velocity.y + this.playerConfig.acceleration, this.playerConfig.initialVelocity)
      } else if (this.sprite.body.velocity.y > this.playerConfig.initialVelocity) {
        this.sprite.body.velocity.y = Math.max(this.sprite.body.velocity.y - this.playerConfig.acceleration, this.playerConfig.initialVelocity)
      }
    }

    let camDiffY = this.game.math.linear(0, this.sprite.body.velocity.y - this.playerConfig.initialVelocity, 0.1)
    camDiffY = 0
    this.game.camera.y = this.sprite.y - 3 * (this.game.height / 4) - camDiffY * 5
  }

  checkWallCollision (visiblePolygons) {
    let playerWallCollision = false
    visiblePolygons.forEach((poly) => {
      if (poly.contains(this.sprite.x, this.sprite.y) ||
          poly.contains(this.sprite.x - this.sprite.width / 2, this.sprite.y - this.sprite.height / 2) ||
          poly.contains(this.sprite.x + this.sprite.width / 2, this.sprite.y + this.sprite.height / 2)) {
        playerWallCollision = true
      }
    })
    return playerWallCollision
  }

  checkStageElementCollision (visibleBlocks) {
    let playerStageElementCollision = false
    visibleBlocks.forEach((block) => {
      block.stageElementsHitArea.forEach((poly) => {
        if (poly.contains(this.sprite.x, this.sprite.y) ||
          poly.contains(this.sprite.x - this.sprite.width / 2, this.sprite.y - this.sprite.height / 2) ||
          poly.contains(this.sprite.x + this.sprite.width / 2, this.sprite.y + this.sprite.height / 2)) {
          playerStageElementCollision = block
        }
      })
    })

    return playerStageElementCollision
  }

  checkCollectableCollision (collectables) {
    let collisions = []
    let bounds = new Phaser.Rectangle(this.sprite.x - this.sprite.width / 2, this.sprite.y - this.sprite.height / 2, this.sprite.width, this.sprite.height)
    // console.dir(bounds)
    collectables.forEach((collectable) => {
      if (Phaser.Rectangle.containsPoint(bounds, collectable.position)) {
        console.dir(collectable.position)
        collisions.push(collectable)
      }
    })
    return collisions
  }

  slowDown () {
    this.sprite.body.velocity.y = Math.min(this.sprite.body.velocity.y + this.playerConfig.deceleration, this.playerConfig.minVelocity)
  }

  setupCrashEffect () {
    this.manager = this.game.plugins.add(Phaser.ParticleStorm)
    
    var data = {
        lifespan: 100
    }

    this.manager.addData('basic', data)

    this.emitter = this.manager.createEmitter(Phaser.ParticleStorm.PIXEL)

    this.emitter.renderer.pixelSize = 8

    this.emitter.addToWorld(this.playerGroup)

    this.image = this.manager.createImageZone('car')

    //  This will use the Pixel Emitter to display our carrot.png Image Zone
    //  Each 'pixel' is 8x8 so we set that as the spacing value
    //  
    //  The 'setColor' property tells the renderer to tint each 'pixel' to match the
    //  color of the respective pixel in the source image.
  }

  startCrashEffect () {
    return
    console.log(this.sprite.y)
    this.emitter.emit('basic', 200, this.sprite.y, { zone: this.image, full: true, spacing: 8, setColor: true })
    // this.emitter.forEachNew(this.crashEffect, this, 200, 200)
  }

  crashEffect (particle, x, y) {
    particle.setLife(3000)
    particle.radiateFrom(x, y, 3)
  }
}
