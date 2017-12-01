import Phaser from 'phaser'

export const centerGameObjects = (objects) => {
  objects.forEach(function (object) {
    object.anchor.setTo(0.5)
  })
}

export function mapNumber (value, in_min, in_max, out_min, out_max) {
  return (value - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

export function debugHTML (html) {
  document.getElementById('debug').innerHTML = html
}

export function convertRange( value, r1, r2 ) { 
  return ( value - r1[ 0 ] ) * ( r2[ 1 ] - r2[ 0 ] ) / ( r1[ 1 ] - r1[ 0 ] ) + r2[ 0 ];
}

Number.prototype.format = function(n, x, s, c) {
  var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
      num = this.toFixed(Math.max(0, ~~n));

  return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};

Phaser.Polygon.prototype.intersectsRectangle = function (rect) {
  if (this._points.length < 2) { return false }
  for (var i = 0; i < this._points.length; i++) {
    var p1 = this._points[i]
    var p2 = this._points[0]
    if (i !== this._points.length - 1) {
      p2 = this._points[i + 1]
    }
    let line = new Phaser.Line(p1.x, p1.y, p2.x, p2.y)
    if (Phaser.Line.intersectsRectangle(line, rect)) {
      return true
    }
  }
  // Check if poly actually contains the rect any point
  return (this.contains(rect.x, rect.y) ||
          this.contains(rect.topRight.x, rect.topRight.y) ||
          this.contains(rect.bottomLeft.x, rect.bottomLeft.y) ||
          this.contains(rect.bottomRight.x, rect.bottomRight.y))
}
