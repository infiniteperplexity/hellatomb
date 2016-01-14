HTomb = (function(HTomb) {
  "use strict";
  var SCREENW = HTomb.Constants.SCREENW;
  var SCREENH = HTomb.Constants.SCREENH;


  var display = new ROT.Display({width: SCREENW, height: SCREENH});
  document.body.appendChild(display.getContainer());

  var screen = {
    z: 1,
    xoffset: 0,
    yoffset: 0
  };

  var drawAt = function(x,y,ch,fg,bg) {
    fg = fg || "white";
    bg = bg || "black";
    display.draw(
      x-screen.xoffset,
      y-screen.yoffset,
      ch,
      fg,
      bg
    );
  };

  var render = function() {
    var Player = HTomb.World.Player;
    var z = Player._z;
    if (Player._x >=screen.xoffset+SCREENW-2) {
      screen.xoffset = Player._x-SCREENW+2;
    } else if (Player._x <= screen.xoffset) {
      screen.xoffset = Player._x-1;
    }
    if (Player._y >= screen.yoffset+SCREENH-2) {
      screen.yoffset = Player._y-SCREENH+2;
    } else if (Player._y <= screen.yoffset) {
      screen.yoffset = Player._y-1;
    }
    var level = HTomb.World.levels[z];
    var grid = level.grid;
    var xoffset = screen.xoffset;
    var yoffset = screen.yoffset;
    var tiles = HTomb.World.tiles;
    var vis = HTomb.FOV.visible;
    for (var x = xoffset; x < xoffset+SCREENW; x++) {
      for (var y = yoffset; y < yoffset+SCREENH; y++) {
        display.draw(
          x-xoffset,
          y-yoffset,
          tiles[grid[x][y]].symbol,
          (vis[x][y]===true) ? "red" : "white",
          "black"
        );
      }
    }
    var creatures = HTomb.World.creatures;
    for (var key in creatures) {
      if (creatures[key]._z === z) {
        var creature = creatures[key];
        display.draw(
          creature._x-xoffset,
          creature._y-yoffset,
          creature.symbol,
          creature.fg || "white",
          creature.bg || "black"
        );
      }
    }
  };
/*
  // could we make the "Controls" module a property of the Player entity rather than the reverse?
  var render = function() {
    //= Game.SCREENWorld.tileProperties;
    if (Player._x >=screen.xoffset+SCREENW-2) {
      screen.xoffset = Player._x-SCREENW+2;
    } else if (Player._x <= screen.xoffset) {
      screen.xoffset = Player._x-1;
    }
    if (Player._y >= screen.yoffset+SCREENH-2) {
      screen.yoffset = Player._y-SCREENH+2;
    } else if (Player._y <= screen.yoffset) {
      screen.yoffset = Player._y-1;
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
    */
    HTomb.Display.display = display;
    HTomb.Display.render = render;
    HTomb.Display.drawAt = drawAt;
    return HTomb;
})(HTomb);
