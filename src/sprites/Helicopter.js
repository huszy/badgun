import Phaser from 'phaser'

export default class Helicopter extends Phaser.Sprite {
  constructor ({ game, x, y, asset }) {
    super(game, x, y, 'helicopter')

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
}
