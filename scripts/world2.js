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
  HTomb.World.tiles = grid3d(null);
  HTomb.World.explored = grid3d(false);
  HTomb.World.visible = grid3d(false);
  HTomb.World.creatures = {};
  HTomb.World.items = {};
  HTomb.World.features = {};
  HTomb.World.zones = {};
  HTomb.World.portals = {};

  HTomb.World.init = function() {
    HTomb.World.fillTiles();
    HTomb.World.validate();
  };

  // Add void tiles to the boundaries of the level
  HTomb.World.fillTiles = function() {
    for (var x=0; x<LEVELW; x++) {
      for (var y=0; y<LEVELH; y++) {
        for (var z=0; z<NLEVELS; z++) {
          if (x===0 || x===LEVELW-1 || y===0 || y===LEVELH-1 || z===0 || z===NLEVELS-1) {
            HTomb.World.tiles[z][x][y] = HTomb.Tiles.VoidTile;
          } else {
            HTomb.World.tiles[z][x][y] = HTomb.Tiles.EmptyTile;
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

  //************Concrete methods for populating a world****************
  function populate() {
    //HTomb.World.generators.currentRandom();
    HTomb.World.generators.newSimplex();
  }

  HTomb.World.generators = {};
  HTomb.World.generators.currentRandom = function() {
    colorize();
    assignElevation();
    addSlopes();
    populateStuff();
  };
  HTomb.World.generators.newSimplex = function() {
    colorize(20);
    assignElevation();
    //raise_hill(1);
    simplex_features("Tombstone",{p1: 0.25, p2: 0.1, filter: function(x,y,z) {
      return (HTomb.Tiles.getNeighbors(x,y,z).fallables.length===0);
    }});
    simplex_features("Shrub",{hscale: 40, vthresh: 1, p1: 0.25, p2: 0.1});
    simplex_features("Tree",{vthresh: 1, p1: 0.75, p2: 0.25});
    simplex_features("Rock",{hscale: 10, vtresh: 3, p1: 0.25, p2: 0.1});
    simplex_features("Stick",{hscale: 10, vtresh: 3, p1: 0.15, p2: 0.05});
    water_table(23);
    scatter("Zombie",0.005);
    addSlopes();
  };
  function scatter(template,p) {
    for (var x=0; x<LEVELW; x++) {
      for (var y=0; y<LEVELH; y++) {
        var z = HTomb.Tiles.groundLevel(x,y)+1;
        var e = HTomb.Entity.create(template);
        if (e.isCreature && HTomb.World.creatures[x*LEVELW*LEVELH+y*LEVELH+z]===HTomb.Player) {
          continue;
        } else if (Math.random()<p) {
          e.place(x,y,z);
        }
      }
    }
  }
  function colorize(cscale,hscale) {
    hscale = hscale || 50;
    cscale = cscale || 0;
    var rnoise = new ROT.Noise.Simplex();
    var gnoise = new ROT.Noise.Simplex();
    var bnoise = new ROT.Noise.Simplex();
    for (var x=0; x<LEVELW; x++) {
      HTomb.World.colors.push([]);
      for (var y=0; y<LEVELH; y++) {
        var r = parseInt(Math.random()*2*cscale)-cscale;
        var g = parseInt(Math.random()*2*cscale)-cscale;
        var b = parseInt(Math.random()*2*cscale)-cscale;
        //var r = parseInt(rnoise.get(x/hscale,y/hscale)*cscale);
        //var g = parseInt(gnoise.get(x/hscale,y/hscale)*cscale);
        //var b = parseInt(bnoise.get(x/hscale,y/hscale)*cscale);
        HTomb.World.colors[x].push([r,g,b]);
      }
    }
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
          if (options.filter===undefined || options.filter(x,y,z)===true) {
            HTomb.Entity.create(template).place(x,y,z);
          }
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
        for (var z=HTomb.Tiles.groundLevel(x,y)+1; z<=elev; z++) {
          var square = HTomb.Tiles.getSquare(x,y,z);
          HTomb.Entity.create("Puddle").place(x,y,z);
          if (square.items) {
            for (var i=0; i<square.items.length; i++) {
              square.items[i].remove();
            }
          }
          if (z===elev) {
            HTomb.Entity.create("Puddle").place(x,y,z+1);
          }
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
              //HTomb.Entity.create("UpSlope").place(x,y,z);
              levels[z].grid[x][y] = HTomb.Tiles.UPSLOPE;
              levels[z+1].grid[x][y] = HTomb.Tiles.DOWNSLOPE;
            }
          }
        }
      }
    }
  }

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
