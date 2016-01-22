HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var levels = [];
  var VOIDTILE = -1;
  var EMPTYTILE = 0;
  var FLOORTILE = 1;
  var WALLTILE = 2;
  var terrain = [];
  terrain[VOIDTILE] = {name: "boundary", symbol: " ", opaque: true, solid: true};
  terrain[EMPTYTILE] = {name: "empty", symbol: "_", fallable: true};
  terrain[FLOORTILE] = {name: "floor", symbol: "."};
  terrain[WALLTILE]  = {name: "wall", symbol: "#", opaque: true, solid: true};

  function addLevel(z) {
    console.log("Test");
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
          level.grid[x][y] = VOIDTILE;
        } else {
          level.grid[x][y] = EMPTYTILE;
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
    var noise = new ROT.Noise.Simplex();
    var grid = [];
    var ground = 25;
    var hscale = 100;
    var vscale = 4;
    var mx = 0;
    var mn = NLEVELS;
    for (var x=0; x<LEVELW; x++) {
      grid.push([]);
      for (var y=0; y<LEVELH; y++) {
        grid[x][y] = parseInt(noise.get(x/hscale,y/hscale)*vscale+ground);
        mx = Math.max(mx,grid[x][y]);
        mn = Math.min(mn,grid[x][y]);
        if (x>0 && x<LEVELW-1 && y>0 && y<LEVELH-1) {
          for (var zz=grid[x][y]; zz>=0; zz--) {
            levels[zz].grid[x][y] = WALLTILE;
          }
          zz = grid[x][y]+1;
          levels[zz].grid[x][y] = FLOORTILE;
          if (Math.random() <= 0.025) {
            HTomb.Entity.create("Rock").place(x,y,zz);
          }
          if (Math.random() <= 0.005) {
            HTomb.Entity.create("Zombie").place(x,y,zz);
          }
        }
      }
    }
    console.log("Highest at " + mx + ", lowest at " + mn);
    var squares;
    var square;
    var slope;
    for (x=0; x<LEVELW; x++) {
      for (y=0; y<LEVELH; y++) {
        for (z=0; z<NLEVELS-1; z++) {
          if (levels[z].grid[x][y]===FLOORTILE && levels[z+1].grid[x][y]===EMPTYTILE) {
            squares = HTomb.World.neighbors(x,y);
            slope = false;
            for (var i=0; i<squares.length; i++) {
              square = squares[i];
              if (levels[z].grid[square[0]][square[1]]===WALLTILE && levels[z+1].grid[square[0]][square[1]]===FLOORTILE) {
                slope = true;
              }
            }
            if (slope===true) {
              HTomb.Entity.create("UpSlope").place(x,y,z);
              HTomb.Entity.create("DownSlope").place(x,y,z+1);
            }
          }
        }
      }
    }
    createFastGrid();
  };
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
    var xs = [0];
    var ys = [0];
    if (x>0) {
      xs.push(x-1);
    }
    if (x<LEVELW-1) {
      xs.push(x+1);
    }
    if (y>0) {
      ys.push(y-1);
    }
    if (y<LEVELH-1) {
      ys.push(y+1);
    }
    for (var i=0; i<xs.length; i++) {
      for (var j=0; j<ys.length; j++) {
        if (xs[i]!==0 || ys[j]!==0) {
          squares.push([xs[i],ys[j]]);
        }
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
  HTomb.World.getSquare = function(x,y,z) {
    var square = {};
    var coord = x*LEVELW*LEVELH + y*LEVELH + z;
    var grid = HTomb.World.levels[z].grid;
    square.terrain = terrain[grid[x][y]];
    square.creature = HTomb.World.creatures[coord];
    square.items = HTomb.World.items[coord];
    square.feature = HTomb.World.features[coord];
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
    var dirs = ROT.DIRS[8];
    var d = [];
    for (var i=0; i<dirs.length; i++) {
      d.push([dirs[i][0],dirs[i][1]]);
    }
    d = d.randomize();
    var square;
    for (var j=0; j<d.length; j++) {
      square = HTomb.World.getSquare(x+d[j][0],y+d[j][1],z);
      if (square.terrain.solid===undefined && square.creature===undefined) {
        return [x+d[j][0],y+d[j][1],z];
      }
    }
    return false;
  }

  return HTomb;
})(HTomb);
