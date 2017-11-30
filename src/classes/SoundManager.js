import Phaser from 'phaser'

const collection = require('lodash/collection')
const soundConfig = require('../soundConfig.json')

export default class SoundManager {

  static fx = []
  static loops = []
  static loopCategories = []
  static playingLoops = {}

  static loopPlaybackRate = 1

  static carEngine = null
  static shouldStopLoop = false

  static initialize (game) {
    this.game = game
    this.initialized = false

    soundConfig.sounds.loops.forEach((sound) => {
      let snd = game.add.audio(sound.name)
      snd.category = sound.category
      this.loops.push(snd)
    })

    soundConfig.sounds.fx.forEach((sound) => {
      let snd = game.add.audio(sound.name)
      this.fx.push(snd)
    })

    this.onFadeOut = new Phaser.Signal()
    this.onFadeOut.add(this.stopSound.bind(this), this)

    this.game.sound.setDecodedCallback(this.loops, this.decodedCallback.bind(this), this)
  }

  static decodedCallback () {
    let bass = this.getRandomLoopByCategory('bass')
    bass.onStop.add(this.hasLooped, this)
    //bass.onStop.add(this.hasLooped, this)
    let drums = this.getRandomLoopByCategory('drums')
    drums.onStop.add(this.hasLooped, this)
    let lead = this.getRandomLoopByCategory('lead')
    lead.onStop.add(this.hasLooped, this)

    this.playingLoops['bass'] = bass
    this.playingLoops['drums'] = drums
    this.playingLoops['lead'] = lead

    bass.play('', 0, 0.3)
    drums.play('', 0, 0.3)
    lead.play('', 0, 0.3)
    // bass.loopFull(0.3)
    // drums.loopFull(0.3)
    // lead.loopFull(0.3)
    this.initialized = true
  }

  static hasLooped (sound) {
    if (this.shouldStopLoop) {
      sound.stop()
      return
    }
    let snd = this.getRandomLoopByCategory(sound.category)
    this.playingLoops[sound.category] = snd
    snd.onStop.add(this.hasLooped, this)
    snd.play('', 0, 0.3)
    snd._sound.playbackRate.value = this.loopPlaybackRate
  }

  static fadeOutSounds () {
    Object.keys(this.playingLoops).forEach(function (key, index) {
      if (SoundManager.playingLoops.hasOwnProperty(key)) {
        SoundManager.playingLoops[key].onFadeComplete = SoundManager.onFadeOut
        SoundManager.playingLoops[key].fadeOut(500)
      }
    })
  }

  static fadeOutFx (fx) {
    fx.onFadeComplete = SoundManager.onFadeOut
    fx.fadeOut(500)
  }

  static stopSound (item) {
    item.stop()
  }

  static getLoopByName (name) {
    return this.loops.find(x => x.key === name)
  }

  static getFXByName (name) {
    return this.fx.find(x => x.key === name)
  }

  static getRandomLoopByCategory (category) {
    return collection.sample(this.loops.filter(x => x.category === category))
  }

  static setGlobalPlaybackRate (rate) {
    if (!this.initialized) { return }
    this.loopPlaybackRate = rate
    this.playingLoops['bass']._sound.playbackRate.value = rate
    this.playingLoops['drums']._sound.playbackRate.value = rate
    this.playingLoops['lead']._sound.playbackRate.value = rate
  }

  static setSoundPlaybackRate (snd, rate) {
    snd._sound.playbackRate.value = rate
  }
}
