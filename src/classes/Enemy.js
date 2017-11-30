import Phaser from 'phaser'
import { setTimeout, clearTimeout } from 'timers'
import { debugHTML } from '../utils'

const EMPTY_SPACE = 1
const WALL = 0
const ENEMY = 2
const PLAYER = 3

const STATE_AUTOPILOT = 'autopilot'
const STATE_INCONTACT = 'incontact'
const STATE_DRIFTING = 'drifting'
const STATE_RECOVERING = 'recovering'
const STATE_RECOVERING_LANE = 'recovering_lane'

export default class Enemy {
  currentState = STATE_AUTOPILOT
  onContactBegin = new Phaser.Signal()
  onContactEnd = new Phaser.Signal()
  isMoving = false
  isInContact = false
  isRecovering = false
  recoveryTimeout = null
  recoveryTime = 100
  possibleMovementMatrix = { w: null, nw: null, n: null, ne: null, e: null }

  acceleration = 30

  constructor (spriteDef, game, group, collisionGroup, enemyDefinition = {}) {
    this.sprite = game.add.existing(spriteDef)
    this.enemyDefinition = enemyDefinition
    this.game = game
    this.group = group
    this.group.add(this.sprite)
    
    this.generatedSpeed = ((Math.random() * 0.6) + 0.4) * this.game.state.getCurrentState().player.playerConfig.initialVelocity

    // Setup physics
    this.sprite.body.setCollisionGroup(collisionGroup)
    this.sprite.body.collideWorldBounds = false
    this.sprite.body.angularDamping = 1
    this.sprite.body.damping = 0.1
    this.sprite.body.velocity.y = this.generatedSpeed
    this.sprite.body.mass = enemyDefinition.mass || 1
    
    this.stopMoving = this._stopMoving.bind(this)
    this.recoveryFinished = this._onRecoveryFinished.bind(this)

    this.onContactBegin.add(this._onContactBegin.bind(this))
    this.onContactEnd.add(this._onContactEnd.bind(this))

    this.sprite.body.onBeginContact = this.onContactBegin
    this.sprite.body.onEndContact = this.onContactEnd
  }

  _onContactBegin () {
    // console.log('contact begin')
    this.currentState = STATE_INCONTACT
    if (this.recoveryTimeout != null) {
      clearTimeout(this.recoveryTimeout)
      this.recoveryTimeout = null
    }
  }

  _onContactEnd () {
    // console.log('contact end')
    this.currentState = STATE_DRIFTING
    if (this.recoveryTimeout != null) {
      clearTimeout(this.recoveryTimeout)
      this.recoveryTimeout = null
    }
    this.recoveryTimeout = setTimeout(this.recoveryFinished, this.recoveryTime)
  }

  _onRecoveryFinished () {
    // console.log('recovery finished')
    this.currentState = STATE_RECOVERING
  }

  getBlockPositionOnScreen (blockMatrix) {
    let startY = blockMatrix.startY
    let topPos = (this.sprite.body.y - startY - (this.sprite.height / 2))
    let x = Math.floor(this.sprite.body.x / 125)
    let y = Math.floor(topPos / 125)
    let idx = y * 6 + x
    return { x: x, y: y, idx: idx }
  }

  setBlockPositionOnBlockMatrix (blockMatrix) {
    let position = this.getBlockPositionOnScreen(blockMatrix)
    blockMatrix.data[position.idx] = ENEMY
  }

  _createPossibleMovementMatrix (blockMatrix) {
    let selfData = this.getBlockPositionOnScreen(blockMatrix)
    this.possibleMovementMatrix = { w: null, nw: null, n: null, ne: null, e: null, selfData: selfData }
    if (selfData.x < 0) {
      this.possibleMovementMatrix.w = null
      this.possibleMovementMatrix.nw = null
      this.possibleMovementMatrix.n = null
      this.possibleMovementMatrix.ne = EMPTY_SPACE
      this.possibleMovementMatrix.e = EMPTY_SPACE
    } else if (selfData.x >= 0 && selfData.x <= 5) {
      if (selfData.x > 0) {
        this.possibleMovementMatrix.w = this._getFreeCellByDirection(blockMatrix.data, selfData, { x: -1, y: -1 })
        this.possibleMovementMatrix.nw = this._getFreeCellByDirection(blockMatrix.data, selfData, { x: -1, y: -1 })
      }
      if (selfData.x < 5) {
        this.possibleMovementMatrix.e = this._getFreeCellByDirection(blockMatrix.data, selfData, { x: 1, y: -1 })
        this.possibleMovementMatrix.ne = this._getFreeCellByDirection(blockMatrix.data, selfData, { x: 1, y: -1 })
      }
      this.possibleMovementMatrix.n = this._getFreeCellByDirection(blockMatrix.data, selfData, { x: 0, y: -1 })
    } else if (selfData.x > 5) {
      this.possibleMovementMatrix.w = EMPTY_SPACE
      this.possibleMovementMatrix.nw = EMPTY_SPACE
      this.possibleMovementMatrix.n = null
      this.possibleMovementMatrix.ne = null
      this.possibleMovementMatrix.e = null
    }

    // IF enemy stuck somehow, try to recover it
    if (this.possibleMovementMatrix.ne !== EMPTY_SPACE && this.possibleMovementMatrix.nw !== EMPTY_SPACE && this.possibleMovementMatrix.n !== EMPTY_SPACE) {
      if (selfData.x > 0) {
        this.possibleMovementMatrix.nw = EMPTY_SPACE
      } else {
        this.possibleMovementMatrix.ne = EMPTY_SPACE
      }
    }
  }

  updateMovement (blockMatrix) {
    this._createPossibleMovementMatrix(blockMatrix)

    let speedDiff = Math.abs(this.sprite.body.velocity.y - this.generatedSpeed)
    
    if (speedDiff > 4) {
      if (this.sprite.body.velocity.y > this.generatedSpeed) {
        this.sprite.body.thrust(this.acceleration * 30)
      } else if (this.sprite.body.velocity.y < this.generatedSpeed) {
        this.sprite.body.thrust(-1 * this.acceleration * 20)
      }
    } else {
      // speedRecovered = true
    }

    /* // DEBUG AUTOPILOT INFO
    let dy = this.sprite.y - this.game.camera.view.y - this.sprite.height / 2
    this.game.debug.text(`L: ${this.possibleMovementMatrix.selfData.x} NW: ${this.possibleMovementMatrix.nw}, N: ${this.possibleMovementMatrix.n}, NE: ${this.possibleMovementMatrix.ne}`, this.sprite.x - this.sprite.width, dy, '#ff0000')
    */

    if (this.currentState === STATE_DRIFTING) { return }
    if (this.currentState === STATE_INCONTACT) { return }
    if (this.currentState === STATE_RECOVERING_LANE) { return }

    if (this.currentState === STATE_RECOVERING) {
      let speedRecovered = true
      let rotationRecovered = false
      this.sprite.body.velocity.x = 0

      // Get back to normal y speed
      

      /*
      if (this.sprite.body.velocity.y < this.generatedSpeed) {
        this.sprite.body.velocity.y = Math.min(this.sprite.body.velocity.y + this.acceleration, this.generatedSpeed)
      } else if (this.sprite.body.velocity.y > this.generatedSpeed) {
        this.sprite.body.velocity.y = Math.max(this.sprite.body.velocity.y - this.acceleration, this.generatedSpeed)
      } else {
        speedRecovered = true
      } */

      // Get back to normal rotation
      if (this.sprite.rotation > 0) {
        this.sprite.body.rotation = Math.max(this.sprite.rotation - 0.02, 0)
      } else if (this.sprite.rotation < 0) {
        this.sprite.body.rotation = Math.min(this.sprite.rotation + 0.02, 0)
      } else {
        rotationRecovered = true
      }

      if (rotationRecovered && speedRecovered) {
        this.currentState = STATE_RECOVERING_LANE
        this._recoverLane()
        return
      } else {
        // console.log("rotation: "+rotationRecovered+" - speed: "+speedRecovered)
      }
    }

    if (this.isMoving) { return }
    // Move if needed
    if (this.possibleMovementMatrix.n !== EMPTY_SPACE) {
      if (this.possibleMovementMatrix.nw === EMPTY_SPACE) {
        this._moveLeftP2()
      } else if (this.possibleMovementMatrix.ne === EMPTY_SPACE) {
        this._moveRightP2()
      }
    }
  }

  _recoverLane () {
    // Get back to normal lane
    let idealLane = Math.min(Math.max(0, this.possibleMovementMatrix.selfData.x), 5)
    let idealLanePos = idealLane * 125 + (125 / 2)

    if (Math.floor(this.sprite.body.x) === idealLanePos) {
      this.currentState = STATE_AUTOPILOT
      return
    }

    let laneDiff = idealLanePos - this.sprite.body.x
    // console.log(`Ideal lane: ${idealLanePos} - current: ${this.sprite.body.x}`)

    this.sprite.body.velocity.x = 0
    let recoverTween = this.game.add.tween(this.sprite.body)
    recoverTween.to({x: idealLanePos}, 300, 'Linear')
    recoverTween.onComplete.add(this._laneRecovered, this)
    recoverTween.start()
  }

  _laneRecovered () {
    this.currentState = STATE_AUTOPILOT
  }

  _stopMoving () {
    this.isMoving = false
    this.sprite.body.velocity.x = 0
  }

  _moveLeftP2 () {
    // console.log("MOVE LEFT")
    this.isMoving = true
    this.moveTween = this.game.add.tween(this.sprite.body)
    this.sprite.body.velocity.x = 0
    this.sprite.body.rotation = -0.2
    this.moveTween.to({x: this.sprite.body.x - 125}, 300, "Linear")
    this.moveTween.onComplete.add(this.moveEnded.bind(this), this)
    this.moveTween.start()
  }

  _moveRightP2 () {
    // console.log("MOVE RIGHT")
    this.isMoving = true
    this.moveTween = this.game.add.tween(this.sprite.body)
    this.sprite.body.velocity.x = 0
    this.sprite.body.rotation = 0.2
    this.moveTween.to({x: this.sprite.body.x + 125}, 300, "Linear")
    this.moveTween.onComplete.add(this.moveEnded.bind(this), this)
    this.moveTween.start()
  }

  _moveLeft () {
    this.isMoving = true
    this.moveTween = this.game.add.tween(this.sprite)
    
    this.moveTween.to({x: this.sprite.x - 125}, 300, "Linear")
    this.game.add.tween(this.sprite).to({rotation: -0.2}, 50, "Linear", true)
    this.game.add.tween(this.sprite).to({rotation: 0}, 50, "Linear", true, 250)
    this.moveTween.onComplete.add(this.moveEnded.bind(this), this)
    this.moveTween.start()
  }

  _moveRight () {
    this.isMoving = true
    this.moveTween = this.game.add.tween(this.sprite)
    
    this.moveTween.to({x: this.sprite.x + 125}, 300, "Linear")
    this.game.add.tween(this.sprite).to({rotation: 0.2}, 50, "Linear", true)
    this.game.add.tween(this.sprite).to({rotation: 0}, 50, "Linear", true, 250)
    this.moveTween.onComplete.add(this.moveEnded, this)
    this.moveTween.start()
  }

  moveEnded () {
    this.isMoving = false
    if (this.sprite && this.sprite.body) {
      this.sprite.body.rotation = 0
    }
  }

  _getFreeCellByDirection (data, self, offset) {
    if (self.x + offset.x < 0 || self.x + offset.x > 5) { return false }
    let newIdx = self.idx + offset.x + (offset.y * 6)
    return data[newIdx]
  }
}
