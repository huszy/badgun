const blockDefs = require('../blockConfig.json')
const array = require('lodash/array')
const collection = require('lodash/collection')

export default class MapGenerator {
  constructor () {
    this.currentIndex = 0
    this.maps = []
    let blockDef = collection.sample(MapGenerator.getBlocksByQuery({input: '100001', output: '100001', theme: 'desert'}))
    if (window.isDebug) {
      this.maps = [blockDef]
      return
    }
    this.maps = [blockDef, blockDef, blockDef, blockDef, blockDef]
  }

  generateNext (newTheme = null, numberToGenerate = 1) {
    for (var i = 0; i < numberToGenerate; i++) {
      if (window.isDebug) {
        this._generateNextInSequence()
      } else {
        this._generateNextRandom(newTheme)
      }
    }
  }

  _generateNextRandom (newTheme = null) {
    let lastBlock = array.last(this.maps)
    let theme = newTheme || lastBlock.theme
    this.maps.push(collection.sample(MapGenerator.getBlocksByQuery({input: lastBlock.output, theme: theme})))
  }

  _generateNextInSequence () {
    this.currentIndex++
    if(this.currentIndex >= blockDefs.blocks.length) {
      this.currentIndex = 0
    }
    this.maps.push(blockDefs.blocks[this.currentIndex])
  }

  static getBlocksByQuery (query) {
    return collection.filter(blockDefs.blocks, query)
  }
}
