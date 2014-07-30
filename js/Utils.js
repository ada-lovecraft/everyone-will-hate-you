'use strict';
// Returns a shuffled copy of the array;
Array.prototype.shuffle = function() {
  var arr = this.slice(0);
  var counter = this.length,
    temp, index;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }

  return arr;
};

Object.prototype.serializeForWorker = function() {
  var obj = {};
  for(var k in this) {
    if(this.hasOwnProperty(k)) {
      try {
        JSON.parse(JSON.stringify(this[k]));
        obj[k] = this[k];
      } catch(e) {
        //console.log('could not serialize:', k, this[k]);
      }
    }
  }
  obj = JSON.parse(JSON.stringify(obj));
  return obj;
};
