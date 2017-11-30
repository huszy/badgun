const fs = require('fs')
const sizeOfImage = require('image-size')

const stagesFolder = '../assets/stages/'
const output = '../src/blockConfig.json'
const offRoadDefinition = require('./blockPolygons.json').poly
const stageElemDef = require('./stageElements.json')
const elemOutput = '../src/stageElementsConfig.json'

const array = require('lodash/array')

function readDirPromise (filePath) {
  return new Promise((resolve, reject) => {
    fs.readdir(filePath, function (err, filePaths) {
      if (err) {
        reject(err)
        return
      }
      resolve(filePaths)
    })
  })
}

let blockConfig = {blocks: []}

readDirPromise(stagesFolder).then((filePaths) => {
  let usedDecorationElements = []
  filePaths.forEach(fileName => {
    let fileNameWithoutExt = fileName.split('.')[0]
    let [ theme, input, output, variation ] = fileNameWithoutExt.split('_')
    let dimensions = sizeOfImage(stagesFolder + fileName)

    let offRoadDef = offRoadDefinition.find(function (def) {
      return def.hasOwnProperty(input + '_' + output + '_' + variation)
    })
    let polyDef = ''
    if (offRoadDef == null) {
      console.error('No offroad definition found for: ' + input + '_' + output + '_' + variation)
    } else {
      // Check definition
      polyDef = offRoadDef[input + '_' + output + '_' + variation]
      let polys = polyDef.split('-')
      polys.forEach(function (def) {
        let coords = def.split(' ')
        coords.forEach(function (coord) {
          if (coord.split(',').length !== 2) {
            console.error('Error in definition: ' + input + '_' + output + '_' + variation + ':' + def)
          }
        })
      })
    }

    // Decorations
    let decorations = stageElemDef.variations[theme + '_' + input + '_' + output + '_' + variation]
    if (typeof decorations !== 'undefined') {
      decorations.forEach((deco) => {
        usedDecorationElements.push(deco.element)
      })
    } else {
      console.log('No decoration for: ' + theme + '_' + input + '_' + output + '_' + variation)
    }

    blockConfig.blocks.push({ theme: theme, sprite: fileName, input: input, output: output, height: dimensions.height, offRoad: polyDef, decorations: decorations || [] })
  })

  fs.writeFile(output, JSON.stringify(blockConfig, null, 2), {}, function (err) {
    if (err != null) {
      console.error('Error writing blockConfig.json')
    }
  })

  usedDecorationElements = array.uniq(usedDecorationElements)

  fs.writeFile(elemOutput, JSON.stringify({elements: stageElemDef.elements}, null, 2), {}, function (err) {
    if (err != null) {
      console.error('Error writing stageElementsConfig.json')
    }
  })
})
