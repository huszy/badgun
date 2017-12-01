import Phaser from 'phaser'
import { setTimeout, clearTimeout } from 'timers'

export default class extends Phaser.State {
  isStartPlayed = false
  thunderPlayed = false
  thunderTimer = null

  init (params) {
    console.dir(params)
    this.stage.backgroundColor = '#000000'
    this.rootElem = document.getElementById('highscore')
    let high = this.rootElem.getElementsByClassName('high')[0]
    let current = this.rootElem.getElementsByClassName('current')[0]

    high.innerHTML = params.score.format(0, 3, '.', '.')
    current.innerHTML = params.score.format(0, 3, '.', '.')
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
    this.rootElem.style.display = 'block'
  }

  onRestartButtonClick () {
    this.rootElem.style.display = 'none'
    this.state.start('Game', true, false)
  }

  onHomeButtonClick () {
    this.rootElem.style.display = 'none'
    this.state.start('Intro')
  }
}
