'use strict';
importScripts('../Point.js','../Maze.js', '../MazeCell.js', '../Mouse.js', '../CarverMouse.js', '../Utils.js', '../signals.js','../polyfills.js');
var maze,
    pathDistance,
    longestDistance,
    exitCell,
    entryCell,
    backTrack = [],
    depths = {},
    totalTouched,
    currentTouched,
    calls = 0;


self.addEventListener('message', begin);

var recurseEvent = new signals.Signal();
recurseEvent.add(carve);

function log() {
  self.postMessage({event: 'log', log: Array.prototype.slice.call(arguments)});
}

function begin(e) {
  longestDistance = 0;
  totalTouched = 0;
  maze = new Maze(null, null, null, null, null, null, e.data.maze);
  entryCell = maze.cellAt(e.data.startCell);
  backTrack.push(entryCell);
  do {
    carve(backTrack[backTrack.length - 1]);
    currentTouched = maze._grid.filter(function(cell) { return cell.walls !== 0; }).length;
    if(currentTouched > totalTouched) {
      totalTouched = currentTouched;
      self.postMessage({event: 'onTouched', count: totalTouched});
    }

  } while(backTrack.length);
  entryCell.walls |= MazeCell.Walls.ENTRY;
  entryCell.name = 'ENTRY';
  self.postMessage({event: 'onSolved', maze: maze.serializeForWorker()});
}



function carve(cell) {
  var nextCell, direction;
  direction = cell.unvisitedDirections.pop();
  if (direction) {
    nextCell = maze.cellAt(cell.add(direction));
    if (nextCell && nextCell.walls === 0) {
      cell.walls |= MazeCell.Walls[direction.key];
      nextCell.walls |= MazeCell.OppositeWalls[direction.key];
      backTrack.push(nextCell);
    }
  } else {
    if(!maze.depths.hasOwnProperty(backTrack.length)) {
      maze.depths[backTrack.length] = [];
    }
    maze.depths[backTrack.length].push(cell);
    if (backTrack.length > longestDistance) {
      longestDistance = backTrack.length;
      if (maze.exitCell) {
        maze.exitCell.walls ^= MazeCell.Walls.EXIT;
        maze.exitCell.name = '';
      }
      maze.exitCell = cell;
      maze.exitCell.walls |= MazeCell.Walls.EXIT;
      maze.exitCell.name = 'EXIT';
    } else {
      backTrack.pop();
    }
  }
}
