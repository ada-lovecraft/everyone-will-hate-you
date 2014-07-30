'use strict';
var Mouse = function(maze, x, y, color) {
  this.maze = maze;
  this.pos = new Point(x, y);
  this.direction = null;
  this.history = [];
  this.isSolved = false;
  this.name = 'mouse';
  this.color = color || Mouse.Colors[0];
  this.showTrail = true;



  this.events = {
    onSolved: new signals.Signal(),
    onMoved: new signals.Signal()
  };
  this.nextTickTime = 0;
  this.solveSpeed = 100;
  this.currentTime = Date.now();
  this.startTime = Date.now();
  this.endTime = null;
};

Mouse.prototype.update = function() {
  this.currentTime = Date.now();
  if(this.currentTime >= this.nextTickTime && !this.isSolved) {
    this.solver();
    this.nextTickTime = this.currentTime + this.solveSpeed;
    if(this.isSolved) {
      this.endTime = Date.now();
      this.solveTime = this.endTime - this.startTime;
      this.events.onSolved.dispatch(this.solveTime, this.history.length);
    }
  }

};

Mouse.prototype.solver = function() {
  console.warn('You must implement a solver for this mouse');
};



Mouse.prototype.createHistoryKey = function(pos) {
  return pos.x + ':' + pos.y;
};

Mouse.prototype.getHistory = function(historyKey) {
  var filtered = [];
  filtered = this.history.filter(function(h) {
    return h.key === historyKey;
  });
  return filtered;
};

Mouse.SeekDirections = [
  {
    key: 'N',
    x: 0,
    y: -1
  },
  {
    key: 'S',
    x: 0,
    y: 1
  },
  {
    key: 'E',
    x: 1,
    y: 0
  },
  {
    key: 'W',
    x: -1,
    y: 0
  }
];

Mouse.OppositeSeekDirections = {
  N: 'S',
  S: 'N',
  E: 'W',
  W: 'E'
};

Mouse.SeekLookup = {
  'N': Mouse.SeekDirections[0],
  'S': Mouse.SeekDirections[1],
  'E': Mouse.SeekDirections[2],
  'W': Mouse.SeekDirections[3],
};

Mouse.Colors = ['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)','rgb(106,61,154)'];
