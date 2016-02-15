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
  // Define a generic tile
  HTomb.Things.define({
    template: "Terrain",
    name: "terrain",
    parent: "Thing",
    symbol: "X",
    fg: "white",
    bg: "black",
    onDefine: function() {
      HTomb.Tiles[this.template] = this;
      this.static = true;
    }
  });

  // Define specific types of tiles
  HTomb.Things.defineTerrain({
    template: "VoidTile",
    name: "boundary",
    symbol: " ",
    opaque: true,
    solid: true
  });
  HTomb.Things.defineTerrain({
    template: "EmptyTile",
    name: "empty",
    symbol: "\u25CB",
    zview: -1,
    fg: BELOW,
    fallable: true
  });
  HTomb.Things.defineTerrain({
    template: "FloorTile",
    name: "floor",
    symbol: "."
  });
  HTomb.Things.defineTerrain({
    template: "WallTile",
    name: "wall",
    symbol: "#",
    fg: ABOVE,
    opaque: true,
    solid: true
  });
  HTomb.Things.defineTerrain({
    template: "UpSlopeTile",
    name: "upward slope",
    symbol: "\u02C4",
    fg: ABOVE,
    zview: +1,
    zmove: +1
  });
  HTomb.Things.defineTerrain({
    template: "DownSlopeTile",
    name: "downward slope",
    symbol: "\u02C5",
    zview: +1,
    zmove: +1,
    allowsFeatures: false
  });


  Tiles.getSymbol = function(x,y,z) {
    //var vis = HTomb.FOV.visible;
    var coord = HTomb.coord(x,y,z);
    var creatures = HTomb.World.creatures;
    var items = HTomb.World.items;
    var features = HTomb.World.features;
    var zones = HTomb.World.zones;
    var tiles = HTomb.World.tiles;
    var explored = HTomb.World.explored;
    var tile = tiles[z][x][y];
    return [tile.symbol, tile.fg, tile.bg];
  };


  Tiles.terrain = terrain;
  return HTomb;
})(HTomb);
