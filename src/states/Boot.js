import Phaser from 'phaser'
import WebFont from 'webfontloader'

export default class extends Phaser.State {
  init () {
    this.stage.backgroundColor = '#EDEEC9'
    this.fontsReady = false
    this.fontsLoaded = this.fontsLoaded.bind(this)
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL
  }

  preload () {
    
    /*
    let text = this.add.text(this.world.centerX, this.world.centerY, 'loading fonts', { font: '16px Arial', fill: '#dddddd', align: 'center' })
    text.anchor.setTo(0.5, 0.5)
    */

    this.load.image('loaderBg', './assets/images/loader-bg.png')
    this.load.image('loaderBar', './assets/images/loader-bar.png')
  }

  render () {
    this.state.start('Splash')
    // if (this.fontsReady) {
    //   this.state.start('Splash')
    // }
  }

  fontsLoaded () {
    this.fontsReady = true
  }
}
