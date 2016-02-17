HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;

  function grid3d(fill) {
    fill = fill || null;
    var grid = [];
    for (var k=0; k<NLEVELS; k++) {
      grid.push([]);
      for (var i=0; i<LEVELW; i++) {
        grid[k].push([]);
        for (var j=0; j<LEVELH; j++) {
          grid[k][i].push(fill);
        }
      }
    }
    return grid;
  }

  HTomb.World.things = [];
  HTomb.World.init = function() {
    //HTomb.World.things = [];
    HTomb.World.tiles = grid3d(HTomb.Tiles.EmptyTile);
    HTomb.World.explored = grid3d(false);
    HTomb.World.visible = grid3d(false);
    HTomb.World.creatures = {};
    HTomb.World.items = {};
    HTomb.World.features = {};
    HTomb.World.zones = {};
    HTomb.World.portals = {};

    HTomb.World.addBoundaries();
    HTomb.World.validate();
  };

  // Add void tiles to the boundaries of the level
  HTomb.World.addBoundaries = function() {
    for (var x=0; x<LEVELW; x++) {
      for (var y=0; y<LEVELH; y++) {
        for (var z=0; z<NLEVELS; z++) {
          if (x===0 || x===LEVELW-1 || y===0 || y===LEVELH-1 || z===0 || z===NLEVELS-1) {
            HTomb.World.tiles[z][x][y] = HTomb.Tiles.VoidTile;
          }
        }
      }
    }
  };

  // Run this to make sure the basic rules of adjacent terrain are followed
  HTomb.World.validate = function() {
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        for (var z=1; z<NLEVELS-1; z++) {
          var t = HTomb.World.tiles[z][x][y];
          var below = HTomb.World.tiles[z-1][x][y];
          var above = HTomb.World.tiles[z+1][x][y];
          if (t===HTomb.Tiles.EmptyTile && below!==undefined && below.solid===true) {
            HTomb.World.tiles[z][x][y] = HTomb.Tiles.FloorTile;
          }
        }
      }
    }
  };

  HTomb.World.getSquare = function(x,y,z) {
    var square = {};
    var coord = HTomb.coord(x,y,z);
    square.terrain = HTomb.World.tiles[z][x][y];
    square.creature = HTomb.World.creatures[coord];
    square.items = HTomb.World.items[coord];
    square.feature = HTomb.World.features[coord];
    square.portals = HTomb.World.portals[coord];
    square.zone = HTomb.World.zones[coord];
    square.explored = HTomb.World.explored[z][x][y];
    square.visible = HTomb.World.visible[z][x][y];
    square.x = x;
    square.y = y;
    square.z = z;
    return square;
  };

  HTomb.World.dailyCycle = {hour: 8, minute: 0,
    onTurnBegin: function() {
      this.minute+=1;
      if (this.minute>=60) {
        this.minute = 0;
        this.hour = (this.hour+1)%24;
      }},
    shade: function(color) {
      color = ROT.Color.fromString(color);
      //color = ROT.Color.add(color,[0,50,50]); //midday?
      //color = ROT.Color.add(color,[50,50,0]); //dawn?
      //color = ROT.Color.add(color,[50,0,0]); //dusk?
      //color = ROT.Color.add(color,[-50,-50,0]); //night?
      //at this point we need to add daylight stuff
      return ROT.Color.toHex(color);
  }};

  return HTomb;
})(HTomb);
