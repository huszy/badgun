const blockDefs = require('../blockConfig.json')
const array = require('lodash/array')
const collection = require('lodash/collection')

export default class MapGenerator {
  constructor () {
    this.maps = []
    let blockDef = collection.sample(MapGenerator.getBlocksByQuery({input: '100001', output: '100001', theme: 'desert'}))
    console.dir(blockDef)
    this.maps = [blockDef, blockDef, blockDef, blockDef, blockDef]
  }

  generateNext () {
    let lastBlock = array.last(this.maps)
    this.maps.push(collection.sample(MapGenerator.getBlocksByQuery({input: lastBlock.output, theme: lastBlock.theme})))
  }

  static getBlocksByQuery (query) {
    return collection.filter(blockDefs.blocks, query)
  }
}
