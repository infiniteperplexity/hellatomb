HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var levels = [];
  var actors = [];
  var FLOORTILE = 0;
  var WALLTILE = 1;
  var tiles = [];
  tiles[FLOORTILE] = {symbol: "."};
  tiles[WALLTILE]  = {symbol: "#", opaque: true, solid: true};

  function addLevel(z) {
    var level = {};
    if (z===undefined) {
      z = levels.length;
    }
    levels[z] = level;
    level.grid = [];
    for (var x=0; x<LEVELW; x++) {
      level.grid.push([]);
      for (var y=0; y<LEVELH; y++) {
        if (x===0 || x===LEVELW-1 || y===0 || y===LEVELH-1 || z===0 || z===NLEVELS-1) {
          level.grid[x][y] = WALLTILE;
        } else {
          level.grid[x][y] = FLOORTILE;
        }
      }
    }
    level.critters = {};
  }

  HTomb.World.levels = levels;
  HTomb.World.actors = actors;
  HTomb.World.tiles = tiles;
  HTomb.World.init = function() {
    for (var z=0; z<NLEVELS; z++) {
      addLevel();
    }
  };
  return HTomb;
})(HTomb);
