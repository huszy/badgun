import Phaser from 'phaser'
import StageElementsManager from '../classes/StageElementsManager'
import FinishLine from './FinishLine'

export default class extends Phaser.Sprite {

  stageElements = []
  stageElementsHitArea = []

  constructor ({ game, x, y, definition }) {
    super(game, x, y, definition.sprite)
    this.definition = definition
    this.offRoadPolygons = []
    this._createOffRoadPolygons(x, y)
    this._createStageElements(x, y)
    this._createAvailibilityMap()
  }

  _createStageElements (xPos, yPos) {
    if (this.definition.decorations.length > 0) {
      this.definition.decorations.forEach((deco) => {
        let phaseNum = StageElementsManager.getElementPhaseNumber(deco.element)
        let sprite = new Phaser.Sprite(this.game, deco.x + xPos, deco.y + yPos, 'se_' + deco.element)
        if (phaseNum > 0) {
          sprite.animations.add('play')
          sprite.animations.play('play', phaseNum * 2, true)
        }
        this.stageElements.push(sprite)
        let polygons = StageElementsManager.getHitPolygonsForElement(deco.element, deco.x + xPos, deco.y + yPos)
        this.stageElementsHitArea.push(...polygons)
      })
    }

    if (this.definition.stageEnd === true) {
      let finishLine = new FinishLine({game: this.game, x: this.game.width / 2, y: yPos + 20})
      this.stageElements.push(finishLine)
      let finishLinePoly = new Phaser.Polygon([0, yPos - 10, this.game.width, yPos - 10, this.game.width, yPos + 10, 0, yPos + 10])
      finishLinePoly.isFinishLine = true
      finishLinePoly.isCrossed = false
      this.stageElementsHitArea.push(finishLinePoly)
    }
  }

  _createOffRoadPolygons (xPos, yPos) {
    if (this.definition.offRoad === '') { return }
    this.definition.offRoad.split('-').forEach((polyDefinition) => {
      let coords = polyDefinition.split(' ')
      let polyPoints = coords.map((pointDef) => {
        let points = pointDef.split(',')
        return new Phaser.Point(parseInt(points[0]) + xPos, parseInt(points[1]) + yPos)
      })
      /*
      // Quick fix if the last point is not equals to the first point
      let lastIndex = polyPoints.length - 1
      if (polyPoints[0].x !== polyPoints[lastIndex].x || polyPoints[0].y !== polyPoints[lastIndex].y) {
        polyPoints.push(new Phaser.Point(polyPoints[0].x, polyPoints[0].y))
      } */
      let poly = new Phaser.Polygon(polyPoints)
      this.offRoadPolygons.push(poly)
    })
  }

  _createAvailibilityMap () {
    this._freeSpaceMap = []
    for (var x = 0; x < 6; x++) {
      for (var y = 0; y < 10; y++) {
        let idx = y * 6 + x
        let rectToCheck = new Phaser.Rectangle((x * 125) + 10 + this.x, (y * 125) + 10 + this.y, 125 - 20, 125 - 20)
        this._freeSpaceMap[idx] = (this.offRoadPolygons.map((poly) => poly.intersectsRectangle(rectToCheck)).includes(true)) ? 0 : 1
        // TODO: filter out finishline
        this._freeSpaceMap[idx] &= (this.stageElementsHitArea.map((poly) => poly.intersectsRectangle(rectToCheck)).includes(true)) ? 0 : 1
        // console.log(this.offRoadPolygons.map((poly) => poly.intersectsRectangle(rectToCheck)).filter(Boolean))
      }
    }
    // console.log(this.definition.sprite, this._freeSpaceMap)
  }
}
