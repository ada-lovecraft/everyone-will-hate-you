'use strict';
var Game = function(ctx) {
  this.mazes = [];
  this.miceStats = [];
  this.mouseSolveSpeed = 1000;
  this.mouseType = WalkerMouse;
  this.ctx = ctx;
  this.ctx.canvas.width = 1200;
  this.ctx.canvas.height = 600;

  this.mazeWidth = 10;
  this.mazeHeight = 10;
  this.tileSize = 30;
  this.mazePixelWidth = this.mazeWidth * this.tileSize;
  this.mazePixelHeight = this.mazeHeight * this.tileSize;
  this.lifetimeSatisfaction = 0;
  this.satisfaction = 1000000;
  this.maxSatisfaction = 0;
  this.mazeSatisfaction = 100;

  this._raf = window.requestAnimationFrame;
  this.updateFrame = null;
  this.update();

  this.speedBtn = null;
  this.difficultyBtn = null;
  this.mazesBtn = null;
  this.miceBtn = null;

  this.satisfactionView = null;
  this.speedView = null;
  this.difficultyView = null;
  this.mazesView = null;
  this.miceView = null;

  this.bindButtons();
  this.bindView();

  this.updateView();



};


Game.prototype.bindButtons = function() {
  this.speedBtn = document.getElementById('speedBtn');
  this.difficultyBtn = document.getElementById('difficultyBtn');
  this.mazesBtn = document.getElementById('mazesBtn');
  this.miceBtn = document.getElementById('miceBtn');

  this.speedBtn.addEventListener('click', function() {
    this.increaseMouseSpeed();
  }.bind(this));

  this.difficultyBtn.addEventListener('click', function() {
    this.increaseDifficulty();
  }.bind(this));

  this.mazesBtn.addEventListener('click', function() {
    this.increaseMazeCount();
  }.bind(this));

  this.miceBtn.addEventListener('click', function() {
    this.increaseMiceCount();
  }.bind(this));
};

Game.prototype.bindView = function() {
  this.satisfactionView = document.getElementById('satisfactionView');
  this.speedView = document.getElementById('speedView');
  this.difficultyView = document.getElementById('difficultyView');
  this.mazesView = document.getElementById('mazesView');
  this.miceView = document.getElementById('miceView');
};

Game.prototype.update = function() {
  ctx.clearRect(0,0, window.innerWidth, window.innerHeight);
  this.mazes.forEach(function(maze){
    if(maze.isCarved) {
      maze.update();
    }
  }, this);
  this.updateFrame = this._raf.call(window,this.update.bind(this));
};


Game.prototype.updateView = function() {
  this.satisfactionView.innerHTML = this.satisfaction;
  this.speedView.innerHTML = (1/(Game.Inventory.Speed.value / 1000)).toFixed(2) + ' decisions/second';
  this.speedBtn.innerHTML = Game.Inventory.Speed.level >= Game.Inventory.Speed.levels.maxLevel ? 'MAX!' : 'Faster Mice: $' + Game.Inventory.Speed.nextCost;
  this.difficultyBtn.innerHTML = Game.Inventory.Difficulty.level >= Game.Inventory.Difficulty.levels.maxLevel ? 'MAX!' : 'Harder Mazes: $' + Game.Inventory.Difficulty.nextCost;
  this.mazesBtn.innerHTML = Game.Inventory.Mazes.level >= Game.Inventory.Mazes.levels.maxLevel ? 'MAX!': 'More Mazes: $' + Game.Inventory.Mazes.nextCost;
  this.miceBtn.innerHTML = Game.Inventory.Mice.level >= Game.Inventory.Mice.levels.maxLevel ? 'MAX!' : 'More Mice: $' + Game.Inventory.Mice.nextCost;
  this.speedBtn.disabled = this.satisfaction < Game.Inventory.Speed.nextCost || Game.Inventory.Speed.level >= Game.Inventory.Speed.levels.maxLevel ? true : false;
  this.difficultyBtn.disabled = this.satisfaction < Game.Inventory.Difficulty.nextCost  || Game.Inventory.Difficulty.level >= Game.Inventory.Difficulty.levels.maxLevel ? true : false;
  this.mazesBtn.disabled = this.satisfaction < Game.Inventory.Mazes.nextCost  || Game.Inventory.Mazes.level >= Game.Inventory.Mazes.levels.maxLevel ? true : false;
  this.miceBtn.disabled = this.satisfaction < Game.Inventory.Mice.nextCost  || Game.Inventory.Mice.level >= Game.Inventory.Mice.levels.maxLevel ? true : false;
};

Game.prototype.addMaze = function() {

  var maze = new Maze(this.ctx, 0,0, Game.Inventory.Difficulty.value.width, Game.Inventory.Difficulty.value.height, 0);
  maze.carve();
  maze.id = Game.MazeId++;

  this.mazes.push(maze);
  maze.events.onCreated.add(function() {
    for(var i = 0; i < Game.Inventory.Mice.value; i++) {
      var mouse = this.addRandomMouse(maze);
      mouse.color = Mouse.Colors[i];
    }
  }.bind(this));
  maze.events.onSolved.add(this.onMazeSolved, this);
  this.alignMazes();
};

Game.prototype.alignMazes = function() {
  var tileSize = 600 / (Game.Inventory.Difficulty.value.width * Game.Inventory.Mazes.value);

  this.mazePixelWidth = tileSize * Game.Inventory.Difficulty.value.width;

  var yCount = 0;
  var xCount = 0;
  this.mazes.forEach(function(maze, index) {
    if(index > 0 && index % 4 === 0) {
      yCount++;
      xCount = 0;
    }
    var x = this.mazePixelWidth * xCount + (10 * xCount);

    maze.x = x;
    maze.y = this.mazePixelWidth * yCount + (10 * yCount);
    maze.tileSize = tileSize;
    xCount++;
  }, this);
};
Game.prototype.onMazeSolved = function(maze, solveTime, stepCount) {

  this.miceStats.push({time: solveTime, stes: stepCount});
  this.lifetimeSatisfaction += Math.floor(Game.Inventory.Difficulty.value.satisfaction);

  this.satisfactionView.innerHTML = this.satisfaction;
  this.removeMaze(maze.id);
  this.addMaze();
  this.updateView();
};
Game.prototype.onMouseSolved = function() {

  this.satisfaction += Math.floor(Game.Inventory.Difficulty.value.satisfaction);
  this.lifetimeSatisfaction += Math.floor(Game.Inventory.Difficulty.value.satisfaction);
  this.updateView();
};

Game.prototype.increaseMouseSpeed = function() {

  this.satisfaction -= Game.Inventory.Speed.nextCost;
  Game.Inventory.Speed.level++;

  Game.Inventory.Speed.nextCost *= Game.Inventory.Speed.levels.cost;
  Game.Inventory.Speed.nextCost = Math.ceil(Game.Inventory.Speed.nextCost);
  Game.Inventory.Speed.value += Game.Inventory.Speed.levels.value;
  this.mazes.forEach(function(maze) {
    maze.mice.forEach(function(mouse) {
      mouse.solveSpeed = Game.Inventory.Speed.value;
    });
  });
  this.updateView();
};

Game.prototype.increaseMiceCount = function() {

  this.satisfaction -= Game.Inventory.Mice.nextCost;
  Game.Inventory.Mice.level++;

  Game.Inventory.Mice.nextCost *= Game.Inventory.Mice.levels.cost;
  Game.Inventory.Mice.nextCost = Math.ceil(Game.Inventory.Mice.nextCost);
  Game.Inventory.Mice.value += Game.Inventory.Mice.levels.value;
  this.mazes.forEach(function(maze, index) {
    var mouse = this.addRandomMouse(maze);
    mouse.color = Mouse.Colors[maze.mice.length - 1];
  }, this);
  this.updateView();
};

Game.prototype.increaseMazeCount = function() {

  this.satisfaction -= Game.Inventory.Mazes.nextCost;
  Game.Inventory.Mazes.level++;
  Game.Inventory.Mazes.nextCost *= Game.Inventory.Mazes.levels.cost;
  Game.Inventory.Mazes.nextCost = Math.ceil(Game.Inventory.Mazes.nextCost);
  Game.Inventory.Mazes.value += Game.Inventory.Mazes.levels.value;
  console.log('totalMazes:', Game.Inventory.Mazes.value);
  this.cycleMazes();
  this.updateView();
};
Game.prototype.increaseDifficulty = function() {
  this.satisfaction -= Game.Inventory.Difficulty.nextCost;
  Game.Inventory.Difficulty.level++;
  Game.Inventory.Difficulty.nextCost *= Game.Inventory.Difficulty.levels.cost;
  Game.Inventory.Difficulty.nextCost = Math.ceil(Game.Inventory.Difficulty.nextCost);
  Game.Inventory.Difficulty.value.width += Game.Inventory.Difficulty.levels.value.width;
  Game.Inventory.Difficulty.value.height += Game.Inventory.Difficulty.levels.value.height;
  Game.Inventory.Difficulty.value.tileSize = 600 / Game.Inventory.Difficulty.value.width;
  Game.Inventory.Difficulty.value.satisfaction *= Game.Inventory.Difficulty.levels.value.satisfaction;

  this.cycleMazes();
  this.updateView();
};

Game.prototype.cycleMazes = function() {
  var ids = this.mazes.map(function(maze) {
    return maze.id;
  });

  ids.forEach(function(id) {
    this.removeMaze(id);
  }, this);

  for(var i = 0; i < Game.Inventory.Mazes.value; i++) {
    this.addMaze();
  }
};

Game.prototype.removeMaze = function(id) {
  var mazeIndex = -1;
  var m;
  for(var i = 0, len = this.mazes.length; i < len; i++ ){
    if(this.mazes[i].id === id) {
      mazeIndex = i;
      break;
    }
  }
  if(mazeIndex >= 0) {
    m = this.mazes.splice(mazeIndex, 1);
    m[0].destroy();
    m[0] = null;
  }
  this.mazes.forEach(function(maze, index) {
    maze.x = (this.mazePixelWidth * index) % 1200;
  }, this);

};

Game.prototype.addRandomMouse = function(maze) {
  var x,y;
  if(Math.random() > 0.5) {
    if(Math.random() > 0.5) {
      x = 0;
    } else {
      x = Game.Inventory.Difficulty.value.width-1;
    }

    y = Math.floor(Math.random() * Game.Inventory.Difficulty.value.height-1) + 1;
  } else {
    x = Math.floor(Math.random() * Game.Inventory.Difficulty.value.width-1) + 1;
    if(Math.random() > 0.5) {
      y = 0;
    } else {
      x = Game.Inventory.Difficulty.value.height-1;
    }

  }

  var mouse = maze.addMouse(this.mouseType, x,y);
  mouse.solveSpeed = Game.Inventory.Speed.value;
  mouse.events.onSolved.add(this.onMouseSolved, this);
  return mouse;
};

Game.MazeId = 0;

Game.Inventory = {
  Mazes: {
    level: 1,
    baseCost: 0,
    nextCost: 1000,
    value: 1,
    levels: {
      value: 1,
      cost: 10,
      maxLevel: 8
    }
  },
  Difficulty: {
    level: 1,
    value: {
      width: 3,
      height: 3,
      tileSize: 200,
      satisfaction: 10
    },
    baseCost: 0,
    nextCost: 100,
    levels: {
      value: {
        width: 1,
        height: 1,
        satisfaction: 5
      },
      cost: 2.5,
      maxLevel: 20
    }
  },
  Mice: {
    level: 1,
    value: 1,
    baseCost: 0,
    nextCost: 1000,
    levels: {
      value: 1,
      cost: 1.15,
      maxLevel: 10
    }
  },
  Speed: {
    level: 1,
    baseCost: 0,
    nextCost: 10,
    value: 1000,
    levels: {
      value: -50,
      cost: 1.15,
      maxLevel: 20
    }
  }
};

