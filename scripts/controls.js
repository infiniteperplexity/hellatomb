HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var Controls = HTomb.Controls;
  var boundKeys = [];
  var bindKey = function(key, func) {
    boundKeys[ROT[key]] = func;
  };
  var boundKey = function(key) {
    boundKeys[key.keyCode]();
  };
  window.addEventListener("keydown", boundKey);
  Controls.actions = {};
  Controls.actions.tryMoveWest = function() {Controls.actions.tryMove('W');};
  Controls.actions.tryMoveNorth = function() {Controls.actions.tryMove('N');};
  Controls.actions.tryMoveEast = function() {Controls.actions.tryMove('E');};
  Controls.actions.tryMoveSouth = function() {Controls.actions.tryMove('S');};
  Controls.actions.tryMoveNorthWest = function() {Controls.actions.tryMove('NW');};
  Controls.actions.tryMoveNorthEast = function() {Controls.actions.tryMove('NE');};
  Controls.actions.tryMoveSouthWest = function() {Controls.actions.tryMove('SW');};
  Controls.actions.tryMoveSouthEast = function() {Controls.actions.tryMove('SE');};
  Controls.actions.tryMove = function(dir) {
    var x = HTomb.World.Player._x;
    var y = HTomb.World.Player._y;
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
          (HTomb.World.tiles[HTomb.World.levels[HTomb.World.Player._z].grid[newx][newy]].solid)) {
      console.log("Can't go that way.");
      HTomb.Display.pushMessage("Can't go that way.");
    } else {
      HTomb.World.Player.place(newx,newy,HTomb.World.Player._z);
      HTomb.turn();
    }
  };
  // bind number pad movement
  bindKey("VK_NUMPAD1",Controls.actions.tryMoveSouthWest);
  bindKey("VK_NUMPAD2",Controls.actions.tryMoveSouth);
  bindKey("VK_NUMPAD3",Controls.actions.tryMoveSouthEast);
  bindKey("VK_NUMPAD4",Controls.actions.tryMoveWest);
  bindKey("VK_NUMPAD6",Controls.actions.tryMoveEast);
  bindKey("VK_NUMPAD7",Controls.actions.tryMoveNorthWest);
  bindKey("VK_NUMPAD8",Controls.actions.tryMoveNorth);
  bindKey("VK_NUMPAD9",Controls.actions.tryMoveNorthEast);
  // bind arrow movement
  bindKey("VK_LEFT",Controls.actions.tryMoveWest);
  bindKey("VK_RIGHT",Controls.actions.tryMoveEast);
  bindKey("VK_UP",Controls.actions.tryMoveNorth);
  bindKey("VK_DOWN",Controls.actions.tryMoveSouth);
  // bind keyboard movement
  bindKey("VK_Z",Controls.actions.tryMoveSouthWest);
  bindKey("VK_S",Controls.actions.tryMoveSouth);
  bindKey("VK_X",Controls.actions.tryMoveSouth);
  bindKey("VK_C",Controls.actions.tryMoveSouthEast);
  bindKey("VK_A",Controls.actions.tryMoveWest);
  bindKey("VK_D",Controls.actions.tryMoveEast);
  bindKey("VK_Q",Controls.actions.tryMoveNorthWest);
  bindKey("VK_W",Controls.actions.tryMoveNorth);
  bindKey("VK_E",Controls.actions.tryMoveNorthEast);

  return HTomb;
})(HTomb);
