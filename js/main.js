'use strict';
var canvas, ctx, progressEl,game, updateFrame, raf;
var speedBtn;

raf = window.requestAnimationFrame;

function main() {
  canvas = document.getElementById('maze');
  ctx = canvas.getContext('2d');
  if (!ctx) {
    throw (new Error('you suck and you should kill yourself'));
  }

  progressEl = document.getElementById('progressPercent');
  game = new Game(ctx);
  game.addMaze();
  console.log('the game begins...');
}

main();
