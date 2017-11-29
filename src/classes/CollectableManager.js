import Coin from '../sprites/Coin'
import Phaser from 'phaser'

const collection = require('lodash/collection')

export default class CollectableManager {
  static collectables = []
  static game = null
  static collectableGroup = null
  static timeSinceLastAdd = 0

  static initialize (game, collectableGroup) {
    this.game = game
    this.collectableGroup = collectableGroup
  }

  static addCoinsToBlock (block, coinsToAdd) {
    let freeSpaceIndex = []
    block._freeSpaceMap.forEach((x, i) => {
      if (x === 1) {
        freeSpaceIndex.push(i)
      }
    })
    let coinPositions = collection.sampleSize(freeSpaceIndex, coinsToAdd)
    coinPositions.forEach((cp) => {
      let y = Math.floor(cp / 6)
      let x = cp - (y * 6)

      let coin = new Coin({ game: this.game, x: (x * 125) + 62.5, y: (y * 125) + 62.5 + block.y, asset: 'coin' })
      this.collectableGroup.add(coin)
      this.collectables.push(coin)
    })

    this.cleanup()
  }

  static cleanup () {
    this.removeCollectables(this.collectables.filter(x => x.y > this.game.camera.view.y + this.game.camera.view.height + 100))
  }

  static removeCollectables (collectables) {
    collectables.forEach((collectable) => {
      let idx = this.collectables.indexOf(collectable)
      if (idx > -1) {
        this.collectables.splice(idx, 1)
      }
      this.collectableGroup.remove(collectable)
      collectable.destroy()
    })
  }
}
