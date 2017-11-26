/* globals __DEV__ */
import Phaser from 'phaser'
import Player from '../sprites/Player'
import Block from '../sprites/Block'
import EnemySprite from '../sprites/Enemy'
import MapGenerator from './MapGenerator'

import Enemy from '../classes/Enemy'
import EnemyManager from '../classes/EnemyManager'

import { mapNumber } from '../utils'

const array = require('lodash/array')
const math = require('lodash/math')
const collection = require('lodash/collection')

export default class extends Phaser.State {

  playerConfig = {
    initialVelocity: -1000,
    maxVelocity: -1500,
    minVelocity: -500,
    turnVelocity: 30,
    acceleration: 10,
    deceleration: 15
  }

  gameConfig = {
    stage: 1,
    currentTheme: 'desert',
    requiredEnemies: 3,
    enemyAppearInterval: 1500
  }

  visibleBlocks = []
  visiblePolygons = []
  visibleStageElements = []
  enemies = []


  constructor () {
    super()
    this.blockMatrix = {data: []}
    this.currentBlockIndex = 0
    this.mapGenerator = new MapGenerator()

    for (var i = 0; i <= 10; i++) {
      this.mapGenerator.generateNext(this.gameConfig.currentTheme)
    }
  }
  
  init () {
    this.game.world.resize(this.game.world.width, 1250 * 40000)
    this.gameWorld = this.game.add.group()
    this.gameWorld.position.setTo(0, 0)
    this.game.physics.startSystem(Phaser.Physics.P2JS)
    this.game.physics.p2.setImpactEvents(true)
    this.game.physics.p2.restitution = 0.5
    this.playerCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.enemyCollisionGroup = this.game.physics.p2.createCollisionGroup()
    EnemyManager.initialize(this.game, this.enemyCollisionGroup, this.playerCollisionGroup)
  }
  preload () {}

  create () {
    this.setupPlayer()
    this.fillVisibleBlocksAndGenerateMoreIfNeeded(false)
    // Setup user input - TODO: Handle mobile touch
    if (!this.game.device.desktop) {
      this.game.input.addPointer()
    }
    this.userInput = this.game.device.desktop ? this.game.input.mousePointer : this.game.input.pointer1

    this.game.physics.p2.updateBoundsCollisionGroup()
    this.player.body.collides(this.enemyCollisionGroup, this.hitEnemy, this)
  }

  hitEnemy (body1, body2) {
    console.log("enemy hit")
  }

  setupPlayer () {
    this.playerDef = new Player({
      game: this.game,
      x: this.game.world.centerX,
      y: this.game.world.height - this.game.height / 2,
      asset: 'car'
    })
    this.playerDef.anchor.set(0.5)
    this.player = this.game.add.existing(this.playerDef)
    this.game.physics.p2.enable(this.player, false)
    // this.game.physics.enable(this.player, Phaser.Physics.ARCADE)
    // this.player.body.maxAngular = 100
    // this.player.body.angularDrag = 150
    // this.player.body.collideWorldBounds = true

    // this.player.body.immovable = true
    this.player.body.fixedRotation = true
    this.player.body.damping = 0

    this.player.body.setCollisionGroup(this.playerCollisionGroup)

    this.game.camera.focusOn(this.player)
    this.player.body.velocity.y = this.playerConfig.initialVelocity
  }

  fillVisibleBlocksAndGenerateMoreIfNeeded (shouldCleanup = true) {
    let hasEnough = false
    let updateBlockMatrix = false
    while (hasEnough === false) {
      while (this.mapGenerator.maps.length <= this.currentBlockIndex) {
        this.mapGenerator.generateNext(this.gameConfig.currentTheme)
      }
      // let totalHeight = this.visibleBlocks.reduce((a, b) => a + b.height, 0)
      let lastBlockY = array.last(this.visibleBlocks) ? array.last(this.visibleBlocks).y : this.game.world.height

      // console.log(lastBlockY, this.game.camera.view.y)
      if (lastBlockY > this.game.camera.view.y - 100) {
        // console.log("Addnew")
        // console.log('newY: ', this.game.world.height - totalHeight)
        updateBlockMatrix = true
        let definition = this.mapGenerator.maps[this.currentBlockIndex]
        let yPos = array.last(this.visibleBlocks) ? array.last(this.visibleBlocks).y : this.game.world.height
        let newBlock = new Block({
          game: this.game,
          x: 0,
          y: yPos - definition.height,
          definition: definition
        })
        const block = this.game.add.existing(newBlock)
        // block.setPosition(0, block.position.y - block.height)
        this.gameWorld.add(block)
        block.stageElements.forEach(elem => this.gameWorld.add(elem))
        this.visibleBlocks.push(block)

        this.currentBlockIndex++
        hasEnough = false
      } else {
        hasEnough = true
      }
    }

    // Cleanup visible items
    if (shouldCleanup) {
      let visibleItemIndex = this.visibleBlocks.findIndex((block) => {
        return block.inCamera === true
      })
      let removed = this.visibleBlocks.splice(0, visibleItemIndex)
      if (removed.length > 0) {
        updateBlockMatrix = true
        // console.log(removed.length, 'sprite destroyed')
        removed.forEach((sprite) => { sprite.destroy() })
      }
    }

    if (updateBlockMatrix) {
      let sortedBlocks = collection.sortBy(this.visibleBlocks, 'y')
      this.blockMatrix.startY = sortedBlocks[0].y
      this.blockMatrix.data = sortedBlocks.map(x => x._freeSpaceMap).reduce((a, b) => a.concat(b), [])
      this.visiblePolygons = [].concat.apply([], this.visibleBlocks.map(x => x.offRoadPolygons))
      // this.debugBlockData(this.blockMatrix)
    }
  }

  debugBlockData (blockData) {
    console.log("startY", blockData.startY)
    console.log(blockData.data.join('').replace(/(.{6})/g, "$1\n"))
  }

  render () {
    this.fillVisibleBlocksAndGenerateMoreIfNeeded()
    if (EnemyManager.enemies.length > 0) {
      this.game.debug.bodyInfo(EnemyManager.enemies[0].sprite, 0, 20)
    }
  }

  update (...args) {
    if (this.game.input.keyboard.isDown(32)) {
      this.game.paused = !this.game.paused
    }

    // console.log(this.player.y, this.player.body.velocity.y, this.game.camera.y)
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
      this.player.rotation = Phaser.Math.clamp(this.player.rotation - 0.02, -0.2, 0)
      if (this.player.body.velocity.x > 0) {
        this.player.body.velocity.x = 0
      }
      this.player.body.velocity.x = Phaser.Math.clamp(this.player.body.velocity.x - this.playerConfig.turnVelocity, -1 * this.playerConfig.turnVelocity * 20, 0)
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
      this.player.rotation = Phaser.Math.clamp(this.player.rotation + 0.02, 0, 0.2)
      if (this.player.body.velocity.x < 0) {
        this.player.body.velocity.x = 0
      }
      this.player.body.velocity.x = Phaser.Math.clamp(this.player.body.velocity.x + this.playerConfig.turnVelocity, 0, this.playerConfig.turnVelocity * 20)
    } else {
      if (this.player.body.velocity.x > 0) {
        this.player.body.velocity.x = Math.min(this.player.body.velocity.x - this.playerConfig.turnVelocity * 1.75, 0)
      } else if (this.player.body.velocity.x < 0) {
        this.player.body.velocity.x = Math.max(this.player.body.velocity.x + this.playerConfig.turnVelocity * 1.75, 0)
      }
      this.game.add.tween(this.player).to({ rotation: this.player.rotation * -1 }, 100, 'Linear', true)
    }

    if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
      this.player.body.velocity.y = Math.max(this.player.body.velocity.y - this.playerConfig.acceleration, this.playerConfig.maxVelocity)
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
      this.player.body.velocity.y = Math.min(this.player.body.velocity.y + this.playerConfig.deceleration, this.playerConfig.minVelocity)
    } else {
      if (this.player.body.velocity.y < this.playerConfig.initialVelocity) {
        this.player.body.velocity.y = Math.min(this.player.body.velocity.y + this.playerConfig.acceleration, this.playerConfig.initialVelocity)
      } else if (this.player.body.velocity.y > this.playerConfig.initialVelocity) {
        this.player.body.velocity.y = Math.max(this.player.body.velocity.y - this.playerConfig.acceleration, this.playerConfig.initialVelocity)
      }
    }

    let camDiffY = this.game.math.linear(0, this.player.body.velocity.y - this.playerConfig.initialVelocity, 0.1)
    camDiffY = 0
    this.game.camera.y = this.player.y - 3 * (this.game.height / 4) - camDiffY * 5

    // UPDATE POLYGONS AND CHECK COLLISION
    let playerWallCollision = false
    let playerStageElementCollision = false
    this.visiblePolygons.forEach((poly) => {
      if (poly.contains(this.player.x, this.player.y) ||
          poly.contains(this.player.x - this.player.width / 2, this.player.y - this.player.height / 2) ||
          poly.contains(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2)) {
        playerWallCollision = true
      }
    })

    this.visibleBlocks.forEach((block) => {
      block.stageElementsHitArea.forEach((poly) => {
        if (poly.contains(this.player.x, this.player.y) ||
          poly.contains(this.player.x - this.player.width / 2, this.player.y - this.player.height / 2) ||
          poly.contains(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2)) {
            playerStageElementCollision = true
            console.log("STAGE ELEMENT COLLISION")
        }
      })
    })

    if (playerWallCollision) {
      this.game.camera.shake(0.005, 100)
      this.player.body.velocity.y = Math.min(this.player.body.velocity.y + this.playerConfig.deceleration, this.playerConfig.minVelocity)
    }

    let topPos = (this.game.camera.view.y - this.blockMatrix.startY)
    let y = Math.floor(topPos / 125)
    let idx = y * 6

    let availableSpaces = []
    for (var i = idx; i < idx + 6; i++) {
      if (this.blockMatrix.data[i] === 1) {
        availableSpaces.push(i - idx)
      }
    }

    if (availableSpaces.length > 0) {
      EnemyManager.addRandomEnemyIfNeeded(62.5 + (collection.sample(availableSpaces) * 125), this.game.camera.view.y - 100, this.gameConfig, this.game.time.elapsedMS)
    }
    /*
    if (EnemyManager.enemies.length < 5) {
      EnemyManager.addRandomEnemy(62.5 + (Math.floor(Math.random() * 5) * 125), this.game.camera.view.y, 0, 0)
    } */

    EnemyManager.updateMovement(this.blockMatrix)

    //console.log(this.player.body.mass)
  }

  playerCollisionCallback () {
    this.playerCollided = true
    this.playerSlowdownVelocity = 75
  }

  removeEnemy (enemy) {
    this.enemies.splice(this.enemies.indexOf(enemy), 1)
    enemy.sprite.destroy()
    enemy = null
  }

  setWorldPosition (scale) {
    let nW = this.game.width * scale
    let nH = this.game.height * scale
    let wD = (nW - this.game.width) / 2
    let hD = (nH - this.game.height) / 2
    this.gameWorld.position.setTo(-1 * wD, -1 * hD)
  }
}
