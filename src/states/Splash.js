import Phaser from 'phaser'
import { centerGameObjects } from '../utils'

const blockDefs = require('../blockConfig.json')
const enemyDefs = require('../enemyConfig.json')
const stageElementsConfig = require('../stageElementsConfig.json')
const soundConfig = require('../soundConfig.json')

export default class extends Phaser.State {
  init () {}

  preload () {
    this.logoBg = this.add.sprite(0, 0, 'compLogo')
    this.loaderBg = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 400, 'loaderBg')
    this.loaderBar = this.add.sprite(this.game.world.centerX, this.game.world.centerY + 400, 'loaderBar')
    centerGameObjects([this.loaderBg, this.loaderBar])

    this.load.setPreloadSprite(this.loaderBar)
    //
    // load your assets
    //
    this.load.atlas('intro', 'assets/intro/introspritesheet.png', 'assets/intro/introsprites.json')
    this.load.atlas('intrologo', 'assets/intro/logoanim.png', 'assets/intro/logoanimsprites.json')
    this.load.atlas('countDown', 'assets/images/counter.png', 'assets/images/countersprites.json')
    this.load.image('car', 'assets/images/car.png')
    this.load.spritesheet('carExplosion', 'assets/images/explosion.png', 350, 350)
    this.load.spritesheet('startButton', 'assets/intro/start-btn.png')
    this.load.image('stageFinish', 'assets/images/finish-line.png')
    this.load.image('enemy', 'assets/images/enemy_mini.png')
    this.load.image('helicopter', 'assets/images/helicopter.png')
    this.load.image('helicopter_rotor_big', 'assets/images/helicopter_rotor_big.png')
    this.load.image('helicopter_rotor_small', 'assets/images/helicopter_rotor_small.png')
    this.load.image('gameoverBg', 'assets/images/gameoverbg.png')
    this.load.image('homeButton', 'assets/images/home-btn.png')
    this.load.image('restartButton', 'assets/images/restart-btn.png')

    this.load.image('impressum', 'assets/intro/impressum.png')
    this.load.image('infoButton', 'assets/intro/info-btn.png')
    this.load.image('transparentButton', 'assets/intro/transparent.png')

    this.load.spritesheet('coin', 'assets/images/coin_spin.png', 56, 56)

    blockDefs.blocks.forEach((block) => {
      if (block.sprite.indexOf('snow') !== 0) {
        this.load.image(block.sprite, 'assets/stages/' + block.sprite)
      }
    })

    enemyDefs.enemies.forEach((enemy) => {
      this.load.image('enemy_' + enemy.name, 'assets/images/' + enemy.sprite + '.png')
    })

    for (var prop in stageElementsConfig.elements) {
      if (stageElementsConfig.elements.hasOwnProperty(prop)) {
        if (stageElementsConfig.elements[prop].spriteNum) {
          this.load.spritesheet('se_' + prop, 'assets/stage_elements/' + stageElementsConfig.elements[prop].sprite, parseInt(stageElementsConfig.elements[prop].width), parseInt(stageElementsConfig.elements[prop].height))
        } else {
          this.load.image('se_' + prop, 'assets/stage_elements/' + stageElementsConfig.elements[prop].sprite)
        }
      }
    }

    soundConfig.sounds.loops.forEach((sound) => {
      this.game.load.audio(sound.name, `assets/sounds/${sound.file}`)
    })

    soundConfig.sounds.fx.forEach((sound) => {
      this.game.load.audio(sound.name, `assets/sounds/${sound.file}`)
    })
  }

  create () {
    this.state.start('Intro')
  }
}
