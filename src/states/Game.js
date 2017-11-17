/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import Player from '../sprites/Player'
import Block from '../sprites/Block'
import MapGenerator from './MapGenerator'

const array = require('lodash/array')

const VELOCITY = 800
const PLAYER_TURN_VELOCITY = 30

export default class extends Phaser.State {

  constructor () {
    super()
    this.visibleBlocks = []
    this.currentBlockIndex = 0
    this.mapGenerator = new MapGenerator()

    for (var i = 0; i <= 100; i++) {
      this.mapGenerator.generateNext()
    }
  }
  
  init () {}
  preload () {}

  create () {
    this.increment = 0.01
    this.worldScale = 1.25

    this.gameWorld = this.game.add.group()
    this.gameWorld.position.setTo(0, 0)

    this.fillVisibleBlocksAndGenerateMoreIfNeeded(false)

    console.dir(this.mapGenerator.maps)

    if (window.devicePixelRatio === 2) {
      this.game.scale.setUserScale(0.5, 0.5)
      this.game.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
    }

    this.setupPlayer()
    // Setup user input
    if (!this.game.device.desktop) {
      this.game.input.addPointer()
    }
    this.userInput = this.game.device.desktop ? this.game.input.mousePointer : this.game.input.pointer1

    this.gameWorld.scale.set(1.25)
    this.setWorldPosition(1.25)
  }

  setupPlayer () {
    this.playerDef = new Player({
      game: this.game,
      x: this.world.centerX,
      y: this.world.height - 300,
      asset: 'car'
    })
    this.playerDef.inputEnabled = true
    this.playerDef.input.enableDrag()
    this.playerDef.input.allowVerticalDrag = false
    this.playerDef.anchor.set(0.5)

    let screenBounds = new Phaser.Rectangle(0, 0, this.game.width, this.game.height)

    this.player = this.game.add.existing(this.playerDef)
    this.player.input.boundsRect = screenBounds
    this.player.events.onDragUpdate.add(this.onPlayerDragMove, this)
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE)
    this.player.body.maxAngular = 100
    this.player.body.angularDrag = 150

    this.gameWorld.add(this.player)
  }

  onPlayerDragMove (player, origPointer, newX, newY, snapPoint, isFirst) {
    if (isFirst) {
      this.playerDragOrigin = { x: origPointer.x, y: origPointer.y }
      console.dir(origPointer)
    }
    let treshold = Math.abs(this.playerDragOrigin.x - newX)
    console.log(treshold)
    if (treshold >= 10) {
      this.playerDragOrigin.x = newX
      this.playerDragOrigin.y = newY
    }
    if (newX < this.playerDragOrigin.x) {
      this.game.add.tween(player).to( { angle: -5 }, 200, Phaser.Easing.Linear.None, true)
    }
    if (newX > this.playerDragOrigin.x) {
      this.game.add.tween(player).to( { angle: 5 }, 200, Phaser.Easing.Linear.None, true)
    }
  }

  fillVisibleBlocksAndGenerateMoreIfNeeded (shouldCleanup = true) {
    let hasEnough = false
    while (hasEnough === false) {
      while (this.mapGenerator.maps.length <= this.currentBlockIndex) {
        this.mapGenerator.generateNext()
      }
      let totalHeight = this.visibleBlocks.reduce((a, b) => a + b.height, 0)
      let lastBlockY = array.last(this.visibleBlocks) ? array.last(this.visibleBlocks).y : 0
      if (lastBlockY >= -100) {
        console.log("newY: ", this.game.height - totalHeight)
        let newBlock = new Block({
          game: this.game,
          x: 0,
          y: array.last(this.visibleBlocks) ? array.last(this.visibleBlocks).y : this.game.height,
          definition: this.mapGenerator.maps[this.currentBlockIndex]
        })
        const block = this.game.add.existing(newBlock)
        block.position.y -= block.height
        this.game.physics.enable(block, Phaser.Physics.ARCADE)
        block.body.velocity.y = VELOCITY
        this.gameWorld.add(block)
        this.visibleBlocks.push(block)
        if(this.player) {
          this.gameWorld.bringToTop(this.player)
        }
        this.currentBlockIndex++
        hasEnough = false
      } else {
        hasEnough = true
      }
    }
    // Cleanup visible items
    if (shouldCleanup) {
      let visibleItemIndex = this.visibleBlocks.findIndex((block) => {
        return block.inWorld === true
      })
      let removed = this.visibleBlocks.splice(0, visibleItemIndex)
      if(removed.length > 0) {
        console.log(removed.length, "sprite destroyed")
        removed.forEach((sprite) => { sprite.destroy() })
      }
    }
  }

  render () {
    this.fillVisibleBlocksAndGenerateMoreIfNeeded()
  }

  update () {
    this.handleUserInput()
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
    {
      this.player.rotation = Phaser.Math.clamp(this.player.rotation - 0.02, -0.2, 0)
      if(this.player.body.velocity.x > 0) {
        this.player.body.velocity.x = 0
      }
      this.player.body.velocity.x -= PLAYER_TURN_VELOCITY
    }
    else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
    {
      this.player.rotation = Phaser.Math.clamp(this.player.rotation + 0.02, 0, 0.2)
      //this.player.rotation += 0.05
      if(this.player.body.velocity.x < 0) {
        this.player.body.velocity.x = 0
      }
      this.player.body.velocity.x += PLAYER_TURN_VELOCITY
    } else {
      if(this.player.body.velocity.x > 0) {
        this.player.body.velocity.x -= PLAYER_TURN_VELOCITY * 1.75
      } else if(this.player.body.velocity.x < 0) {
        this.player.body.velocity.x += PLAYER_TURN_VELOCITY * 1.75
      }
      this.game.add.tween(this.player).to({ rotation: this.player.rotation * -1 }, 100, "Linear", true)
    }
  }

  handleUserInput () {
    if (this.userInput.isDown) {
      // console.dir(this.userInput)
      // Zoom out
      if (this.worldScale > 1) {
        this.worldScale -= this.increment
        // this.gameWorld.scale.x = this.worldScale
        this.gameWorld.scale.set(this.worldScale)
        this.setWorldPosition(this.worldScale)
      }
    } else {
      if (this.worldScale < 1.25) {
        this.worldScale += this.increment
        //this.gameWorld.scale.x = this.worldScale
        this.gameWorld.scale.set(this.worldScale)
        this.setWorldPosition(this.worldScale)
      }
    }
  }

  setWorldPosition (scale) {
    let nW = this.game.width * scale
    let nH = this.game.height * scale
    let wD = (nW - this.game.width) / 2
    let hD = (nH - this.game.height) / 2
    this.gameWorld.position.setTo(-1 * wD, -1 * hD)
  }
}
