import Phaser from 'phaser'

export default class extends Phaser.State {
  init () {
    this.stage.backgroundColor = '#EDEEC9'
  }

  preload () {
    /*
    let text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', { font: '16px Arial', fill: '#dddddd', align: 'center' })
    text.anchor.setTo(0.5, 0.5)
    */

    this.game.load.atlas('intro', 'assets/intro/introspritesheet.png', 'assets/intro/introsprites.json')
    this.sprite = this.game.add.sprite(this.game.world.centerX, 300, 'intro');
    this.sprite.animations.add('dying', Phaser.Animation.generateFrameNames('start-', 0, 15), 5, true)
    
  }

  render () {
    this.sprite.animations.play('dying');
  }
}
