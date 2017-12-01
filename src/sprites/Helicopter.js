import Phaser from 'phaser'

export default class Helicopter extends Phaser.Sprite {
  constructor ({ game, x, y, asset }) {
    super(game, x, y, 'helicopter')
    this.game = game

    this.rotorBig = new Phaser.Sprite(this.game, this.width / 2, this.height / 2, 'helicopter_rotor_big')
    this.rotorBig.anchor.set(0.5)
    this.rotorBig.x = 0
    this.rotorBig.y = -14
    this.addChild(this.rotorBig)

    this.rotorSmallLeft = new Phaser.Sprite(this.game, this.width / 2, this.height / 2, 'helicopter_rotor_small')
    this.rotorSmallLeft.anchor.set(0.5)
    this.rotorSmallLeft.x = -226
    this.rotorSmallLeft.y = 16
    this.addChild(this.rotorSmallLeft)

    this.rotorSmallRight = new Phaser.Sprite(this.game, this.width / 2, this.height / 2, 'helicopter_rotor_small')
    this.rotorSmallRight.anchor.set(0.5)
    this.rotorSmallRight.x = 226
    this.rotorSmallRight.y = 16
    this.addChild(this.rotorSmallRight)

    this.anchor.setTo(0.5)
  }

  update () {
    let rotation = this.rotorBig.rotation
    rotation += 0.5
    if (rotation >= 360) {
      rotation = 0
    }
    this.rotorBig.rotation = rotation
    this.rotorSmallLeft.rotation = rotation
    this.rotorSmallRight.rotation = rotation
  }

  moveIn (x, y, moveInCallback, moveOutCallback) {
    this.y = y - 400
    this.moveInCallback = moveInCallback
    this.moveOutCallback = moveOutCallback
    
    let tweenIn = this.game.add.tween(this)
    tweenIn.to({ x: x, y: y }, 2000, Phaser.Easing.Quadratic.Out)
    tweenIn.onComplete.add(this._moveInFinished, this)
    
    let tweenOut = this.game.add.tween(this)
    tweenOut.to({ x: 1500, y: y - 400 }, 1500, Phaser.Easing.Quadratic.Out)
    tweenOut.onComplete.add(this._moveOutFinished, this)
    
    tweenIn.chain(tweenOut)
    tweenIn.start()
  }

  _moveInFinished () {
    // console.log("Move in finished")
    if (this.moveInCallback) {
      this.moveInCallback()
    }
  }

  _moveOutFinished () {
    // console.log("Move out finished")
    if (this.moveOutCallback) {
      this.moveOutCallback()
    }
  }
}
