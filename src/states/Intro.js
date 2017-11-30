import Phaser from 'phaser'
import { setTimeout, clearTimeout } from 'timers'

export default class extends Phaser.State {
  isStartPlayed = false
  thunderPlayed = false
  thunderTimer = null

  init () {
    this.stage.backgroundColor = '#000000'
    this.animationComplete = new Phaser.Signal()
    this.animationComplete.add(this.onAnimationComplete.bind(this), this)
  }

  preload () {
    this.game.load.atlas('intro', 'assets/intro/introspritesheet.png', 'assets/intro/introsprites.json')
    this.game.load.atlas('intrologo', 'assets/intro/logoanim.png', 'assets/intro/logoanimsprites.json')
    this.game.load.spritesheet('startButton', 'assets/intro/start-btn.png')
    this.introSprite = this.game.add.sprite(0, 0, 'intro')
    this.logoSprite = this.game.add.sprite(this.game.world.width / 2, 300, 'intrologo')
    this.logoSprite.alpha = 0
    this.logoSprite.anchor.set(0.5)

    this.logoAnim = this.logoSprite.animations.add('logoStart', Phaser.Animation.generateFrameNames('logo', 0, 40, '', 4), 30, false)
    this.logoAnim.loop = false
    this.logoAnim.onComplete = this.animationComplete

    this.bgAnimStartPhase = this.introSprite.animations.add('start', Phaser.Animation.generateFrameNames('start-', 0, 15), 30, false)
    this.bgAnimThunderPhase = this.introSprite.animations.add('thunder', Phaser.Animation.generateFrameNames('start-thunder-', 1, 11, '', 5), 24, false)
    this.bgAnimStartPhase.loop = false
    this.bgAnimStartPhase.onComplete = this.animationComplete
    this.bgAnimThunderPhase.loop = false
    this.bgAnimThunderPhase.onComplete = this.animationComplete

    // Start button
    this.startButton = this.game.add.button(this.game.world.centerX - 174, this.game.world.height, 'startButton', this.onStartButtonClick.bind(this), this, 0, 0, 0, 0)
    this.startButton.inputEnabled = true
    this.startButton.alpha = 0
  }

  create () {
    this.bgAnimStartPhase.play()
  }

  onStartButtonClick () {
    if (this.thunderTimer !== null) {
      clearTimeout(this.thunderTimer)
    }
    this.state.start('Game')
  }

  onAnimationComplete (animation, phase) {
    if (phase.name === 'start') {
      this.isStartPlayed = true
      this.playThunder()
    }
    if (phase.name === 'thunder') {
      if (!this.thunderPlayed) {
        // Logo anim
        this.logoSprite.alpha = 1
        this.logoAnim.play()
        this.thunderPlayed = true
      }
      this.scheduleRandomThunder()
    }
    if (phase.name === 'logoStart') {
      // Show UI elements
      this.fadeInUIElements()
    }
  }

  fadeInUIElements () {
    this.startBtnTween = this.game.add.tween(this.startButton)
    this.startBtnTween.to({ alpha: 1, y: this.game.world.height - 200 }, 400, 'Linear', true, 0)
    this.startBtnTween.start()
  }

  scheduleRandomThunder () {
    let timeout = (Math.random() * 10000) + 3000
    this.thunderTimer = setTimeout(this.playThunder.bind(this), timeout)
  }

  playThunder () {
    this.bgAnimThunderPhase.play()
  }
}
