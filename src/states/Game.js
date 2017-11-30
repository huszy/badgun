/* globals __DEV__ */
// Layers: blocks, collectable, enemy, player, stage deco
import Phaser from 'phaser'
import Block from '../sprites/Block'
import MapGenerator from './MapGenerator'

import Player from '../classes/Player'
import { STATE_NORMAL, STATE_COLLIDED } from '../classes/Player'
import EnemyManager from '../classes/EnemyManager'
import CollectableManager from '../classes/CollectableManager'
import Helicopter from '../sprites/Helicopter'
import SoundManager from '../classes/SoundManager'

const array = require('lodash/array')
const collection = require('lodash/collection')
const string = require('lodash/string')

const THEME_TIME_IN_SECONDS = 30

const GAME_STATE_NOT_STARTED = 'not_started'
const GAME_STATE_COUNTDOWN = 'countdown'
const GAME_STATE_STARTED = 'started'
const GAME_STATE_PAUSED = 'paused'
const GAME_STATE_GAMEOVER = 'gameover'

export default class extends Phaser.State {
  gameConfig = {
    stage: 0,
    currentState: GAME_STATE_NOT_STARTED,
    mapTilesNeededForStage: 18,
    mapTilesNeededTotal: 18,
    themesAvailable: ['desert', 'vulcano', 'city', 'woods', 'snow', 'neon'],
    requiredEnemies: 3,
    enemyAppearInterval: 1500,
    currentScore: 0,
    gameStartTime: 0
  }

  visibleBlocks = []
  visiblePolygons = []
  visibleStageElements = []
  enemies = []

  // Groups
  gameWorld = null
  collectablesGroup = null
  enemyGroup = null
  playerGroup = null
  decorationGroup = null
  helicopterGroup = null

  constructor () {
    super()
    this.blockMatrix = {data: []}
    this.currentBlockIndex = 0
    this.mapGenerator = new MapGenerator()

    /*
    for (var i = 0; i <= this.gameConfig.ma; i++) {
      this.mapGenerator.generateNext(this.gameConfig.currentTheme)
    }*/
  }

  init () {
    this.game.badgun = this
    this.game.world.resize(this.game.world.width, 1250 * 40000)
    this.gameWorld = this.game.add.group()
    this.collectablesGroup = new Phaser.Group(this.game, undefined, 'collectables', false, true)
    this.enemyGroup = new Phaser.Group(this.game, undefined, 'enemies', false, true)
    this.playerGroup = new Phaser.Group(this.game, undefined, 'player', false, true)
    this.decorationGroup = new Phaser.Group(this.game, undefined, 'deco', false, true)
    this.helicopterGroup = new Phaser.Group(this.game, undefined, 'helicopter', false, true)
    this.gameWorld.position.setTo(0, 0)
    this.game.physics.startSystem(Phaser.Physics.P2JS)
    this.game.physics.p2.pause()
    this.game.physics.p2.setImpactEvents(true)
    this.game.physics.p2.restitution = 0.5
    // this.game.physics.p2.useElapsedTime = false

    /*
    Phaser.Physics.P2.update = function () {
      if (this.paused)
      {
          return;
      }

      this.world.step(this.game.time.now);
    } */

    this.playerCollisionGroup = this.game.physics.p2.createCollisionGroup()
    this.enemyCollisionGroup = this.game.physics.p2.createCollisionGroup()
    CollectableManager.initialize(this.game, this.collectablesGroup)
    EnemyManager.initialize(this.game, this.enemyGroup, this.enemyCollisionGroup, this.playerCollisionGroup)
    SoundManager.initialize(this.game)

    window.CollectableManager = CollectableManager
    window.EnemyManager = EnemyManager

    // UI
    this.timeElement = document.getElementById('timeLeft')
    this.scoreElement = document.getElementById('score')
    this.speedElement = document.getElementById('speed')
  }

  preload () {
    // this.game.forceSingleUpdate = true
    this.game.load.script('particlestorm', 'vendor/particle-storm.min.js')
  }

  getThemeForStage (stage) {
    return array.nth(this.gameConfig.themesAvailable, stage % this.gameConfig.themesAvailable.length)
  }

  calculateMapNeededForStage (stage) {
    let playerConfig = this.player.getPlayerConfigForStage(stage)
    let pixelPerSec = -1 * playerConfig.initialVelocity
    let totalPixel = pixelPerSec * (THEME_TIME_IN_SECONDS) - 1000 // -1000: player position on screen
    let mapTileNumber = Math.floor(totalPixel / 1250)

    console.log(`stage: ${stage} playerSpeed: ${playerConfig.initialVelocity}, pixelPerSec: ${pixelPerSec}, totalPixel: ${totalPixel}, mapTileNum: ${mapTileNumber}`)

    return mapTileNumber
  }

  generateMapForStage (theme, tilesNeeded) {
    for (var i = 0; i < tilesNeeded; i++) {
      this.mapGenerator.generateNext(theme)
    }
    // Add the finish line at the end of stage
    this.mapGenerator.maps[this.mapGenerator.maps.length - 1].stageEnd = true
  }

  checkPointReached () {
    // Generate next stage
    this.gameConfig.stage++
    let nextStage = this.gameConfig.stage + 1
    this.generateMapForStage(this.getThemeForStage(nextStage), this.calculateMapNeededForStage(nextStage))
    this.player.playerConfig = this.player.getPlayerConfigForStage(this.gameConfig.stage)
  }

  create () {
    this.player = new Player(this.game, this.playerGroup, this.playerCollisionGroup)
    this.player.playerConfig = this.player.getPlayerConfigForStage(this.gameConfig.stage)
    // Generate first two stage
    this.generateMapForStage(this.getThemeForStage(0), this.calculateMapNeededForStage(0) - 5)
    this.generateMapForStage(this.getThemeForStage(1), this.calculateMapNeededForStage(1))

    // Setup user input - TODO: Handle mobile touch
    if (!this.game.device.desktop) {
      this.game.input.addPointer()
    }
    this.userInput = this.game.device.desktop ? this.game.input.mousePointer : this.game.input.pointer1

    this.game.physics.p2.updateBoundsCollisionGroup()
    this.player.sprite.body.collides(this.enemyCollisionGroup, this.hitEnemy, this)

    this.helicopter = new Helicopter({game: this.game, x: -400, y: this.player.sprite.y})
    this.helicopterGroup.add(this.helicopter)

    this.game.camera.y = this.player.sprite.body.y - 3 * (this.game.height / 4)

    // Countdown
    this.onCountDownComplete = new Phaser.Signal()
    this.onCountDownComplete.add(this.countDownComplete.bind(this), this)

    this.game.load.atlas('countDown', 'assets/images/counter.png', 'assets/images/countersprites.json')
    this.countDownSprite = this.game.add.sprite(this.game.camera.view.centerX, this.game.camera.view.centerY, 'countDown')
    this.countDownSprite.anchor.set(0.5)
    this.countDownAnim = this.countDownSprite.animations.add('countdown', Phaser.Animation.generateFrameNames('counter', 0, 71, '', 5), 24, false)
    this.countDownAnim.loop = false
    this.countDownAnim.onComplete = this.onCountDownComplete

    this.startCountDown()
  }

  countDownComplete () {
    this.countDownSprite.destroy()
    this.startGame()
  }

  startCountDown () {
    this.gameConfig.currentState = GAME_STATE_COUNTDOWN
    this.countDownAnim.play()
  }

  startGame () {
    this.gameConfig.gameStartTime = this.game.time.now
    this.game.physics.p2.resume()
    this.gameConfig.currentState = GAME_STATE_STARTED

    this.player.startCarEngine()
  }

  hitEnemy (body1, body2) {
    // console.log("enemy hit")
  }

  fillVisibleBlocksAndGenerateMoreIfNeeded (shouldCleanup = true) {
    let hasEnough = false
    let updateBlockMatrix = false
    while (hasEnough === false) {

      // console.log(this.mapGenerator.maps.length, this.gameConfig.themeChangeCount, this.gameConfig.currentTheme)
      // let totalHeight = this.visibleBlocks.reduce((a, b) => a + b.height, 0)
      let lastBlockY = array.last(this.visibleBlocks) ? array.last(this.visibleBlocks).y : this.game.world.height

      // console.log(lastBlockY, this.game.camera.view.y)
      if (lastBlockY > this.game.camera.view.y - 1000) {
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
        block.stageElements.forEach(elem => this.decorationGroup.add(elem))
        this.visibleBlocks.push(block)

        CollectableManager.addCoinsToBlock(block, Math.min(Math.max(this.gameConfig.stage, 3), 10))

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
  }

  update (...args) {
    if (this.gameConfig.currentState !== GAME_STATE_STARTED) { return }

    if (this.game.input.keyboard.isDown(32) && __DEV__) {
      this.game.paused = !this.game.paused
    }

    this.player.update()

    // UPDATE POLYGONS AND CHECK COLLISION
    if (this.player.playerConfig.state === STATE_NORMAL) {
      this.handlePlayerCollisions()
    
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
        EnemyManager.addRandomEnemyIfNeeded(62.5 + (collection.sample(availableSpaces) * 125), this.game.camera.view.y - 200, this.gameConfig, this.game.time.elapsedMS)
      }

      EnemyManager.updateMovement(this.blockMatrix)
    }

    // Update times
    let totalTime = ((this.gameConfig.stage + 1) * (THEME_TIME_IN_SECONDS * 1000))
    let timeLeft = totalTime - (this.game.time.now - this.gameConfig.gameStartTime - this.game.time.pauseDuration)
    this.updateTimeLeft(Math.max(timeLeft, 0))
    if (timeLeft < 25000) {
      // GAMEOVER
      this.gameConfig.currentState = GAME_STATE_GAMEOVER
      this.handleGameOver()
      return
    }

    this.speedElement.innerHTML = Math.round((this.player.sprite.body.velocity.my / 1000) * 3600)
  }

  handleGameOver () {
    this.game.physics.p2.pause()
    this.game.camera.fade('#000000', 500, 0, true)
    SoundManager.shouldStopLoop = true
    SoundManager.fadeOutSounds()
    this.player.fadeOutCarEngine()
  }

  handlePlayerCollisions () {
    let playerWallCollision = this.player.checkWallCollision(this.visiblePolygons)
    let playerStageElementCollision = this.player.checkStageElementCollision(this.visibleBlocks)
    let playerCollectablesCollision = this.player.checkCollectableCollision(CollectableManager.collectables)

    if (playerCollectablesCollision.length > 0) {
      let pointsToAdd = playerCollectablesCollision.reduce((c, a) => { return a.pointValue + c }, 0)
      if (pointsToAdd > 0) {
        this.gameConfig.currentScore += pointsToAdd
        this.updatePoints()
      }
      CollectableManager.removeCollectables(playerCollectablesCollision)
    }

    if (playerStageElementCollision) {
      if (playerStageElementCollision.poly.isFinishLine === true) {
        if (playerStageElementCollision.poly.isCrossed === false) {
          playerStageElementCollision.poly.isCrossed = true
          this.checkPointReached()
          return
        }
        return
      } else {
        this.player.startRecoveryAnimation()
        return
      }
    }

    if (playerWallCollision) {
      this.game.camera.shake(0.005, 100)
      this.player.slowDown()
    }

    if (playerWallCollision) {
      if (!this.startedEffect) {
        this.startedEffect = true
        this.player.startCrashEffect()
      }
    }
  }

  updateTimeLeft (msec) {
    let sec = Math.floor(msec / 1000)
    let min = 0
    if (sec >= 60) {
      min = Math.floor(sec / 60)
      sec -= min * 60
    }
    let ms = msec - (min * 60 * 1000) - (sec * 1000)
    ms = Math.round(ms / 10)
    this.timeElement.innerHTML = `${string.padStart(min, 2, '0')}:${string.padStart(sec, 2, '0')}.${string.padStart(ms, 2, '0')}`
  }

  updatePoints () {
    this.scoreElement.innerHTML = this.gameConfig.currentScore
  }

  setWorldPosition (scale) {
    let nW = this.game.width * scale
    let nH = this.game.height * scale
    let wD = (nW - this.game.width) / 2
    let hD = (nH - this.game.height) / 2
    this.gameWorld.position.setTo(-1 * wD, -1 * hD)
  }
}
