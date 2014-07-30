'use strict';
var MazeCell = function(x,y) {
  Point.call(this, x, y);
  this.unvisitedDirections = Mouse.SeekDirections.shuffle();
  this._walls = null;
  this.possibleDirections = [];

  this.walls = MazeCell.Walls.I;
};

MazeCell.prototype = Object.create(Point.prototype);
MazeCell.prototype.constructor = MazeCell;

Object.defineProperty(MazeCell.prototype, 'walls', {
  get: function() {
    return this._walls;
  },
  set: function(value) {
    this._walls = value;
    this.possibleDirections = [{
      key: 'N',
      value: !!(this._walls & MazeCell.Walls.N)
    }, {
      key: 'S',
      value: !!(this._walls  & MazeCell.Walls.S)
    }, {
      key: 'E',
      value: !!(this._walls & MazeCell.Walls.E)
    }, {
      key: 'W',
      value: !!(this._walls & MazeCell.Walls.W)
    }, ].filter(function(d) {
      return d.value;
    });
  }
});

Object.defineProperty(MazeCell.prototype, 'position', {
  get: function() {
    return new Point(this.x, this.y);
  },
  set: function(point) {
    this.x = point.x;
    this.y = point.y;
  }
});


MazeCell.Walls = Object.freeze({
  I: 0,
  N: 1,
  S: 2,
  E: 4,
  W: 8,
  ENTRY: 16,
  EXIT: 32,
  VISITED: 64
});

MazeCell.OppositeWalls = Object.freeze({
  N: MazeCell.Walls.S,
  S: MazeCell.Walls.N,
  E: MazeCell.Walls.W,
  W: MazeCell.Walls.E
});
