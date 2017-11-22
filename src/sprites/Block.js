import Phaser from 'phaser'

export default class extends Phaser.Sprite {
  
  constructor ({ game, x, y, definition }) {
    super(game, x, y, definition.sprite)
    this.definition = definition
    this.offRoadPolygons = []
    this._createOffRoadPolygons()
    this._createAvailibilityMap()
  }

  _createOffRoadPolygons () {
    if (this.definition.offRoad === '') { return }
    this.definition.offRoad.split('-').forEach((polyDefinition) => {
      let coords = polyDefinition.split(' ')
      let polyPoints = coords.map((pointDef) => {
        let points = pointDef.split(',')
        return new Phaser.Point(parseInt(points[0]), parseInt(points[1]))
      })
      // Quick fix if the last point is not equals to the first point
      let lastIndex = polyPoints.length - 1
      /*
      if (polyPoints[0].x !== polyPoints[lastIndex].x || polyPoints[0].y !== polyPoints[lastIndex].y) {
        polyPoints.push(new Phaser.Point(polyPoints[0].x, polyPoints[0].y))
      }*/
      let poly = new Phaser.Polygon(polyPoints)
      this.offRoadPolygons.push(poly)
    })
  }

  _createAvailibilityMap () {
    this._freeSpaceMap = []
    for (var x = 0; x < 6; x++) {
      for (var y = 0; y < 10; y++) {
        let idx = y * 6 + x
        let rectToCheck = new Phaser.Rectangle((x * 125) + 10, (y * 125) + 10, 125 - 20, 125 - 20)
        this._freeSpaceMap[idx] = (this.offRoadPolygons.map((poly) => poly.intersectsRectangle(rectToCheck)).includes(true)) ? 0 : 1
        // console.log(this.offRoadPolygons.map((poly) => poly.intersectsRectangle(rectToCheck)).filter(Boolean))
      }
    }
    console.log(this.definition.sprite, this._freeSpaceMap)
  }
}
