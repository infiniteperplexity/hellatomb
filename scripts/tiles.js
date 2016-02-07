HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var EARTHTONE = HTomb.Constants.EARTHTONE;
  var SHADOW = HTomb.Constants.SHADOW;
  var ABOVE = HTomb.Constants.ABOVE;
  var BELOW = HTomb.Constants.BELOW;
  HTomb.Constants.FLOORBELOW = "\u25E6";
  var Tiles = HTomb.Tiles;
  var terrain = [];
  function defineTerrain(cons, definition) {
    HTomb.Tiles[cons] = terrain.length;
    terrain.push(definition);
  }
  defineTerrain(
    "VOIDTILE",{
      name: "boundary",
      symbol: " ",
      opaque: true,
      solid: true
  });
  defineTerrain(
    "EMPTYTILE",{
      name: "empty",
      symbol: "\u25CB",
      zview: -1,
      fg: HTomb.Constants.BELOW,
      fallable: true
  });
  defineTerrain(
    "FLOORTILE",{
      name: "floor",
      symbol: "."
  });
  defineTerrain(
    "WALLTILE",{
      name: "wall",
      symbol: "#",
      fg: HTomb.Constants.ABOVE,
      opaque: true,
      solid: true
  });
  defineTerrain(
    "UPSLOPE",{
      fg: HTomb.Constants.ABOVE,
      name: "upward slope",
      symbol: "\u02C4",
      zview: +1,
      zmove: +1
  });
  defineTerrain(
    "DOWNSLOPE",{
      name: "downward slope",
      symbol: "\u02C5",
      fg: HTomb.Constants.BELOW,
      zview: -1,
      zmove: -1,
      features: false
  });

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
    square.explored = HTomb.World.levels[z].explored[x][y];
    square.x = x;
    square.y = y;
    square.z = z;
    return square;
  };
  Tiles.getNeighbors = function(x,y,z) {
    var dirs = ROT.DIRS[8];
    var x1, y1;
    var neighbors = {};
    neighbors.squares = [];
    neighbors.fallables = [];
    for (var i=0; i<8; i++) {
      x1 = x+dirs[i][0];
      y1 = y+dirs[i][1];
      if (x1>=0 && x1<LEVELW && y1>=0 && y1<LEVELH) {
        neighbors.squares.push([x1,y1,z]);
        var square = Tiles.getSquare(x1,y1,z);
        if (square.terrain.fallable) {
          neighbors.fallables.push([x1,y1,z]);
        }
      }
    }
    return neighbors;
  };
  Tiles.explore = function(x,y,z) {
    HTomb.World.levels[z].explored[x][y] = true;
  };
Tiles.getSymbol = function(x,y,z) {
  var vis = HTomb.FOV.visible;
  var coord = x*LEVELW*LEVELH + y*LEVELH + z;
  var creatures = HTomb.World.creatures;
  var items = HTomb.World.items;
  var features = HTomb.World.features;
  var zones = HTomb.World.zones;
  var levels = HTomb.World.levels;
  var level = HTomb.World.levels[z];
  var grid = level.grid;
  var explored = level.explored;
  var zview = terrain[grid[x][y]].zview;
  // if the square has not been explored, don't show it
  if (!explored[x][y] && HTomb.Debug.explored!==true) {
    return [" ","black","black"];
  }
  // background color for explored squares is based on zoning
    // maybe at some point, liquids
  var fg = "white";
  var bg = (zones[coord]===undefined) ? "black" : zones[coord].bg;
  // square explored but not visible
  if (vis[x][y]===false && HTomb.Debug.visible!==true) {
    fg = HTomb.Constants.SHADOW;
    if (features[coord]) {
      // feature in shadow
      return [features[coord].symbol || "X",fg,bg];
    } else if (zview===+1 && features[coord+1]) {
      // feature on level above
      return [features[coord+1].symbol || "X",fg,bg];
    } else if (zview===-1 && features[coord-1]) {
      // feature on level below
      return [features[coord-1].symbol || "X",fg,bg];
      // an empty space with floor below it
    } else if (grid[x][y]===Tiles.EMPTYTILE && levels[z-1].grid[x][y]===Tiles.FLOORTILE) {
      return [HTomb.Constants.FLOORBELOW,fg,bg];
    } else if (grid[x][y]===Tiles.EMPTYTILE && levels[z-1].grid[x][y]===Tiles.FLOORTILE) {
      return [HTomb.Constants.FLOORBELOW,fg,bg];
    } else {
      // terrain on current level
      return [terrain[grid[x][y]].symbol || "X",fg,bg];
    }
  } else {
    // visible square
    if (creatures[coord]) {
      return [creatures[coord].symbol || "X", creatures[coord].fg || fg,bg];
    } else if (zview===+1 && creatures[coord+1]) {
      return [creatures[coord+1].symbol || "X",ABOVE,bg];
    } else if (zview===-1 && creatures[coord-1]) {
      return [creatures[coord-1].symbol || "X",BELOW,bg];
    } else if (items[coord]) {
      return [items[coord][items[coord].length-1].symbol || "X",items[coord][items[coord].length-1].fg || fg,bg];
    } else if (features[coord]) {
      return [features[coord].symbol || "X", features[coord].fg || fg,bg];
    } else if (zview===+1 && items[coord+1]) {
      return [items[coord+1][items[coord+1].length-1].symbol || "X",ABOVE,bg];
    } else if (zview===-1 && items[coord-1]) {
      return [items[coord-1][items[coord-1].length-1].symbol || "X",BELOW,bg];
    } else if (zview===+1 && features[coord+1]) {
      return [features[coord+1].symbol || "X",ABOVE,bg];
    } else if (zview===-1 && features[coord-1]) {
      return [features[coord-1].symbol || "X",BELOW,bg];
    } else if (grid[x][y]===Tiles.EMPTYTILE && levels[z-1].grid[x][y]===Tiles.FLOORTILE) {
      return [HTomb.Constants.FLOORBELOW,BELOW,bg];
    } else if (grid[x][y]===Tiles.FLOORTILE) {
      fg = ROT.Color.fromString(terrain[grid[x][y].fg] || HTomb.Constants.EARTHTONE);
      fg = ROT.Color.add(fg,HTomb.World.colors[x][y]);
      fg = ROT.Color.toHex(fg);
      return [terrain[grid[x][y]].symbol || "X",fg,bg];
    } else {
      return [terrain[grid[x][y]].symbol || "X",terrain[grid[x][y]].fg,bg];
    }
  }
  return ["X","red","black"];
};
  Tiles.terrain = terrain;
  return HTomb;
})(HTomb);
