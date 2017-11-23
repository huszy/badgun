/* globals __DEV__ */
import Phaser from 'phaser'
import Player from '../sprites/Player'
import Block from '../sprites/Block'
import EnemySprite from '../sprites/Enemy'
import MapGenerator from './MapGenerator'

import Enemy from '../classes/Enemy'
import EnemyManager from '../classes/EnemyManager'

const array = require('lodash/array')
const math = require('lodash/math')
const collection = require('lodash/collection')

const WORLD_VELOCITY = 900
const PLAYER_TURN_VELOCITY = 30

export default class extends Phaser.State {

  constructor () {
    super()
    this.worldVelocity = WORLD_VELOCITY
    this.visibleBlocks = []
    this.blockMatrix = {data: []}
    this.currentBlockIndex = 0
    this.mapGenerator = new MapGenerator()

    for (var i = 0; i <= 100; i++) {
      this.mapGenerator.generateNext()
    }

    this.enemies = []
  }
  
  init () {
    this.gameWorld = this.game.add.group()
    this.gameWorld.position.setTo(0, 0)
    EnemyManager.initialize(this.game)
  }
  preload () {}

  create () {
    this.increment = 0.01
    this.worldScale = 1.25

    this.fillVisibleBlocksAndGenerateMoreIfNeeded(false)

    this.setupPlayer()
    // Setup user input
    if (!this.game.device.desktop) {
      this.game.input.addPointer()
    }
    this.userInput = this.game.device.desktop ? this.game.input.mousePointer : this.game.input.pointer1

    this.game.physics.startSystem(Phaser.Physics.ARCADE)
    // this.gameWorld.scale.set(1.25)
    // this.setWorldPosition(1.25)

  }

  setupPlayer () {
    this.playerDef = new Player({
      game: this.game,
      x: this.world.centerX,
      y: this.world.height - 300,
      asset: 'car'
    })
    //this.playerDef.inputEnabled = true
    //this.playerDef.input.enableDrag()
    //this.playerDef.input.allowVerticalDrag = false
    this.playerDef.anchor.set(0.5)

    let screenBounds = new Phaser.Rectangle(0, 0, this.game.width, this.game.height)

    this.player = this.game.add.existing(this.playerDef)
    // this.player.input.boundsRect = screenBounds
    // this.player.events.onDragUpdate.add(this.onPlayerDragMove, this)
    this.game.physics.enable(this.player, Phaser.Physics.ARCADE)
    this.player.body.maxAngular = 100
    this.player.body.angularDrag = 150
    this.player.body.collideWorldBounds = true
    this.player.body.bounce.set(0)
    this.player.body.immovable = true

    this.gameWorld.add(this.player)

    this.graphics = this.game.add.graphics(0, 0)

    var style = { font: "24px Arial", fill: "#000000", align: "left" };
    
    this.text = this.game.add.text(0, 20, "dummy", style);
    
  }

  /*
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
  } */

  fillVisibleBlocksAndGenerateMoreIfNeeded (shouldCleanup = true) {
    let hasEnough = false
    let updateBlockMatrix = false
    while (hasEnough === false) {
      while (this.mapGenerator.maps.length <= this.currentBlockIndex) {
        this.mapGenerator.generateNext()
      }
      let totalHeight = this.visibleBlocks.reduce((a, b) => a + b.height, 0)
      let lastBlockY = array.last(this.visibleBlocks) ? array.last(this.visibleBlocks).y : 0
      if (lastBlockY > -250) {
        console.log('newY: ', this.game.height - totalHeight)
        updateBlockMatrix = true
        let newBlock = new Block({
          game: this.game,
          x: 0,
          y: array.last(this.visibleBlocks) ? array.last(this.visibleBlocks).y : this.game.height,
          definition: this.mapGenerator.maps[this.currentBlockIndex]
        })
        const block = this.game.add.existing(newBlock)
        block.position.y -= block.height
        this.game.physics.enable(block, Phaser.Physics.ARCADE)
        block.body.velocity.y = this.worldVelocity
        this.gameWorld.add(block)
        this.visibleBlocks.push(block)
        if (this.player) {
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
      if (removed.length > 0) {
        updateBlockMatrix = true
        // console.log(removed.length, 'sprite destroyed')
        removed.forEach((sprite) => { sprite.destroy() })
      }
    }

    if (updateBlockMatrix) {
      this.blockMatrix.data = collection.sortBy(this.visibleBlocks, 'y').map(x => x._freeSpaceMap).reduce((a, b) => a.concat(b), [])
    }
  }

  render () {
    this.fillVisibleBlocksAndGenerateMoreIfNeeded()
    if(EnemyManager.enemies.length > 0) {
      this.game.debug.bodyInfo(EnemyManager.enemies[0].sprite, 0, 20)
    }
  }

  update (...args) {
    let userMoveDirection = 0
    if (this.userInput.isDown) {
      userMoveDirection = (this.userInput.x < this.game.width / 2) ? -1 : 1
    }
    if (this.game.input.keyboard.isDown(32)) {
      this.game.paused = !this.game.paused
    }
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT) || userMoveDirection === -1) {
      this.player.rotation = Phaser.Math.clamp(this.player.rotation - 0.02, -0.2, 0)
      if (this.player.body.velocity.x > 0) {
        this.player.body.velocity.x = 0
      }
      this.player.body.velocity.x = Phaser.Math.clamp(this.player.body.velocity.x - PLAYER_TURN_VELOCITY, -1 * PLAYER_TURN_VELOCITY * 20, 0)
    } else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) || userMoveDirection === 1) {
      this.player.rotation = Phaser.Math.clamp(this.player.rotation + 0.02, 0, 0.2)
      if (this.player.body.velocity.x < 0) {
        this.player.body.velocity.x = 0
      }
      this.player.body.velocity.x = Phaser.Math.clamp(this.player.body.velocity.x + PLAYER_TURN_VELOCITY, 0, PLAYER_TURN_VELOCITY * 20)  
    } else {
      if (this.player.body.velocity.x > 0) {
        this.player.body.velocity.x = Math.min(this.player.body.velocity.x - PLAYER_TURN_VELOCITY * 1.75, 0)
      } else if (this.player.body.velocity.x < 0) {
        this.player.body.velocity.x = Math.max(this.player.body.velocity.x + PLAYER_TURN_VELOCITY * 1.75, 0)
      }
      this.game.add.tween(this.player).to({ rotation: this.player.rotation * -1 }, 100, "Linear", true)
    }

    let isAccelerating = false
    if (this.game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
      this.player.body.velocity.y -= 10
      isAccelerating = true
    }

    if (this.game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
      this.player.body.velocity.y += 10
      isAccelerating = true
    }

    if (!isAccelerating && this.player.body.velocity.y < 0) {
      this.player.body.velocity.y = Math.max(this.player.body.velocity.y + 10 * 1.75, 0)
    }
    if (!isAccelerating && this.player.body.velocity.y > 0) {
      this.player.body.velocity.y = Math.min(this.player.body.velocity.y - 10 * 1.75, 0)
    }

    this.graphics.clear()

    let visiblePolygons = []
    this.visibleBlocks.forEach((block) => {
      block.offRoadPolygons.forEach((offRoadPoly) => {
        let points = offRoadPoly._points.map((point, index) => {
          return [point.x, point.y + block.y]
        })
        visiblePolygons.push(new Phaser.Polygon(points))
      })
    })

    // console.log(array.last(this.visibleBlocks.filter((x) => x.position.y > 0)).definition.sprite)
    // this.text.text = array.last(this.visibleBlocks.filter((x) => x.position.y > 0)).definition.sprite

    this.playerCollided = false

    visiblePolygons.forEach((poly) => {
      if (poly.contains(this.player.x, this.player.y) ||
          poly.contains(this.player.x - this.player.width / 2, this.player.y - this.player.height / 2) ||
          poly.contains(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2))
      {
        this.playerCollided = true
        this.playerSlowdownVelocity = 5
      }

      /*
      this.graphics.beginFill(0xFF33ff)
      this.graphics.drawPolygon(poly.points)
      this.graphics.endFill() */
    })

    // DRAW FREE SPACES
    /*
    this.visibleBlocks.forEach((block) => {
      // Draw areas
      for (var i=0; i< block._freeSpaceMap.length; i++) {
        let y = Math.floor(i / 6)
        let x = i - (y * 6)
        if (block._freeSpaceMap[i] === 1) {
          this.graphics.beginFill(0xFF0000)
          this.graphics.drawRect((x*125) + 10, (y*125) + 10 + block.y, 105, 105)
          this.graphics.endFill()
        }
      }
    }) */ 

    // console.log("HasCollision: " + hasCollision)
    /*
    // POLY TEST
    let newPoly = this.poly
    this.poly._points.forEach((point,index) => {
      newPoly._points[index].y = point.y + this.visibleBlocks[0].y
    })

    //console.dir(this.visibleBlocks[0].y)
    let playerCoords = this.player.x
    //this.graphics.clear();
    
        if (this.poly.contains(this.player.x, this.player.y) ||
            this.poly.contains(this.player.x - this.player.width / 2, this.player.y - this.player.height / 2) ||
            this.poly.contains(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2))
        {
            console.log("GOT HIT!!!!")
        }
    
        //this.graphics.beginFill(0xff0000);
        //this.graphics.drawPolygon(newPoly.points);
        //this.graphics.endFill();
        */

    // LOG CURRENT VISIBLE FREESPACEMAP
    let lastY = math.minBy(this.visibleBlocks, function (o) { return o.y }).y
    let visibleYStart = Math.floor(Math.abs(lastY) / 125)
    let startIdx = visibleYStart * 6
    let text = "" + this.blockMatrix.data.slice(startIdx, startIdx + 66).join(' ')
    this.text.text = text.replace(/(.{12})/g, "$1\n")

    // Add an enemy
    /*
    if (this.enemies.length < 3) {
      let enemyDef = new EnemySprite({
        game: this.game,
        x: 250 + (125 / 2),
        y: -125,
        asset: 'enemy'
      })
      let enemy = new Enemy(enemyDef, this.game, { worldCurrentVelocity: this.worldVelocity, worldMaxVelocity: WORLD_VELOCITY, velocity: 300 + (Math.random() * 400) })
      this.enemies.push(enemy)
    } */
    if (EnemyManager.enemies.length < 1) {
      EnemyManager.addRandomEnemy(this.worldVelocity, WORLD_VELOCITY)
    }

    // Update enemies
    /*
    let firstBlockY = math.minBy(this.visibleBlocks, 'y').y
    let bm = JSON.parse(JSON.stringify(this.blockMatrix))
    this.enemies.forEach(x => { bm.data[x.getPositionData(firstBlockY).idx] = 2 })
    this.enemies.forEach(x => { x.update(bm, firstBlockY); if (x.sprite.y > this.game.height + 100) { this.removeEnemy(x) } })

    this.enemies.forEach(x => this.game.physics.arcade.collide(this.player, x.sprite, this.playerCollisionCallback.bind(this)))
    */

    let firstBlockY = math.minBy(this.visibleBlocks, 'y').y
    let enemyCollision = EnemyManager.updateEnemies(this.blockMatrix, firstBlockY, this.player)
    if (enemyCollision) {
      console.log("Collided")
      this.playerCollided = true
      this.playerSlowdownVelocity = 75
    }

    // Speedup world or slowDown
    if (this.playerCollided) {
      this.game.camera.shake(0.005, 100)
      this.worldVelocity = Math.max(this.worldVelocity - this.playerSlowdownVelocity, 200)
      this.visibleBlocks.forEach(x => { x.body.velocity.y = this.worldVelocity })
      EnemyManager.setWorldVelocity(this.worldVelocity)
      // this.enemies.forEach(x => { x.worldCurrentVelocity = this.worldVelocity })
      // console.log("World velocity: "+this.worldVelocity)
    } else {
      this.worldVelocity = Math.min(this.worldVelocity + 25, WORLD_VELOCITY)
      this.visibleBlocks.forEach(x => { x.body.velocity.y = this.worldVelocity })
      EnemyManager.setWorldVelocity(this.worldVelocity)
      // this.enemies.forEach(x => { x.worldCurrentVelocity = this.worldVelocity })
      // console.log("World velocity: "+this.worldVelocity)
    }

    this.game.debug.text( "World velocity: "+this.worldVelocity, 400, 10 );
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
