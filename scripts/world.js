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
          // check if liquids need to flowSymbol
          t = HTomb.World.turfs[coord(x,y,z)];
          if (t && t.liquid) {
            t.liquid.flood();
          }
        }
      }
    }
    //HTomb.GUI.reset();
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
    assignElevation();
    simplex_features("Tombstone",{p1: 0.25, p2: 0.1, filter: function(x,y,z) {
      return (HTomb.Tiles.getNeighbors(x,y,z).fallables.length===0);
    }});
    addSlopes();
    //placeMinerals();
    waterTable(23);
    grassify();
    //growPlants();
    //placeCreatures();

    placePlayer();
    noHauling();
  };

  function assignElevation() {
    var ground = 25;
    var hscale1 = 128;
    var vscale1 = 3;
    var hscale2 = 64;
    var vscale2 = 2;
    var hscale3 = 32;
    var vscale3 = 1;
    var noise = new ROT.Noise.Simplex();
    var grid = [];
    var mx = 0, mn = NLEVELS;
    for (var x=0; x<LEVELW; x++) {
      grid.push([]);
      for (var y=0; y<LEVELH; y++) {
        grid[x][y] = ground;
        grid[x][y]+= noise.get(x/hscale1,y/hscale1)*vscale1;
        grid[x][y]+= noise.get(x/hscale2,y/hscale2)*vscale2;
        grid[x][y]+= noise.get(x/hscale3,y/hscale3)*vscale3;
        grid[x][y] = parseInt(grid[x][y]);
        mx = Math.max(mx,grid[x][y]);
        mx = Math.min(mn,grid[x][y]);
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

  function waterTable(elev) {
    var depth = 5;
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        for (var z=elev; z>0; z--) {
          if (z > elev-depth || HTomb.World.tiles[z][x][y]!==HTomb.Tiles.WallTile) {
            HTomb.Things.create("Water").place(x,y,z);
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
  function placePlayer() {
    var placed = false;
    while (placed===false) {
      var x = parseInt(ROT.RNG.getNormal(0,LEVELW/4) + LEVELW/2);
      var y = parseInt(ROT.RNG.getNormal(0,15) + LEVELH/2);
      if (x<=0 || y<=0 || x>=LEVELW-1 || y>=LEVELH-1) {
        continue;
      }
      var z = HTomb.Tiles.groundLevel(x,y);
      if (HTomb.World.creatures[coord(x,y,z)]) {
        continue;
      }
      if (HTomb.World.turfs[coord(x,y,z)] && HTomb.World.turfs[coord(x,y,z)].liquid) {
        continue;
      }
      var p = HTomb.Things.Necromancer();
      HTomb.Things.Player().addToEntity(p);
      p.place(x,y,z);
      if (p.sight) {
        HTomb.FOV.findVisible(p.x, p.y, p.z, p.sight.range);
      }
      placed = true;

    }
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
        if (this.hour===this.times.dawn) {
          HTomb.GUI.pushMessage("The sun is coming up.");
        } else if (this.hour===this.times.dusk) {
          HTomb.GUI.pushMessage("Night is falling.");
        }
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
