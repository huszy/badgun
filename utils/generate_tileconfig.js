const fs = require('fs')
const sizeOfImage = require('image-size')

const stagesFolder = '../assets/stages/'
const output = '../src/blockConfig.json'

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
  filePaths.forEach(fileName => {
    let [ theme, input, output ] = fileName.split('_')
    let dimensions = sizeOfImage(stagesFolder + fileName)
    blockConfig.blocks.push({ theme: theme, sprite: fileName, input: input, output: output, height: dimensions.height / 2 })
  })

  fs.writeFile(output, JSON.stringify(blockConfig, null, 2), {}, function (err) {
    if (err != null) {
      console.error('Error writing blockConfig.json'); 
    }
  })
})
