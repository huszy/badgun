import Phaser from 'phaser'
import { setTimeout, clearTimeout } from 'timers'

export default class extends Phaser.State {
  isStartPlayed = false
  thunderPlayed = false
  thunderTimer = null

  init (params) {
    console.dir(params)
    this.stage.backgroundColor = '#000000'
    let root = document.getElementById('highscore')
    let high = root.getElementsByClassName('high')[0]
    let current = root.getElementsByClassName('current')[0]

    high.innerHTML = params.score
    current.innerHTML = params.score
  }

  preload () {
    this.game.add.sprite(0, 0, 'gameoverBg')

    // Restart button
    this.restartButton = this.game.add.button(420, 742, 'restartButton', this.onRestartButtonClick.bind(this), this, 0, 0, 0, 0)
    this.restartButton.inputEnabled = true

    // Home button
    this.homeButton = this.game.add.button(223, 742, 'homeButton', this.onHomeButtonClick.bind(this), this, 0, 0, 0, 0)
    this.homeButton.inputEnabled = true
  }

  create () {

  }

  onRestartButtonClick () {
    this.state.start('Game')
  }

  onHomeButtonClick () {
    this.state.start('Intro')
  }
}
