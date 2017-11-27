import Coin from '../sprites/Coin'
import Phaser from 'phaser'

const collection = require('lodash/collection')

export default class CollectableManager {
  static collectables = []
  static game = null
  static worldGroup = null
  static timeSinceLastAdd = 0

  static initialize (game, worldGroup) {
    this.game = game
    this.worldGroup = worldGroup
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

      let coin = new Coin({ game: this.game, x: (x * 125) + 62.5, y: (y * 125) + 62.5 + block.y, asset: 'coin'})
      this.worldGroup.add(coin)
    })
  }
}
