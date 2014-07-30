'use strict';
var Point = function(x, y) {
  x = x || 0;
  y = y || 0;
  this.x = x;
  this.y = y;
};

Point.prototype = {
  add: function(point) {
    return new Point(this.x + point.x, this.y + point.y);
  },
  equals: function(point) {
    return this.x === point.x && this.y === point.y;
  }
};
