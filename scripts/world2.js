HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;

  //*************Create a generic world****************
  var levels = [];
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
          level.grid[x][y] = HTomb.Tiles.VOIDTILE;
        } else {
          level.grid[x][y] = HTomb.Tiles.EMPTYTILE;
        }
        level.explored[x][y] = false;
      }
    }
  }
  HTomb.World.levels = levels;
  HTomb.World.init = function() {
    for (var z=0; z<NLEVELS; z++) {
      addLevel();
    }
    populate();
    //createFastGrid();
  };



  //************Concrete methods for populating a world****************
  function populate() {
    assignElevation();
    addSlopes();
    populateStuff();
  }
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
            levels[z].grid[x][y] = HTomb.Tiles.WALLTILE;
          }
          z = grid[x][y]+1;
          levels[z].grid[x][y] = HTomb.Tiles.FLOORTILE;
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
        if (Math.random() <= 0.025) {
          HTomb.Entity.create("Stick").place(x,y,z);
        }
        if (Math.random() <= 0.025) {
          if (HTomb.World.features[x*LEVELW*LEVELH+y*LEVELH+z]===undefined) {
            HTomb.Entity.create("Tombstone").place(x,y,z);
          }
        }
        if (Math.random() <= 0.025) {
          if (HTomb.World.features[x*LEVELW*LEVELH+y*LEVELH+z]===undefined) {
            HTomb.Entity.create("Tree").place(x,y,z);
          }
        }
        if (Math.random() <= 0.025) {
          if (HTomb.World.features[x*LEVELW*LEVELH+y*LEVELH+z]===undefined) {
            HTomb.Entity.create("Shrub").place(x,y,z);
          }
        }
        if (Math.random() <= 0.01) {
          if (HTomb.World.features[x*LEVELW*LEVELH+y*LEVELH+z]===undefined) {
            HTomb.Entity.create("Puddle").place(x,y,z);
          }
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
          if (levels[z].grid[x][y]===HTomb.Tiles.FLOORTILE && levels[z+1].grid[x][y]===HTomb.Tiles.EMPTYTILE) {
            squares = HTomb.World.neighbors(x,y);
            slope = false;
            for (var i=0; i<squares.length; i++) {
              square = squares[i];
              if (levels[z].grid[square[0]][square[1]]===HTomb.Tiles.WALLTILE && levels[z+1].grid[square[0]][square[1]]===HTomb.Tiles.FLOORTILE) {
                slope = true;
              }
            }
            if (slope===true) {
              HTomb.Entity.create("UpSlope").place(x,y,z);
            }
          }
        }
      }
    }
  }
  function createFastGrid() {
    var levels = HTomb.World.levels;
    HTomb.World._fastgrid = [];
    for (var z=0; z<NLEVELS; z++) {
      for (var x=0; x<LEVELW; x++) {
        //portals.push([]);
        for (var y=0; y<LEVELH; y++) {
          HTomb.World._fastgrid.push(levels[z].grid[x][y]);
        }
      }
    }
  }

  HTomb.World.creatures = {};
  HTomb.World.items = {};
  HTomb.World.features = {};
  HTomb.World.portals = {};
  HTomb.World.zones = {};

  return HTomb;
})(HTomb);
