HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var levels = [];

  var terrain = [];
  function defineTerrain(n, cons, definition) {
    HTomb.Constants[cons] = n;
    terrain[n] = definition;
  }

  defineTerrain(-1,"VOIDTILE",{name: "boundary", symbol: " ", opaque: true, solid: true});
  defineTerrain(0,"EMPTYTILE",{name: "empty", symbol: "_", fallable: true});
  defineTerrain(1,"FLOORTILE",{name: "floor", symbol: "."});
  defineTerrain(2,"WALLTILE",{name: "wall", symbol: "#", opaque: true, solid: true});

  function addLevel(z) {
    var level = {};
    if (z===undefined) {
      z = levels.length;
    }
    levels[z] = level;
    level.grid = [];
    level.explored = [];
    for (var x=0; x<LEVELW; x++) {
      level.grid.push([]);
      level.explored.push([]);
      for (var y=0; y<LEVELH; y++) {
        if (x===0 || x===LEVELW-1 || y===0 || y===LEVELH-1 || z===0 || z===NLEVELS-1) {
          level.grid[x][y] = HTomb.Constants.VOIDTILE;
        } else {
          level.grid[x][y] = HTomb.Constants.EMPTYTILE;
        }
        level.explored[x][y] = false;
      }
    }
  }

  HTomb.World.levels = levels;
  HTomb.World.terrain = terrain;
  HTomb.World.init = function() {

    for (var z=0; z<NLEVELS; z++) {
      addLevel();
    }
    assignElevation();
    populateStuff();
    addSlopes();
    //createFastGrid();
  };
  function assignElevation() {
    var ground = 25;
    var hscale = 100;
    var vscale = 4;
    var noise = new ROT.Noise.Simplex();
    var grid = [];
    var mx = 0, mn = NLEVELS;
    for (var x=0; x<LEVELW; x++) {
      grid.push([]);
      for (var y=0; y<LEVELH; y++) {
        grid[x][y] = parseInt(noise.get(x/hscale,y/hscale)*vscale+ground);
        mx = Math.max(mx,grid[x][y]);
        mn = Math.min(mn,grid[x][y]);
        if (x>0 && x<LEVELW-1 && y>0 && y<LEVELH-1) {
          for (var z=grid[x][y]; z>=0; z--) {
            levels[z].grid[x][y] = HTomb.Constants.WALLTILE;
          }
          z = grid[x][y]+1;
          levels[z].grid[x][y] = HTomb.Constants.FLOORTILE;
        }
      }
    }
    console.log("Highest at " + mx + ", lowest at " + mn);
  }
  function populateStuff() {
    var z;
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        z = HTomb.World.groundLevel(x,y)+1;
        if (Math.random() <= 0.025) {
          HTomb.Entity.create("Rock").place(x,y,z);
        }
        if (Math.random() <= 0.005) {
          HTomb.Entity.create("Zombie").place(x,y,z);
        }
      }
    }
  }
  function addSlopes() {
    var squares;
    var square;
    var slope;
    for (var x=0; x<LEVELW; x++) {
      for (var y=0; y<LEVELH; y++) {
        for (var z=0; z<NLEVELS-1; z++) {
          if (levels[z].grid[x][y]===HTomb.Constants.FLOORTILE && levels[z+1].grid[x][y]===HTomb.Constants.EMPTYTILE) {
            squares = HTomb.World.neighbors(x,y);
            slope = false;
            for (var i=0; i<squares.length; i++) {
              square = squares[i];
              if (levels[z].grid[square[0]][square[1]]===HTomb.Constants.WALLTILE && levels[z+1].grid[square[0]][square[1]]===HTomb.Constants.FLOORTILE) {
                slope = true;
              }
            }
            if (slope===true) {
              HTomb.Entity.create("UpSlope").place(x,y,z);
              //HTomb.Entity.create("DownSlope").place(x,y,z+1);
              // is making this a floor the best way to handle this?
              //levels[z+1].grid[x][y] = FLOORTILE;
            }
          }
        }
      }
    }
  }
  function createFastGrid() {
    var levels = HTomb.World.levels;
    HTomb.World._fastgrid = [];
    for (var k=0; k<NLEVELS; k++) {
      for (var i=0; i<LEVELW; i++) {
        //portals.push([]);
        for (var j=0; j<LEVELH; j++) {
          HTomb.World._fastgrid.push(levels[k].grid[i][j]);
        }
      }
    }
  }
  HTomb.World.neighbors = function(x,y) {
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
  HTomb.World.groundLevel = function(x,y) {
    for (var z=NLEVELS-2; z>0; z--) {
      if (terrain[levels[z].grid[x][y]].solid===true) {
        return z;
      }
    }
  };
  HTomb.World.creatures = {};
  HTomb.World.items = {};
  HTomb.World.features = {};
  HTomb.World.portals = {};
  HTomb.World.getSquare = function(x,y,z) {
    var square = {};
    var coord = x*LEVELW*LEVELH + y*LEVELH + z;
    var grid = HTomb.World.levels[z].grid;
    square.terrain = terrain[grid[x][y]];
    square.creature = HTomb.World.creatures[coord];
    square.items = HTomb.World.items[coord];
    square.feature = HTomb.World.features[coord];
    square.portals = HTomb.World.portals[coord];
    square.x = x;
    square.y = y;
    square.z = z;
    return square;
  };
  HTomb.World.symbolAt = function(x,y,z) {
    var coord = x*LEVELW*LEVELH + y*LEVELH + z;
    var fg = "white";
    var bg = "black";
    // not finished yet...I don't even really know what this is for
  };
  HTomb.World.randomEmptyNeighbor = function(x,y,z) {
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
      square = HTomb.World.getSquare(x+d[j][0],y+d[j][1],z);
      if (square.terrain.solid===undefined && square.creature===undefined) {
        return [x+d[j][0],y+d[j][1],z];
      }
    }
    return false;
  };
  // should this be part of a factory or something eventually?
  return HTomb;
})(HTomb);
