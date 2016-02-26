HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var EARTHTONE = HTomb.Constants.EARTHTONE;
  var SHADOW = HTomb.Constants.SHADOW;
  var ABOVE = HTomb.Constants.ABOVE;
  var BELOW = HTomb.Constants.BELOW;
  var coord = HTomb.coord;

  var Tiles = HTomb.Tiles;
  // Define a generic tile
  HTomb.Things.define({
    template: "Terrain",
    name: "terrain",
    parent: "Thing",
    symbol: "X",
    fg: "white",
    bg: "black",
    types: [],
    onDefine: function() {
      HTomb.Tiles[this.template] = this;
      HTomb.Things.templates.Terrain.types.push(this);
    },
    stringify: function() {
      // returns a number
      return HTomb.Things.templates.Terrain.types.indexOf(this);
    },
    parse: function(json) {
      // parses a number into a terrain type
      return HTomb.Things.templates.Terrain.types[json];
    }
  });

  // Define specific types of tiles
  HTomb.Things.defineTerrain({
    template: "VoidTile",
    name: "boundary",
    symbol: " ",
    opaque: true,
    solid: true,
    immutable: true
  });
  HTomb.Things.defineTerrain({
    template: "EmptyTile",
    name: "empty",
    //symbol: "\u25CB",
    //symbol: "\u25E6",
    symbol: HTomb.Constants.FLOORBELOW,
    zview: -1,
    //fg: BELOW,
    fg: HTomb.Constants.TWOBELOW,
    //bg: HTomb.Constants.BELOWBG,
    bg: "black",
    fallable: true
  });
  HTomb.Things.defineTerrain({
    template: "FloorTile",
    name: "floor",
    symbol: ".",
    fg: EARTHTONE,
    bg: HTomb.Constants.FLOORBG
  });
  HTomb.Things.defineTerrain({
    template: "WallTile",
    name: "wall",
    symbol: "#",
    fg: ABOVE,
    opaque: true,
    solid: true,
    bg: HTomb.Constants.WALLBG
  });
  HTomb.Things.defineTerrain({
    template: "UpSlopeTile",
    name: "upward slope",
    symbol: "\u02C4",
    constructionSymbol: "\u25BF",
    fg: ABOVE,
    zview: +1,
    zmove: +1,
    bg: HTomb.Constants.WALLBG
  });
  HTomb.Things.defineTerrain({
    template: "DownSlopeTile",
    name: "downward slope",
    symbol: "\u02C5",
    zview: -1,
    zmove: -1,
    fg: BELOW,
    bg: HTomb.Constants.BELOWBG,
    allowsFeatures: false
  });

  Tiles.getSymbol = function(x,y,z) {
    var fg, bg;
    // if (x===0 || y===0 || x===LEVELW-1 || y===LEVELH-1) {
    //   fg = HTomb.Constants.EARTHTONE;
    //   bg = "black";
    //   if (x===0) {
    //     if (y===0) {
    //       return ["\u2554",fg,bg];
    //     } else if (y===LEVELH-1) {
    //       return ["\u255A",fg,bg];
    //     } else {
    //       return ["\u2551",fg,bg];
    //     }
    //   } else if (x===LEVELW-1) {
    //     if (y===0) {
    //       return ["\u2557",fg,bg];
    //     } else if (y===LEVELH-1) {
    //       return ["\u255D",fg,bg];
    //     } else {
    //       return ["\u2551",fg,bg];
    //     }
    //   } else {
    //     return ["\u2550",fg,bg];
    //   }
    // }
    var crd = HTomb.coord(x,y,z);
    var cabove = HTomb.coord(x,y,z+1);
    var cbelow = HTomb.coord(x,y,z-1);
    var tiles = HTomb.World.tiles;
    var creatures = HTomb.World.creatures;
    var items = HTomb.World.items;
    var features = HTomb.World.features;
    var liquids = HTomb.World.liquids;
    var zones = HTomb.World.zones;
    var visible = HTomb.World.visible;
    var explored = HTomb.World.explored;
    var tile = tiles[z][x][y];
    var zview = tiles[z][x][y].zview;
    fg = "white";
    bg = null;
    if (zones[crd]!==undefined) {
      bg = zones[crd].bg;
    }
    //if the square has not been explored, don't show it
    if (!explored[z][x][y] && HTomb.Debug.explored!==true) {
      if (tiles[z+1][x][y]===Tiles.FloorTile && explored[z+1][x][y]) {
        return[HTomb.Constants.FLOORABOVE,HTomb.Constants.SHADOW,HTomb.Constants.WALLBG];
      } else {
      //return [" ","black","black"];
        return [" ","black",bg || "black"];
      }
    }
    // background color for explored squares is based on zoning
      // maybe at some point, liquids
    if (liquids[crd]!==undefined) {
      bg = liquids[crd].shimmer();
    }
    if (zones[crd]!==undefined) {
      bg = zones[crd].bg;
    }
    // square explored but not visible
    if (visible[z][x][y]===false && HTomb.Debug.visible!==true) {
      fg = HTomb.Constants.SHADOW;
      if (liquids[crd]!==undefined) {
        bg = liquids[crd].darkbg;
      }
      if (features[crd]) {
        // feature in shadow
        return [features[crd].symbol || "X",fg, bg || tile.bg];
      } else if (zview===+1 && features[cabove]) {
        // feature on level above
        return [features[cabove].symbol || "X",fg, bg || HTomb.Constants.WALLBG];
      } else if (zview===-1 && features[cbelow]) {
        // feature on level below
        return [features[cbelow].symbol || "X",fg, bg || HTomb.Constants.BELOWBG];
      } else if (liquids[crd] && liquids[cabove]===undefined) {
        return [liquids[crd].symbol,liquids[crd].fg,bg];
      } else if (zview===-1 && liquids[cbelow]) {
        return [HTomb.Constants.FLOORBELOW,liquids[cbelow].fg,liquids[cbelow].darkbg];
        // an empty space with floor below it
      } else if (tile===Tiles.WallTile && tiles[z+1][x][y]===Tiles.FloorTile && explored[z+1][x][y]) {
        return[HTomb.Constants.FLOORABOVE,fg,bg || HTomb.Constants.WALLBG];
      } else if (tile===Tiles.EmptyTile && tiles[z-1][x][y]===Tiles.FloorTile) {
        //return [HTomb.Constants.FLOORBELOW,fg,bg];
        return [HTomb.Constants.FLOORBELOW,fg, bg || HTomb.Constants.BELOWBG];
      } else if (tile===Tiles.FloorTile && tiles[z+1][x][y]!==Tiles.EmptyTile) {
        return [Tiles.WallTile.symbol,fg,bg || tile.bg];
      } else {
        // terrain on current level
        return [tile.symbol || "X",fg,bg || tile.bg];
      }
    } else {
      // visible square
      var above = ABOVE;
      var below = BELOW;
      if (creatures[crd]) {
        return [creatures[crd].symbol || "X", creatures[crd].fg || fg, bg || tile.bg];
      } else if (zview===+1 && creatures[cabove]) {
        return [creatures[cabove].symbol || "X",above, bg || HTomb.Constants.WALLBG];
      } else if (zview===-1 && creatures[cbelow]) {
        return [creatures[cbelow].symbol || "X",below, bg || HTomb.Constants.BELOWBG];
      } else if (items[crd]) {
        return [items[crd][items[crd].length-1].symbol || "X",items[crd][items[crd].length-1].fg || fg, bg || tile.bg];
      } else if (features[crd]) {
        return [features[crd].symbol || "X", features[crd].fg || fg, bg || features[crd].bg || tile.bg];
      } else if (zview===+1 && items[cabove]) {
        return [items[cabove][items[cabove].length-1].symbol || "X",above, bg || HTomb.Constants.WALLBG];
      } else if (zview===-1 && items[cbelow]) {
        return [items[cbelow][items[cbelow].length-1].symbol || "X",below, bg || HTomb.Constants.BELOWBG];
      } else if (zview===+1 && features[cabove]) {
        return [features[cabove].symbol || "X",above, bg || HTomb.Constants.WALLBG];
      } else if (zview===-1 && features[cbelow]) {
        return [features[cbelow].symbol || "X",below, bg || HTomb.Constants.BELOWBG];
      } else if (liquids[crd] && liquids[cabove]===undefined) {
        return [liquids[crd].symbol,liquids[crd].fg,bg];
      } else if (zview===-1 && liquids[cbelow]) {
        return [HTomb.Constants.FLOORBELOW,liquids[cbelow].fg,liquids[cbelow].shimmer()];
      } else if (tile===Tiles.EmptyTile && tiles[z-1][x][y]===Tiles.FloorTile) {
        return [HTomb.Constants.FLOORBELOW,below, bg || HTomb.Constants.BELOWBG];
      } else if (tile===Tiles.FloorTile && tiles[z+1][x][y]!==Tiles.EmptyTile) {
        return [HTomb.Constants.ROOFABOVE,tile.fg, bg || tile.bg];
      } else {
        fg = tile.fg || fg;
        return [tile.symbol || "X",fg, bg || tile.bg];
      }
    }
    return ["X","black","red"];
  };

  HTomb.Tiles.getSquare = function(x,y,z) {
    var square = {};
    var crd = HTomb.coord(x,y,z);
    square.terrain = HTomb.World.tiles[z][x][y];
    square.creature = HTomb.World.creatures[crd];
    square.items = HTomb.World.items[crd];
    square.feature = HTomb.World.features[crd];
    square.portals = HTomb.World.portals[crd];
    square.zone = HTomb.World.zones[crd];
    square.liquid = HTomb.World.liquids[crd];
    square.explored = HTomb.World.explored[z][x][y];
    square.visible = HTomb.World.visible[z][x][y];
    // until we get the real code in place...
    square.visibleBelow = (square.visible && square.terrain.zview===-1);
    square.visibleAbove = (square.visible && (square.terrain.zview===+1 || HTomb.World.tiles[z+1][x][y].zview===-1));
    square.exploredBelow = (square.explored && square.terrain.zview===-1);
    square.exploredAbove = (square.explored && (square.terrain.zview===+1 || HTomb.World.tiles[z+1][x][y].zview===-1));
    square.x = x;
    square.y = y;
    square.z = z;
    return square;
  };

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
  Tiles.fill = function(x,y,z) {
    // check for more stuff in a while
    if (HTomb.World.features[coord(x,y,z)]) {
      HTomb.World.features[coord(x,y,z)].remove();
    }
    HTomb.World.tiles[z][x][y] = HTomb.Tiles.WallTile;
    if (HTomb.World.tiles[z+1][x][y]===HTomb.Tiles.EmptyTile) {
      HTomb.World.tiles[z+1][x][y] = HTomb.Tiles.FloorTile;
    }
    HTomb.World.validate();
  };
  // I actually hate the way this works
  Tiles.excavate = function(x,y,z,options) {
    options = options || {};
    if (HTomb.World.tiles[z][x][y]===HTomb.Tiles.VoidTile) {
      HTomb.GUI.pushMessage("Can't dig here!");
      return;
    }
    // If the ceiling is removed and there no solid tile above...
    if (options.removeCeiling===true && HTomb.World.tiles[z+1][x][y].solid!==true) {
      HTomb.World.tiles[z+1][x][y] = HTomb.Tiles.EmptyTile;
    }
    // Check whether there is a solid tile below...
    if (HTomb.World.tiles[z-1][x][y].solid!==true) {
      HTomb.World.tiles[z][x][y] = HTomb.Tiles.EmptyTile;
    } else {
      HTomb.World.tiles[z][x][y] = HTomb.Tiles.FloorTile;
    }
    HTomb.World.validate();
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
      if (HTomb.World.tiles[z][x][y].solid===true) {
        return z+1;
      }
    }
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
    HTomb.World.explored[z][x][y] = true;
  };

  // any tile that can be touched by a worker from a square
  HTomb.Tiles.touchableFrom = function(x,y,z) {
    var touchable = [];
    //sideways
    var t, x1, y1;
    for (var i=0; i<ROT.DIRS[8].length; i++) {
      x1 = x+ROT.DIRS[8][i][0];
      y1 = y+ROT.DIRS[8][i][1];
      touchable.push([x1,y1,z]);
      t = HTomb.World.tiles[z][x1][y1];
      if (t.zmove===-1 || t.fallable) {
        touchable.push([x1,y1,z-1]);
      }
    }
    t = HTomb.World.tiles[z][x][y];
    if (t.zmove===+1) {
      touchable.push([x,y,z+1]);
    }
    return touchable;
  }

  return HTomb;
})(HTomb);
