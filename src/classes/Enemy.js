import Phaser from 'phaser'

export default class Enemy {
  constructor (spriteDef, game, options = {}) {
    this.sprite = game.add.existing(spriteDef)
    this.game = game
    game.physics.enable(this.sprite, Phaser.Physics.ARCADE)
    this.sprite.body.velocity.y = options.velocity || 0
    this.isMoving = false
  }

  update (blockMatrix, yOffset) {
    // Get current block position
    let topPos = (this.sprite.y + Math.abs(yOffset)) - (this.sprite.height / 2)
    let y = Math.floor(topPos / 125)
    let x = Math.floor((this.sprite.x - (this.sprite.width / 2)) / 125)
    let idx = y * 6 + x
    
    // console.log(`${x},${y}: ${blockMatrix.data[idx]}`)
    let selfData = { x: x, y: y, idx: idx }

    // Check directions
    let canMoveLeft = true
    let canMoveRight = true
    let canStay = true
    
    // Check left
    if (x === 0) { canMoveLeft = false }
    if (!this._getFreeCellByDirection(blockMatrix.data, selfData, { x: -1, y: -1 })) {
      canMoveLeft = false
    }

    if (x === 5) { canMoveRight = false }
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
    if (!canStay) {
      if (canMoveLeft) {
        this.isMoving = true
        this.moveTween = this.game.add.tween(this.sprite)
        
        this.moveTween.to({x: this.sprite.x - 125}, 300, "Linear")
        this.game.add.tween(this.sprite).to({rotation: -0.2}, 50, "Linear", true)
        this.game.add.tween(this.sprite).to({rotation: 0}, 50, "Linear", true, 250)
        this.moveTween.onComplete.add(this.moveEnded, this)
        this.moveTween.start()
      }

      if (canMoveRight) {
        this.isMoving = true
        this.moveTween = this.game.add.tween(this.sprite)
        
        this.moveTween.to({x: this.sprite.x + 125}, 300, "Linear")
        this.game.add.tween(this.sprite).to({rotation: 0.2}, 50, "Linear", true)
        this.game.add.tween(this.sprite).to({rotation: 0}, 50, "Linear", true, 250)
        this.moveTween.onComplete.add(this.moveEnded, this)
        this.moveTween.start()
      }
    }
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
