const collection = require('lodash/collection')
const soundConfig = require('../soundConfig.json')

export default class SoundManager {

  static loops = []
  static loopCategories = []
  static playingLoops = {}

  static loopPlaybackRate = 1

  static initialize (game) {
    this.game = game
    this.initialized = false

    soundConfig.sounds.loops.forEach((sound) => {
      let snd = game.add.audio(sound.name)
      snd.category = sound.category
      this.loops.push(snd)
    })

    this.game.sound.setDecodedCallback(this.loops, this.decodedCallback.bind(this), this)
  }

  static decodedCallback () {
    console.log('Sounds ready')
    let bass = this.getRandomLoopByCategory('bass')
    bass.onLoop.add(this.hasLooped, this)
    let drums = this.getRandomLoopByCategory('drums')
    drums.onLoop.add(this.hasLooped, this)
    let lead = this.getRandomLoopByCategory('lead')
    lead.onLoop.add(this.hasLooped, this)

    this.playingLoops['bass'] = bass
    this.playingLoops['drums'] = drums
    this.playingLoops['lead'] = lead

    bass.loopFull(0.6)
    drums.loopFull(0.6)
    lead.loopFull(0.6)
    this.initialized = true
  }

  static hasLooped (sound) {
    let snd = this.getRandomLoopByCategory(sound.category)
    snd.onLoop.add(this.hasLooped, this)
    snd.loopFull(0.6)
    snd._sound.playbackRate.value = this.loopPlaybackRate
  }

  static getLoopByName (name) {
    return this.loops.find(x => x.key === name)
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
}
