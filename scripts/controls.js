Game.boundKeys = [];
Game.bindKey = function(key, func) {
  Game.boundKeys[ROT[key]] = func;
};
Game.boundKey = function(key) {
  Game.boundKeys[key.keyCode]();
};
window.addEventListener("keydown", Game.boundKey);
Game.Player.actions = {};
Game.Player.actions.tryMoveWest = function() {Game.Player.actions.tryMove('W');};
Game.Player.actions.tryMoveNorth = function() {Game.Player.actions.tryMove('N');};
Game.Player.actions.tryMoveEast = function() {Game.Player.actions.tryMove('E');};
Game.Player.actions.tryMoveSouth = function() {Game.Player.actions.tryMove('S');};
Game.Player.actions.tryMoveNorthWest = function() {Game.Player.actions.tryMove('NW');};
Game.Player.actions.tryMoveNorthEast = function() {Game.Player.actions.tryMove('NE');};
Game.Player.actions.tryMoveSouthWest = function() {Game.Player.actions.tryMove('SW');};
Game.Player.actions.tryMoveSouthEast= function() {Game.Player.actions.tryMove('SE');};
Game.Player.actions.tryMove = function(dir) {
  var x = Game.Player.entity.x;
  var y = Game.Player.entity.y;
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
  console.log([Game.Player.entity.x, Game.Player.entity.y, Game.screen.xoffset, Game.screen.yoffset]);

  if (  newx<0 || newx>Game.Constants.levelw || newy<0 || newy>Game.Constants.levelh ||
        (Game.World.tileProperties[Game.World.levels[Game.Player.entity.z].grid[newx][newy]].solid)) {
    console.log("Can't go that way.");
  } else {
    Game.Player.entity.x = newx;
    Game.Player.entity.y = newy;
    Game.turn();
  }
};
// bind number pad movement
Game.bindKey("VK_NUMPAD1",Game.Player.actions.tryMoveSouthWest);
Game.bindKey("VK_NUMPAD2",Game.Player.actions.tryMoveSouth);
Game.bindKey("VK_NUMPAD3",Game.Player.actions.tryMoveSouthEast);
Game.bindKey("VK_NUMPAD4",Game.Player.actions.tryMoveWest);
Game.bindKey("VK_NUMPAD6",Game.Player.actions.tryMoveEast);
Game.bindKey("VK_NUMPAD7",Game.Player.actions.tryMoveNorthWest);
Game.bindKey("VK_NUMPAD8",Game.Player.actions.tryMoveNorth);
Game.bindKey("VK_NUMPAD9",Game.Player.actions.tryMoveNorthEast);
// bind arrow movement
Game.bindKey("VK_LEFT",Game.Player.actions.tryMoveWest);
Game.bindKey("VK_RIGHT",Game.Player.actions.tryMoveEast);
Game.bindKey("VK_UP",Game.Player.actions.tryMoveNorth);
Game.bindKey("VK_DOWN",Game.Player.actions.tryMoveSouth);
// bind keyboard movement
Game.bindKey("VK_Z",Game.Player.actions.tryMoveSouthWest);
Game.bindKey("VK_S",Game.Player.actions.tryMoveSouth);
Game.bindKey("VK_X",Game.Player.actions.tryMoveSouth);
Game.bindKey("VK_C",Game.Player.actions.tryMoveSouthEast);
Game.bindKey("VK_A",Game.Player.actions.tryMoveWest);
Game.bindKey("VK_D",Game.Player.actions.tryMoveEast);
Game.bindKey("VK_Q",Game.Player.actions.tryMoveNorthWest);
Game.bindKey("VK_W",Game.Player.actions.tryMoveNorth);
Game.bindKey("VK_E",Game.Player.actions.tryMoveNorthEast);
