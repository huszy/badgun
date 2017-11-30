import Phaser from 'phaser'
import { setTimeout } from 'core-js/library/web/timers';

export default class extends Phaser.State {

  isStartPlayed = false

  init () {
    this.stage.backgroundColor = '#000000'
    this.animationComplete = new Phaser.Signal()
    this.animationComplete.add(this.onAnimationComplete.bind(this), this)
  }

  preload () {
    this.game.load.atlas('intro', 'assets/intro/introspritesheet.png', 'assets/intro/introsprites.json')
    this.sprite = this.game.add.sprite(0, 0, 'intro');
    this.bgAnimStartPhase = this.sprite.animations.add('start', Phaser.Animation.generateFrameNames('start-', 0, 15), 24, false)
    this.bgAnimThunderPhase = this.sprite.animations.add('thunder', Phaser.Animation.generateFrameNames('start-thunder-', 1, 11, '', 5), 24, false)
    this.bgAnimStartPhase.loop = false
    this.bgAnimStartPhase.onComplete = this.animationComplete
    this.bgAnimThunderPhase.loop = false
    this.bgAnimThunderPhase.onComplete = this.animationComplete
  }

  create () {
    this.bgAnimStartPhase.play()
  }

  onAnimationComplete (animation, phase) {
    console.log(animation, phase)
    if (phase.name === 'start') {
      this.isStartPlayed = true
      this.playThunder()
    }
    if (phase.name === 'thunder') {
      this.scheduleRandomThunder()
    }
  }

  scheduleRandomThunder () {
    let timeout = (Math.random() * 10000) + 3000
    this.thunderTimer = setTimeout(this.playThunder.bind(this), timeout)
  }

  playThunder () {
    this.bgAnimThunderPhase.play()
  }
}
