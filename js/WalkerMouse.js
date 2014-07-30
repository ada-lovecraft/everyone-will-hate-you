'use strict';
var WalkerMouse = function(maze, x, y, color) {
  Mouse.call(this, maze, x, y, color);
};

WalkerMouse.prototype = Object.create(Mouse.prototype);
WalkerMouse.prototype.constructor = WalkerMouse;

WalkerMouse.prototype.solver = function() {
  if(!this.solved) {
    var nextPos;
    if(this.pos.equals(this.maze.exitCell)) {
      this.isSolved = true;
      return;
    }
    var surrounding = [];
    var currentCell = this.maze.cellAt(this.pos);
    var possibleDirections = currentCell.possibleDirections;
    possibleDirections.forEach(function(d) {
      var p = Mouse.SeekLookup[d.key];
      var n = this.pos.add(p);
      if(this.maze.isPointValid(n)) {
          p.visited = this.getHistory(this.createHistoryKey(n)).length;
          surrounding.push(p);
      }
    }, this);

    surrounding.sort(function(a,b) {
      return a.visited - b.visited;
    });

    var nextDirection = surrounding[0];
    nextPos = this.pos.add(nextDirection);
    var count = 0;

    while (count < surrounding.length && !this.maze.isPointValid(nextPos)) {
      nextDirection = surround[count];
      nextPos = this.pos.add(nextDirection);
      count++;
    }
    var historyObj = {
      direction: nextDirection,
      pos: this.pos,
      key: this.createHistoryKey(nextPos)
    };

    this.history.push(historyObj);
    this.pos = nextPos;
    this.events.onMoved.dispatch();
  }
};


