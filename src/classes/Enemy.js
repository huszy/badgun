import Phaser from 'phaser'

export default class Enemy {
  constructor (spriteDef, game, options = {}) {
    this.sprite = game.add.existing(spriteDef)
    this.game = game
    this.options = options
    this.worldCurrentVelocity = this.options.worldCurrentVelocity
    // game.physics.enable(this.sprite, Phaser.Physics.ARCADE)
    this.originalVelocity = options.velocity
    // this.sprite.body.velocity.y = options.velocity || 0
    // this.sprite.body.bounce.set(0.5)
    this.isMoving = false
  }

  getPositionData (yOffset) {
    let topPos = (this.sprite.y + Math.abs(yOffset)) - (this.sprite.height / 2)
    let y = Math.floor(topPos / 125)
    let x = Math.floor((this.sprite.x - (this.sprite.width / 2)) / 125)
    let idx = y * 6 + x
    
    // console.log(`${x},${y}: ${blockMatrix.data[idx]}`)
    return { x: x, y: y, idx: idx }
  }

  update (blockMatrix, yOffset) {
    
    if (this.sprite.body.velocity.x > 0) {
      this.sprite.body.velocity.x = Math.min(this.sprite.body.velocity.x - 10 * 1.75, 0)
    } else if (this.sprite.body.velocity.x < 0) {
      this.sprite.body.velocity.x = Math.max(this.sprite.body.velocity.x + 10 * 1.75, 0)
    }

    /*
    let worldVelocityDiff = (this.options.worldMaxVelocity - this.worldCurrentVelocity)
    if (this.sprite.body.velocity.y > this.originalVelocity - worldVelocityDiff) {
      this.sprite.body.velocity.y = Math.min(this.sprite.body.velocity.y - 10 * 1.75, this.originalVelocity - worldVelocityDiff)
    } else if (this.sprite.body.velocity.y < this.originalVelocity - worldVelocityDiff) {
      this.sprite.body.velocity.y = Math.max(this.sprite.body.velocity.y + 10 * 1.75, this.originalVelocity - worldVelocityDiff)
    }*/

    // Get current block position
    let selfData = this.getPositionData(yOffset)

    // Check directions
    let canMoveLeft = true
    let canMoveRight = true
    let canStay = true
    

    // Check left
    if (selfData.x === 0) { canMoveLeft = false }
    if (!this._getFreeCellByDirection(blockMatrix.data, selfData, { x: -1, y: -1 })) {
      canMoveLeft = false
    }

    if (selfData.x === 5) { canMoveRight = false }
    if (!this._getFreeCellByDirection(blockMatrix.data, selfData, { x: 1, y: -1 })) {
      canMoveRight = false
    }

    if (!this._getFreeCellByDirection(blockMatrix.data, selfData, { x: 0, y: -1 })) {
      canStay = false
    }

    if (!this._getFreeCellByDirection(blockMatrix.data, selfData, { x: 0, y: -1 })) {
      canStay = false
    }

    // console.log(`Can move: STAY: ${canStay}, LEFT: ${canMoveLeft}, RIGHT: ${canMoveRight}`)
    
    if (this.isMoving) { return }
    console.log(canMoveLeft, canMoveRight, canStay)
    if (!canStay) {
      if (canMoveLeft && canMoveRight) {
        if (Math.round(Math.random())) {
          this._moveLeftP2()
        } else {
          this._moveRightP2()
        }
      } else {
        if (canMoveLeft) {
          this._moveLeftP2()
        } else if (canMoveRight) {
          this._moveRightP2()
        } else {
          console.log("CAR CANNOT MOVE!!!")
          this.sprite.body.velocity.y += 10
        }
      }
    }
  }

  _moveLeftP2 () {
    // this.isMoving = true
    this.sprite.body.moveLeft(1250)
  }

  _moveRightP2 () {
    // this.isMoving = true
    this.sprite.body.moveRight(1250)
  }

  _moveLeft () {
    this.isMoving = true
    this.moveTween = this.game.add.tween(this.sprite)
    
    this.moveTween.to({x: this.sprite.x - 125}, 300, "Linear")
    this.game.add.tween(this.sprite).to({rotation: -0.2}, 50, "Linear", true)
    this.game.add.tween(this.sprite).to({rotation: 0}, 50, "Linear", true, 250)
    this.moveTween.onComplete.add(this.moveEnded, this)
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
  }

  _getFreeCellByDirection (data, self, offset) {
    if (self.x + offset.x < 0 || self.x + offset.x > 5) { return false }
    let newIdx = self.idx + offset.x + (offset.y * 6)
    return data[newIdx] === 1
  }
}
