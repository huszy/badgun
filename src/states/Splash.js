import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

const blockDefs = require('../blockConfig.json')
const enemyDefs = require('../enemyConfig.json')

export default class extends Phaser.State {
  init () {}

  preload () {
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //
    this.load.image('car', 'assets/images/car.png')
    this.load.image('enemy', 'assets/images/enemy_mini.png')
    this.load.image('stage', 'assets/images/stage.png')

    blockDefs.blocks.forEach((block) => {
      this.load.image(block.sprite, 'assets/stages/' + block.sprite)
    })

    enemyDefs.enemies.forEach((enemy) => {
      this.load.image('enemy_' + enemy.name, 'assets/images/' + enemy.sprite + '.png')
    })
  }

  create () {
    this.state.start('Game')
  }
}
