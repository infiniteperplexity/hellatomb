HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var EARTHTONE = HTomb.Constants.EARTHTONE;
  var SHADOW = HTomb.Constants.SHADOW;
  var Tiles = HTomb.Tiles;
  var terrain = [];
  function defineTerrain(n, cons, definition) {
    HTomb.Tiles[cons] = n;
    terrain[n] = definition;
  }
  defineTerrain(-1,"VOIDTILE",{name: "boundary", symbol: " ", opaque: true, solid: true});
  //defineTerrain(0,"EMPTYTILE",{name: "empty", symbol: "\u25CB", fg: "#6666DD", fallable: true});
  defineTerrain(0,"EMPTYTILE",{name: "empty", symbol: ".", fg: "#444444", fallable: true});
  defineTerrain(1,"FLOORTILE",{name: "floor", symbol: "."});
  defineTerrain(2,"WALLTILE",{name: "wall", symbol: "#", opaque: true, solid: true});

  Tiles.randomEmptyNeighbor = function(x,y,z) {
    var d = [
      [ 0, -1],
      [ 1, -1],
      [ 1,  0],
      [ 1,  1],
      [ 0,  1],
      [-1,  1],
      [-1,  0],
      [-1, -1]
    ].randomize();
    var square;
    for (var j=0; j<d.length; j++) {
      square = HTomb.Tiles.getSquare(x+d[j][0],y+d[j][1],z);
      if (square.terrain.solid===undefined && square.creature===undefined) {
        return [x+d[j][0],y+d[j][1],z];
      }
    }
    return false;
  };
  Tiles.coord = function(x,y,z) {
    //return x*LEVELW*LEVELH + y*LEVELH + z;
    return z*NLEVELS*LEVELW + x*LEVELW + y;
  };
  Tiles.fillSquare = function(x,y,z) {
    // check for more stuff in a while
    if (HTomb.World.features[x*LEVELW*LEVELH+y*LEVELH+z]) {
      HTomb.World.features[x*LEVELW*LEVELH+y*LEVELH+z].remove();
    }
    HTomb.World.levels[z].grid[x][y] = HTomb.Tiles.WALLTILE;
    if (HTomb.World.levels[z+1].grid[x][y]===HTomb.Tiles.EMPTYTILE) {
      HTomb.World.levels[z+1].grid[x][y] = HTomb.Tiles.FLOORTILE;
    }
  };
  Tiles.emptySquare = function(x,y,z) {
    if (HTomb.World.levels[z-1].grid[x][y]===HTomb.Tiles.WALLTILE) {
      HTomb.World.levels[z].grid[x][y] = HTomb.Tiles.FLOORTILE;
    } else {
      HTomb.World.levels[z].grid[x][y] = HTomb.Tiles.EMPTYTILE;
    }
    if (HTomb.World.levels[z+1].grid[x][y]===HTomb.Tiles.FLOORTILE) {
      HTomb.World.levels[z+1].grid[x][y] = HTomb.Tiles.EMPTYTILE;
    }
  };
  Tiles.neighbors = function(x,y) {
    var squares = [];
    var dirs = ROT.DIRS[8];
    var x1, y1;
    for (var i=0; i<8; i++) {
      x1 = x+dirs[i][0];
      y1 = y+dirs[i][1];
      if (x1>=0 && x1<LEVELW && y1>=0 && y1<LEVELH) {
        squares.push([x1,y1]);
      }
    }
    return squares;
  };
  Tiles.groundLevel = function(x,y) {
    for (var z=NLEVELS-2; z>0; z--) {
      if (terrain[HTomb.World.levels[z].grid[x][y]].solid===true) {
        return z;
      }
    }
  };
  Tiles.getSquare = function(x,y,z) {
    var square = {};
    var coord = x*LEVELW*LEVELH + y*LEVELH + z;
    var grid = HTomb.World.levels[z].grid;
    square.terrain = terrain[grid[x][y]];
    square.creature = HTomb.World.creatures[coord];
    square.items = HTomb.World.items[coord];
    square.feature = HTomb.World.features[coord];
    square.portals = HTomb.World.portals[coord];
    square.zone = HTomb.World.zones[coord];
    square.x = x;
    square.y = y;
    square.z = z;
    return square;
  };


  Tiles.getSymbol = function(x,y,z,options) {
    options = options || {};
    var autovisible = (options.visible===true) ? true : false;
    var vis = HTomb.FOV.visible;
    var creatures = HTomb.World.creatures;
    var items = HTomb.World.items;
    var features = HTomb.World.features;
    var zones = HTomb.World.zones;
    //var coord = Tiles.coord(x,y,z);
    var coord = x*LEVELW*LEVELH + y*LEVELH + z;
    var level = HTomb.World.levels[z];
    var grid = level.grid;
    var explored = level.explored;
    // should also check to make sure the current square is empty
    if (explored[x][y]===true && vis[x][y]===true && grid[x][y]===Tiles.EMPTYTILE && HTomb.World.levels[z-1].grid[x][y]===Tiles.FLOORTILE) {
      var below = Tiles.getSymbol(x,y,z-1,{visible: true});
      return [below[0],"#444444","black"];
    }
    if (explored[x][y]===true && vis[x][y]===true && grid[x][y]===Tiles.WALLTILE && HTomb.World.levels[z+1].grid[x][y]===Tiles.FLOORTILE) {
      var above = Tiles.getSymbol(x,y,z+1,{visible: true});
      return [above[0],"#444444","black"];
    }
    var sym, fg, bg, thing;
    fg = "white";
    bg = (zones[coord]===undefined) ? "black" : zones[coord].bg;
    if (!explored[x][y] && autovisible===false) {
      sym = " ";
    } else if (vis[x][y]===false && autovisible===false) {
      fg = SHADOW;
      if (items[coord]) {
        thing = items[coord][items[coord].length-1];
        sym = thing.symbol || "X";
      } else if (features[coord]) {
        thing = features[coord];
        sym = thing.symbol || "X";
      } else {
        sym = terrain[grid[x][y]].symbol || "X";
      }
    } else {
      if (creatures[coord]) {
        thing = creatures[coord];
        sym = thing.symbol || "X";
        fg = thing.fg || "white";
      } else if (items[coord]) {
        thing = items[coord][items[coord].length-1];
        sym = thing.symbol || "X";
        fg = thing.fg || "white";
      } else if (features[coord]) {
        thing = features[coord];
        sym = thing.symbol || "X";
        fg = thing.fg || EARTHTONE;
      } else {
        thing = terrain[grid[x][y]];
        sym = thing.symbol || "X";
        fg = thing.fg || EARTHTONE;
      }
    }
    return [sym,fg,bg];
  };

  Tiles.terrain = terrain;
  return HTomb;
})(HTomb);
