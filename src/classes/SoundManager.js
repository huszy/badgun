export default class SoundManager {
  static initialize (game) {
    this.game = game
    let bass2 = game.add.audio('bass2')

    this.sounds = [bass2]
    this.game.sound.setDecodedCallback(this.sounds, this.decodedCallback.bind(this), this);
  }

  static decodedCallback () {
    console.log('Sounds ready')
    this.sounds[0].loopFull(0.6)
  }

  static setGlobalPlaybackRate (rate) {
    window.game.state.getCurrentState().game.sound._sounds[0]._sound.playbackRate.value = 1
  }
}
