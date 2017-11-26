import Phaser from 'phaser'
const stageElementsDefs = require('../stageElementsConfig.json')

export default class StageElementsManager {
  static getHitPolygonsForElement (name, xOffset = 0, yOffset = 0) {
    if (!stageElementsDefs.elements.hasOwnProperty(name)) {
      return []
    }
    let def = stageElementsDefs.elements[name]
    if (def.hitArea === '') {
      return []
    }

    let polygons = []
    def.hitArea.split('-').forEach((polyDefinition) => {
      let coords = polyDefinition.split(' ')
      let polyPoints = coords.map((pointDef) => {
        let points = pointDef.split(',')
        return new Phaser.Point(parseInt(points[0]) + xOffset, parseInt(points[1]) + yOffset)
      })
      /*
      // Quick fix if the last point is not equals to the first point
      let lastIndex = polyPoints.length - 1
      if (polyPoints[0].x !== polyPoints[lastIndex].x || polyPoints[0].y !== polyPoints[lastIndex].y) {
        polyPoints.push(new Phaser.Point(polyPoints[0].x, polyPoints[0].y))
      } */
      let poly = new Phaser.Polygon(polyPoints)
      polygons.push(poly)
    })
    return polygons
  }
}
