import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

const blockDefs = require('../blockConfig.json')
const enemyDefs = require('../enemyConfig.json')
const stageElementsConfig = require('../stageElementsConfig.json')

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

    this.load.spritesheet('coin', 'assets/images/coin_spin.png', 56, 56)

    blockDefs.blocks.forEach((block) => {
      this.load.image(block.sprite, 'assets/stages/' + block.sprite)
    })

    enemyDefs.enemies.forEach((enemy) => {
      this.load.image('enemy_' + enemy.name, 'assets/images/' + enemy.sprite + '.png')
    })

    for (var prop in stageElementsConfig.elements) {
      if (stageElementsConfig.elements.hasOwnProperty(prop)) {
        this.load.image('se_' + prop, 'assets/stage_elements/'+stageElementsConfig.elements[prop].sprite)
      }
    }
  }

  create () {
    this.state.start('Game')
  }
}
