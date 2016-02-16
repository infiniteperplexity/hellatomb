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
    var tiles = HTomb.World.tiles;
    var creatures = HTomb.World.creatures;
    var items = HTomb.World.items;
    var features = HTomb.World.features;
    var zones = HTomb.World.zones;
    var visible = HTomb.World.visible;
    var explored = HTomb.World.explored;
    if (tiles[z]===undefined) {
      console.log([x,y,z]);
    }
    var tile = tiles[z][x][y];
    var zview = tiles[z][x][y].zview;
    //if the square has not been explored, don't show it
    if (!explored[z][x][y] && HTomb.Debug.explored!==true) {
      return [" ","black","black"];
    }
    // background color for explored squares is based on zoning
      // maybe at some point, liquids
    var fg = "white";
    var bg = (zones[coord]===undefined) ? "black" : zones[coord].bg;
    // square explored but not visible
    if (visible[z][x][y]===false && HTomb.Debug.visible!==true) {
      //fg = HTomb.Constants.SHADOW;
      fg = HTomb.Constants.SHADOW;
      if (features[coord]) {
        // feature in shadow
        return [features[coord].symbol || "X",fg,bg];
      } else if (zview===+1 && features[cabove]) {
        // feature on level above
        return [features[cabove].symbol || "X",fg,bg];
      } else if (zview===-1 && features[cbelow]) {
        // feature on level below
        return [features[cbelow].symbol || "X",fg,bg];
        // an empty space with floor below it
      } else if (tile===Tiles.EmptyTile && tiles[z-1][x][y]===Tiles.FloorTile) {
        return [HTomb.Constants.FLOORBELOW,fg,bg];
      } else if (tiles===Tiles.EmptyTile && tiles[z-1][x][y]===Tiles.FloorTile) {
        return [HTomb.Constants.FLOORBELOW,fg,bg];
      } else {
        // terrain on current level
        return [tile.symbol || "X",fg,bg];
      }
    } else {
      // visible square
      var above = ABOVE;
      var below = BELOW;
      if (creatures[coord]) {
        return [creatures[coord].symbol || "X", creatures[coord].fg || fg,bg];
      } else if (zview===+1 && creatures[cabove]) {
        return [creatures[cabove].symbol || "X",above,bg];
      } else if (zview===-1 && creatures[cbelow]) {
        return [creatures[cbelow].symbol || "X",below,bg];
      } else if (items[coord]) {
        return [items[coord][items[coord].length-1].symbol || "X",items[coord][items[coord].length-1].fg || fg,bg];
      } else if (features[coord]) {
        return [features[coord].symbol || "X", features[coord].fg || fg,bg];
      } else if (zview===+1 && items[cabove]) {
        return [items[cabove][items[cabove].length-1].symbol || "X",above,bg];
      } else if (zview===-1 && items[cbelow]) {
        return [items[cbelow][items[cbelow].length-1].symbol || "X",below,bg];
      } else if (zview===+1 && features[cabove]) {
        return [features[cabove].symbol || "X",above,bg];
      } else if (zview===-1 && features[cbelow]) {
        return [features[cbelow].symbol || "X",below,bg];
      } else if (tile===Tiles.EmptyTile && tiles[z-1][x][y]===Tiles.FloorTile) {
        return [HTomb.Constants.FLOORBELOW,below,bg];
      //} else if (tile===Tiles.FloorTile) {
        //fg = ROT.Color.fromString(tiles[z][x][y].fg] || HTomb.Constants.EARTHTONE);
        //fg = ROT.Color.add(fg,HTomb.World.colors[x][y]);
        //fg = ROT.Color.toHex(fg);
        //return [tile.symbol || "X",fg,bg];
      } else {
        fg = tile.fg || fg;
        return [tile.symbol || "X",fg,bg];
      }
    }
    return ["X","red","black"];
  };
  return HTomb;
})(HTomb);
