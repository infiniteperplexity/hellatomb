HTomb = (function(HTomb) {
  "use strict"//;
  var SCREENW = HTomb.Cos.SCREENW;
  var SCREENH = HTomb.Constants.SCREENH;
  var Player = HTomb.Constants.Player;

  var display = new ROT.Display({width: SCREENW, height: SCREENH});
  document.body.appendChild(display.getContainer());

  var screen = {
    z: 1,
    xoffset: 0,
    yoffset: 0
  };

  // could we make the "Controls" module a property of the Player entity rather than the reverse?
  var render = function() {
    //= Game.SCREENWorld.tileProperties;
    if (Player.x >=screen.xoffset+SCREENW-2) {
      screen.xoffset = Player.x-SCREENW+2;
    } else if (Player.x <= screen.xoffset) {
      screen.xoffset = Player.x-1;
    }
    if (Player.y >= screen.yoffset+SCREENH-2) {
      screen.yoffset = Player.y-SCREENH+2;
    } else if (Player.y <= screen.yoffset) {
      screen.yoffset = Player.y-1;
    }
    var z = 1;
    var level = HTomb.World.levels[z];
    var grid = level.grid;
    var xoffset = screen.xoffset;
    var yoffset = screen.yoffset;
    // draw the tiles
    for (var x = xoffset; x < xoffset+SCREENW; x++) {
      for (var y = yoffset; y < yoffset+SCREENH; y++) {
        display.draw(
          x-xoffset,
          y-yoffset,
          tiles[grid[x][y][0]].symbol,
          "white",
          "black"
        );
      }
    }
    for (var feature in HTomb.level.features) {

    }
    for (var items in HTom.level.items) {

    }
    for (var unit in HTomb.level.units) {

    }
})(HTomb);
