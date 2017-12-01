import Phaser from 'phaser'
import { setTimeout, clearTimeout } from 'timers'
import localForage from 'localforage'

export default class extends Phaser.State {
  isStartPlayed = false
  thunderPlayed = false
  thunderTimer = null

  init (params) {
    this.currentScore = params.score
    this.stage.backgroundColor = '#000000'
    this.rootElem = document.getElementById('highscore')
    this.high = this.rootElem.getElementsByClassName('high')[0]
    let current = this.rootElem.getElementsByClassName('current')[0]

    current.innerHTML = params.score.format(0, 3, '.', '.')

    this.timeElement = document.getElementById('timeLeft')
    this.scoreElement = document.getElementById('score')
    this.timeElement.innerHTML = '00:00.00'
    this.scoreElement.innerHTML = 0
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
    var t = this
    localForage.getItem('highscore').then((value) => {
      if (value !== null && typeof value !== 'undefined') {
        value = parseInt(value)
        if (value < t.currentScore) {
          value = t.currentScore
          localForage.setItem('highscore', value)
        }
        t.high.innerHTML = value.format(0, 3, '.', '.')
      } else {
        t.high.innerHTML = t.currentScore.format(0, 3, '.', '.')
        localForage.setItem('highscore', t.currentScore)
      }
      this.rootElem.style.display = 'block'
    })
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
