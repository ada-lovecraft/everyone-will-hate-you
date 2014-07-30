'use strict';
var CarverMouse = function(maze, x, y, color) {
  Mouse.call(this, maze, color);
  this.pathDistance = 0;
  this.longestDistance = 0;
  this.events.onRecurse = new signals.Signal();
  this.events.onRecurse.add(this.solver, this);
  this.events.onTouched = new signals.Signal();
  this.worker = new Worker('js/workers/CarveWorker.js');
  this.worker.addEventListener('message', function(e) {
    switch(e.data.event) {
      case 'onSolved':
        console.log('created');
        this.maze.importMaze(e.data.maze);
        this.worker = null;
        this.events.onSolved.dispatch();
        break;
      case 'onTouched':
        this.events.onTouched.dispatch(e.data.count/maze.totalTiles * 100);
        break;
      case 'log':
        console.log.apply(console,e.data.log);
        break;
      default:
        console.log('message from worker:', e);
        break;
    }
  }.bind(this));

  this.worker.onerror = function(evt) {
    console.log('error:', evt);
  };
};

CarverMouse.prototype = Object.create(Mouse.prototype);
CarverMouse.prototype.constructor = CarverMouse;

CarverMouse.prototype.carve = function() {
  this.worker.postMessage({maze:this.maze.serializeForWorker(), startCell: {x: 0, y: 0 } });
};


