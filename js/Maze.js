'use strict';
var Maze = function(ctx, x, y, width, height, tileSize, config) {
  if(config) {
    this.importMaze(config);
  } else {
    this.ctx = ctx;
    this._grid = [];
    this.width = width;
    this.height = height;

    this.x = x;
    this.y = y;

    this.tileSize = tileSize;
    this.totalTiles = this.width * this.height;

    this.mice = [];
    this.depths = {};

    this.showMaze = null;
    this.showDepths = null;
    this.activeCell = null;
    this.exitCell = null;
    this.deepestNode = 0;
    this.exitCell = null;
    this.shouldSolve = false;
    this.isCarved = false;
    this.solveTime = null;
    this.reset();
    this.initializeGrid();
    this.carver = null;


    this.events = {
      onCreated: new signals.Signal(),
      onCarveUpdate: new signals.Signal(),
      onSolved: new signals.Signal()
    };
  }





};

Maze.prototype = {
  reset: function() {
    this.depths = {};
    this.showMaze = true;
    this.showDepths = false;
    this.activeCell = null;
    this.shouldSolve = false;
  },
  initializeGrid: function() {
    this._grid = [];
    for(var y = 0; y < this.height; y++) {
      for(var x = 0; x < this.width; x++) {
        this._grid.push(new MazeCell(x,y));
      }
    }
  },
  carve: function() {
    this.carver = new CarverMouse(this, 0,0);
    this.carver.events.onSolved.add(this.onCreated, this);
    this.carver.events.onTouched.add(this.carverOnTouched, this);
    this.carver.carve();
  },
  update: function() {
    this.draw();
    this.mice.forEach(function(mouse) {
      mouse.update();
    });
  },
  cellAt:function(point) {
    if(this.isPointValid(point)) {
      return this._grid.find(function(cell) {
        return cell.x === point.x && cell.y === point.y;
      });
    }
  },
  isPointValid: function(point) {
    if (point.x >= 0 && point.x < this.width && point.y >= 0 && point.y < this.height) {
      return true;
    }
    return false;
  },
  draw: function() {
    var ctx = this.ctx;
    ctx.save();
    ctx.translate(this.x, this.y);


    // draw mice
    this.mice.forEach(function(mouse) {

      if (mouse.showTrail) {
        var h;
        for (var i = 0; i < mouse.history.length; i++) {
          h = mouse.history[i].pos;
          ctx.save();
          ctx.globalAlpha = 0.15;
          ctx.translate(h.x * this.tileSize, h.y * this.tileSize);
          ctx.fillStyle = mouse.color;
          ctx.fillRect(0, 0, this.tileSize, this.tileSize);
          ctx.restore();

        }
      }
      if(!mouse.isSolved) {
        ctx.save();

        ctx.fillStyle = mouse.color;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.translate(mouse.pos.x * this.tileSize, mouse.pos.y * this.tileSize);

        ctx.rect(0, 0, this.tileSize, this.tileSize);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }, this);
    // draw grid
    this._grid.forEach(function(cell) {
      ctx.save();
      ctx.translate(cell.x * this.tileSize, cell.y * this.tileSize);
      ctx.beginPath();
      ctx.strokeStyle = '#333';
      if(cell.x === 0) {
        this.drawWestWall();
      }
      if(cell.y === 0) {
        this.drawNorthWall();
      }
      if (cell.walls === 0) {
          this.drawEastWall();
          this.drawSouthWall(ctx);
      } else {
        if (!(cell.walls & MazeCell.Walls.S)) {
          this.drawSouthWall();
        }
        if (!(cell.walls & MazeCell.Walls.E)) {
          this.drawEastWall();
        }
        if((cell.walls & MazeCell.Walls.EXIT)) {
          this.drawExit();
        }
        /*
        if((cell.walls & MazeCell.Walls.ENTRY)) {
          this.drawEntrance();
        }
        */
      }

      ctx.stroke();
      ctx.restore();
    }, this);
    ctx.restore();
  },
  drawNorthWall: function() {
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(this.tileSize, 0);
  },
  drawSouthWall: function () {
    this.ctx.moveTo(0, this.tileSize);
    this.ctx.lineTo(this.tileSize, this.tileSize);
  },
  drawEastWall: function() {
    this.ctx.moveTo(this.tileSize, 0);
    this.ctx.lineTo(this.tileSize, this.tileSize);
  },
  drawWestWall: function() {
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, this.tileSize);
  },
  drawExit: function() {this.ctx.fillStyle = '#ff00ff';
    this.ctx.fillRect(this.tileSize / 3, this.tileSize / 3, this.tileSize / 4, this.tileSize / 4);
  },
  drawEntrance: function() {
    this.ctx.fillStyle = '#00ffff';
    this.ctx.fillRect(this.tileSize / 3, this.tileSize / 3, this.tileSize / 4, this.tileSize / 4);
  },
  importMaze: function(config) {
    var cell;
    this._grid = [];
    config._grid.forEach(function(c) {
      cell = new MazeCell(c.x, c.y);
      cell.walls = c._walls;
      cell.unvisitedDirections = c.unvisitedDirections;
      this._grid.push(cell);
    }, this);
    this.width = config.width;
    this.height = config.height;
    this.totalTiles = config.totalTiles;
    this.exitCell = config.exitCell;
    this.deepestNode = config.deepestNode;
    this.depths = config.depths;
  },
  addMouse: function(mouseType, x, y, color) {
    var mouse = new mouseType(this, x, y, color);
    this.mice.push(mouse);
    mouse.events.onSolved.add(this.onSolved, this);
    return mouse;
  },
  carverOnTouched: function(percent) {
    this.events.onCarveUpdate.dispatch(percent);
  },
  onCreated: function() {
    this.isCarved = true;
    this.events.onCreated.dispatch();
    this.carver.events.onSolved.remove(this.onCreated, this);
    this.carver.events.onTouched.remove(this.carverOnTouched, this);
    delete this.carver;
  },
  onSolved: function(solveTime, stepCount) {
    var solved = true;
    this.mice.forEach(function(mouse) {
      if(!mouse.isSolved) {
        solved = false;
      }
    });
    if(solved) {
      this.events.onSolved.dispatch(this, solveTime, stepCount);
    }

  },
  destroy: function() {
    delete this.carver;
    delete this.worker;
    delete this.mice;
    delete this.depths;
    delete this._grid;
    delete this.events;

  }
};


