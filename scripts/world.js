HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var coord = HTomb.coord;

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
  HTomb.World.turfs = {};

  HTomb.World.init = function() {
    HTomb.World.fillTiles();
    HTomb.World.generators.newSimplex();
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
    console.log("validating");
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        for (var z=1; z<NLEVELS-1; z++) {
          var t = HTomb.World.tiles[z][x][y];
          var below = HTomb.World.tiles[z-1][x][y];
          var above = HTomb.World.tiles[z+1][x][y];
          // validate slopes
          if (t===HTomb.Tiles.UpSlopeTile) {
            if (above.fallable===true) {
              HTomb.World.tiles[z+1][x][y] = HTomb.Tiles.DownSlopeTile;
            }
          }
          t = HTomb.World.tiles[z][x][y];
          if (t===HTomb.Tiles.DownSlopeTile) {
            if (below!==HTomb.Tiles.UpSlopeTile) {
              if (below.solid) {
                HTomb.World.tiles[z][x][y] = HTomb.Tiles.FloorTile;
              } else {
                HTomb.World.tiles[z][x][y] = HTomb.Tiles.EmptyTile;
              }
            }
          }
          // validate floors
          if (t===HTomb.Tiles.EmptyTile && below!==undefined && below.solid===true) {
            HTomb.World.tiles[z][x][y] = HTomb.Tiles.FloorTile;
          }
          t = HTomb.World.tiles[z][x][y];
          // validate portals
          if (t.zmove===+1) {
            HTomb.World.portals[coord(x,y,z)] = [x,y,z+1];
          } else if (t.zmove===-1) {
            HTomb.World.portals[coord(x,y,z)] = [x,y,z-1];
          } else if (HTomb.World.portals[coord(x,y,z)]!==undefined) {
            delete HTomb.World.portals[coord(x,y,z)];
          }
          //check if anything needs to fall
          t = HTomb.World.tiles[z][x][y];
          if (t.fallable===true) {
            var items = HTomb.World.items[coord(x,y,z)] || [];
            while (items && items.length>0) {
              items[0].fall();
            }
            var creature = HTomb.World.creatures[coord(x,y,z)];
            if (creature && creature.movement.flies!==true) {
              creature.fall();
            }
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
    //colorize(20);
    assignElevation();
    //raise_hill(1);
    simplex_features("Tombstone",{p1: 0.25, p2: 0.1, filter: function(x,y,z) {
      return (HTomb.Tiles.getNeighbors(x,y,z).fallables.length===0);
    }});
    simplex_features("Shrub",{hscale: 40, vthresh: 1, p1: 0.25, p2: 0.1});
    simplex_features("WolfsbanePlant",{hscale: 40, vthresh: 1.5, p1: 0.15, p2: 0.05, callback: function(thing) {thing.crop.mature();}});
    simplex_features("WormwoodPlant",{hscale: 40, vthresh: 1.5, p1: 0.15, p2: 0.05, callback: function(thing) {thing.crop.mature();}});
    simplex_features("MandrakePlant",{hscale: 40, vthresh: 1.5, p1: 0.15, p2: 0.05, callback: function(thing) {thing.crop.mature();}});
    simplex_features("BloodwortPlant",{hscale: 40, vthresh: 1.5, p1: 0.15, p2: 0.05, callback: function(thing) {thing.crop.mature();}});
    simplex_features("AmanitaPlant",{hscale: 40, vthresh: 1.5, p1: 0.15, p2: 0.05, callback: function(thing) {thing.crop.mature();}});
    simplex_features("Tree",{vthresh: 1, p1: 0.75, p2: 0.25});
    simplex_features("Rock",{hscale: 10, vtresh: 3, p1: 0.25, p2: 0.1, callback(thing) {
        if (Math.random()<=0.1) {
          var x = thing.x;
          var y = thing.y;
          var z = thing.z;
          thing.remove();
          HTomb.Things.FlintStone().place(x,y,z);
        }
    }});
    //simplex_features("Stick",{hscale: 10, vtresh: 3, p1: 0.1, p2: 0.1});
    water_table(23);
    scatter("Bat",0.005);
    scatter("Spider",0.005);
    minerals("IronOre");
    minerals("Bloodstone");
    minerals("GoldOre");
    minerals("Moonstone");
    minerals("Jade");
    addSlopes();
    grassify();
    noHauling();
  };
  function scatter(template,p) {
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        var z = HTomb.Tiles.groundLevel(x,y);
        var e = HTomb.Things.create(template);
        if (e.isCreature && HTomb.World.creatures[coord(x,y,z)]===HTomb.Player) {
          continue;
        } else if (Math.random()<p) {
          if (HTomb.World.turfs[coord(x,y,z)] && HTomb.World.turfs[coord(x,y,z)].liquid) {
            e = HTomb.Things.Fish();
          }
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
            HTomb.World.tiles[z][x][y] = HTomb.Tiles.WallTile;
          }
          z = grid[x][y]+1;
          HTomb.World.tiles[z][x][y] = HTomb.Tiles.FloorTile;
        }
      }
    }
    console.log("Highest at " + mx + ", lowest at " + mn);
  }
  function simplex_features(template,options) {
    options = options || {};
    var callb = options.callback;
    var hscale = options.hscale || 20;
    var vscale = options.vscale || 4;
    var vthresh = options.vthresh || 2;
    var p1 = options.p1 || 0.5;
    var p2 = options.p2 || 0.25;
    var noise = new ROT.Noise.Simplex();
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        var z = HTomb.Tiles.groundLevel(x,y);
        var val = parseInt(noise.get(x/hscale,y/hscale)*vscale);
        var r = Math.random();
        if ((val>vthresh && r<p1) || (val===vthresh && r<p2)) {
          if (options.filter===undefined || options.filter(x,y,z)===true) {
            var thing = HTomb.Things.create(template);
            thing.place(x,y,z);
            if (options.callback) {
              options.callback(thing);
            }
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
        for (var z=HTomb.Tiles.groundLevel(x,y); z<=elev; z++) {

          var square = HTomb.Tiles.getSquare(x,y,z);
          HTomb.Things.create("Water").place(x,y,z);
          if (square.items) {
            for (var i=0; i<square.items.length; i++) {
              //square.items[i].remove();
            }
          }
          if (square.feature) {
            square.feature.remove();
            if (Math.random()<0.5) {
              HTomb.Things.create("Seaweed").place(x,y,z);
            }
          }
          // if (z===HTomb.Tiles.groundLevel(x,y) && Math.random()<0.1) {
          //   HTomb.Things.create("Seaweed").place(x,y,z);
          // }
          if (z===elev) {
            HTomb.Things.create("Water").place(x,y,z+1);
          }
        }
      }
    }
  }

  function minerals(ore,p) {
    p = 0.01 || p;
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        for (var z=1; z<HTomb.Tiles.groundLevel(x,y)-1; z++) {
          if (Math.random()<p) {
            HTomb.Things.create(ore).place(x,y,z);
          }
        }
      }
    }
  }
  function addSlopes() {
    var tiles = HTomb.World.tiles;
    var squares;
    var square;
    var slope;
    for (var x=0; x<LEVELW; x++) {
      for (var y=0; y<LEVELH; y++) {
        for (var z=0; z<NLEVELS-1; z++) {
          if (tiles[z][x][y]===HTomb.Tiles.FloorTile && tiles[z+1][x][y]===HTomb.Tiles.EmptyTile) {
            squares = HTomb.Tiles.neighbors(x,y);
            slope = false;
            for (var i=0; i<squares.length; i++) {
              square = squares[i];
              if (tiles[z][square[0]][square[1]]===HTomb.Tiles.WallTile && tiles[z+1][square[0]][square[1]]===HTomb.Tiles.FloorTile) {
                slope = true;
              }
            }
            if (slope===true) {
              //HTomb.Entity.create("UpSlope").place(x,y,z);
              tiles[z][x][y] = HTomb.Tiles.UpSlopeTile;
              tiles[z+1][x][y] = HTomb.Tiles.DownSlopeTile;
            }
          }
        }
      }
    }
  }
  function grassify() {
    var tiles = HTomb.World.tiles;
    var squares;
    var square;
    var slope;
    for (var x=0; x<LEVELW; x++) {
      for (var y=0; y<LEVELH; y++) {
        var z = HTomb.Tiles.groundLevel(x,y);
        if (tiles[z][x][y]===HTomb.Tiles.FloorTile && HTomb.World.turfs[coord(x,y,z)]===undefined) {
          HTomb.Things.Grass().place(x,y,z);
        }
      }
    }
  }
  function noHauling() {
    for (var it in HTomb.World.items) {
      var items = HTomb.World.items[it];
      for (var i=0; i<items.length; i++) {
        items[i].item.haulable=false;
      }
    }
  }

  HTomb.World.dailyCycle = {
    hour: 8,
    minute: 0,
    day: 0,
    turn: 0,
    onTurnBegin: function() {
      this.turn+=1;
      this.minute+=1;
      if (this.minute>=60) {
        this.minute = 0;
        this.hour+=1;
        if (this.hour>=24) {
          this.hour = 0;
          this.day+=1;
        }
      }
    },
    sunlight: {symbol: "\u263C"},
    waning: {symbol: "\u263E", light: 32},
    twilight: {symbol: "\u25D2"},
    fullMoon: {symbol: "\u26AA", light: 64},
    waxing: {symbol: "\u263D", light: 32},
    newMoon: {symbol: "\u25CF", light: 0},
    times: {
      dawn: 6,
      dusk: 17,
      waxing: 8,
      fullMoon: 7,
      waning: 8,
      newMoon: 7,
      order: ["waxing","fullMoon","waning","newMoon"]
    },
    getPhase: function() {
      if (this.hour<this.times.dusk && this.hour>=this.times.dawn+1) {
        return this.sunlight;
      } else if (this.hour<this.times.dusk+1 && this.hour>=this.times.dawn) {
        return this.twilight;
      } else {
        return this.getMoon();
      }
      console.log(["how did we reach this?",this.day,this.tally]);
    },
    getMoon: function() {
      var phase = this.day%30;
      var tally = 0;
      for (var i=0; i<this.times.order.length; i++) {
        tally+=this.times[this.times.order[i]];
        if (phase<=tally) {
          return this[this.times.order[i]];
        }
      }
    },
    lightLevel: function() {
      var dawn = 6;
      var dusk = 17;
      var darkest = 128;
      var light, moonlight;
      if (this.hour < dawn || this.hour >= dusk+1) {
        return darkest;
      } else if (this.hour < dawn+1) {
        moonlight = this.getMoon().light;
        light = Math.min(255,(this.minute/60)*(255-darkest)+darkest+moonlight);
        return light;
      } else if (this.hour >= dusk) {
        moonlight = this.getMoon().light;
        light = Math.min(255,((60-this.minute)/60)*(255-darkest)+darkest+moonlight);
        return light;
      } else {
        return 255;
      }
    },
    shade: function(arr,x,y,z) {
      var c = ROT.Color.fromString(arr[1]);
      c = ROT.Color.multiply(c,[this.lightLevel(),this.lightLevel(),255]);
      c[0] = (isNaN(c[0])) ? 0 : c[0];
      c[1] = (isNaN(c[1])) ? 0 : c[1];
      c = ROT.Color.toHex(c);
      arr[1] = c;
      return arr;
    }
  };

  return HTomb;
})(HTomb);
