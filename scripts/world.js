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
    HTomb.World.generators.currentRandom();
    //HTomb.World.generators.newSimplex();
  }

  HTomb.World.generators = {};
  HTomb.World.generators.currentRandom = function() {
    assignElevation();
    addSlopes();
    populateStuff();
  };
  HTomb.World.generators.newSimplex = function() {
    assignElevation();
    raise_hill(1);
    simplex_features("Tombstone",{p1: 0.25, p2: 0.1});
    simplex_features("Shrub",{hscale: 40, vthresh: 1, p1: 0.25, p2: 0.1});
    simplex_features("Tree",{vthresh: 1, p1: 0.75, p2: 0.25});
    simplex_features("Rock",{hscale: 10, vtresh: 3, p1: 0.25, p2: 0.1});
    water_table(24);
    addSlopes();
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
            levels[z].grid[x][y] = HTomb.Tiles.WALLTILE;
          }
          z = grid[x][y]+1;
          levels[z].grid[x][y] = HTomb.Tiles.FLOORTILE;
        }
      }
    }
    console.log("Highest at " + mx + ", lowest at " + mn);
  }
  function simplex_features(template,options) {
    options = options || {};
    var hscale = options.hscale || 20;
    var vscale = options.vscale || 4;
    var vthresh = options.vthresh || 2;
    var p1 = options.p1 || 0.5;
    var p2 = options.p2 || 0.25;
    var noise = new ROT.Noise.Simplex();
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        var z = HTomb.Tiles.groundLevel(x,y)+1;
        var val = parseInt(noise.get(x/hscale,y/hscale)*vscale);
        var r = Math.random();
        if ((val>vthresh && r<p1) || (val===vthresh && r<p2)) {
          HTomb.Entity.create(template).place(x,y,z);
        }
      }
    }
  }
  function raise_hill(height) {
    height = height || 4;
    var midpoint = LEVELW/2;
    var step = Math.ceil(midpoint/height);
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        var z = HTomb.Tiles.groundLevel(x,y)+1;
        var dist = Math.floor(Math.sqrt((x-midpoint)*(x-midpoint)+(y-midpoint)*(y-midpoint)));
        var rise = Math.max(0,height-Math.floor(dist/step));
        for (var i=0; i<rise; i++) {
          HTomb.Tiles.fillSquare(x,y,z+i);
        }
      }
    }
  }
  function water_table(elev) {
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        var z = HTomb.Tiles.groundLevel(x,y)+1;
        if (z<=elev) {
            HTomb.Entity.create("Puddle").place(x,y,z);
        }
      }
    }
  }
  function populateStuff() {
    var z;
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        z = HTomb.Tiles.groundLevel(x,y)+1;
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
            squares = HTomb.Tiles.neighbors(x,y);
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
