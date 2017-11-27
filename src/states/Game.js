/* globals __DEV__ */
import Phaser from 'phaser'
import Block from '../sprites/Block'
import MapGenerator from './MapGenerator'

import Player from '../classes/Player'
import EnemyManager from '../classes/EnemyManager'
import CollectableManager from '../classes/CollectableManager'

const array = require('lodash/array')
const collection = require('lodash/collection')

export default class extends Phaser.State {
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
    CollectableManager.initialize(this.game, this.gameWorld)
  }
  preload () {}

  create () {
    this.player = new Player(this.game, this.playerCollisionGroup)
    this.fillVisibleBlocksAndGenerateMoreIfNeeded(false)
    // Setup user input - TODO: Handle mobile touch
    if (!this.game.device.desktop) {
      this.game.input.addPointer()
    }
    this.userInput = this.game.device.desktop ? this.game.input.mousePointer : this.game.input.pointer1

    this.game.physics.p2.updateBoundsCollisionGroup()
    this.player.sprite.body.collides(this.enemyCollisionGroup, this.hitEnemy, this)
  }

  hitEnemy (body1, body2) {
    console.log("enemy hit")
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

        CollectableManager.addCoinsToBlock(block, 10)

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

    this.player.update()

    // UPDATE POLYGONS AND CHECK COLLISION
    let playerWallCollision = this.player.checkWallCollision(this.visiblePolygons)
    let playerStageElementCollision = this.player.checkStageElementCollision(this.visibleBlocks)

    if (playerWallCollision || playerStageElementCollision) {
      this.game.camera.shake(0.005, 100)
      this.player.slowDown()
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

    EnemyManager.updateMovement(this.blockMatrix)
  }

  setWorldPosition (scale) {
    let nW = this.game.width * scale
    let nH = this.game.height * scale
    let wD = (nW - this.game.width) / 2
    let hD = (nH - this.game.height) / 2
    this.gameWorld.position.setTo(-1 * wD, -1 * hD)
  }
}
