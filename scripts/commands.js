HTomb = (function(HTomb) {
  "use strict";
  var Commands = HTomb.Commands;
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  Commands.tryMoveWest = function() {Commands.tryMove('W');};
  Commands.tryMoveNorth = function() {Commands.tryMove('N');};
  Commands.tryMoveEast = function() {Commands.tryMove('E');};
  Commands.tryMoveSouth = function() {Commands.tryMove('S');};
  Commands.tryMoveNorthWest = function() {Commands.tryMove('NW');};
  Commands.tryMoveNorthEast = function() {Commands.tryMove('NE');};
  Commands.tryMoveSouthWest = function() {Commands.tryMove('SW');};
  Commands.tryMoveSouthEast = function() {Commands.tryMove('SE');};
  Commands.tryMove = function(dir) {
    var x = HTomb.Player._x;
    var y = HTomb.Player._y;
    var newx = x;
    var newy = y;
    if (dir==='N') {
      newy-=1;
    } else if (dir==='NW') {
      newx-=1;
      newy-=1;
    } else if (dir==='NE') {
      newx+=1;
      newy-=1;
    } else if (dir==='S') {
      newy+=1;
    } else if (dir==='SW') {
      newx-=1;
      newy+=1;
    } else if (dir==='SE') {
      newx+=1;
      newy+=1;
    } else if (dir==='W') {
      newx-=1;
    } else if (dir==='E') {
      newx+=1;
    }
    if (  newx<0 || newx>LEVELW || newy<0 || newy>LEVELH ||
          (HTomb.World.tiles[HTomb.World.levels[HTomb.Player._z].grid[newx][newy]].solid) ||
          (HTomb.World.tiles[HTomb.World.levels[HTomb.Player._z].grid[newx][newy]].fallabe)
        ) {
      console.log("Can't go that way.");
      HTomb.GUI.pushMessage("Can't go that way.");
    } else {
      HTomb.Player.place(newx,newy,HTomb.Player._z);
      HTomb.turn();
    }
  };
  Commands.glance = function(x,y) {
    HTomb.GUI.pushMessage("Clicked at " + x +", " + y +".");
  };
  return HTomb;
})(HTomb);
