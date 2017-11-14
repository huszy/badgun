/* globals __DEV__ */
import Phaser from 'phaser'
import Mushroom from '../sprites/Mushroom'
import Player from '../sprites/Player'
import Block from '../sprites/Block'
import MapGenerator from './MapGenerator'

const array = require('lodash/array')

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

    this.playerDef = new Player({
      game: this.game,
      x: this.world.centerX,
      y: this.world.centerY,
      asset: 'car'
    })
    this.playerDef.inputEnabled = true
    this.playerDef.input.enableDrag()
    this.playerDef.anchor.set(0.5)
    // Setup user input
    if(!this.game.device.desktop) {
      this.game.input.addPointer()
    }
    this.userInput = this.game.device.desktop ? this.game.input.mousePointer : this.game.input.pointer1

    this.gameWorld.scale.set(1.25)
    this.setWorldPosition(1.25)
    
    this.player = this.game.add.existing(this.playerDef)

    this.gameWorld.add(this.player)

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
          y: array.last(this.visibleBlocks) ? array.last(this.visibleBlocks).y : 0,
          definition: this.mapGenerator.maps[this.currentBlockIndex]
        })
        const block = this.game.add.existing(newBlock)
        block.position.y -= block.height
        this.game.physics.enable(block, Phaser.Physics.ARCADE)
        block.body.velocity.y = 300
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
      this.visibleBlocks.splice(0, visibleItemIndex)
    }
  }

  render () {
    this.fillVisibleBlocksAndGenerateMoreIfNeeded()
    this.handleUserInput()
  }

  handleUserInput () {
    if (this.userInput.isDown) {
      // Zoom out
      if (this.worldScale > 1) {
        this.worldScale -= this.increment
        this.gameWorld.scale.set(this.worldScale)
        this.setWorldPosition(this.worldScale)
      }
    } else {
      if (this.worldScale < 1.25) {
        this.worldScale += this.increment
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
