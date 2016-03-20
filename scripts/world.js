HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var coord = HTomb.coord;

  function grid3d() {
    var grid = [];
    for (var k=0; k<NLEVELS; k++) {
      grid.push([]);
      for (var i=0; i<LEVELW; i++) {
        grid[k].push([]);
      }
    }
    return grid;
  }

  HTomb.World.things = [];
  HTomb.World.tiles = grid3d();
  HTomb.World.explored = grid3d();
  HTomb.World.lit = grid3d();
  HTomb.World.lights = {};
  HTomb.World.visible = {};
  HTomb.World.creatures = {};
  HTomb.World.items = {};
  HTomb.World.features = {};
  HTomb.World.zones = {};
  HTomb.World.portals = {};
  HTomb.World.turfs = {};
  console.timeEnd("lists");

  HTomb.World.init = function() {
    HTomb.World.fillTiles();
    HTomb.World.generators.bestSoFar();
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

  HTomb.World.validate = {
    dirty: {},
    cleaned: {}
  };
  HTomb.World.validate.clean = function() {
    //lighting can only be done all at once?
    HTomb.World.validate.lighting();
    for (var crd in this.dirty) {
      if (this.cleaned[crd]) {
        continue;
      }
      var d = HTomb.decoord(crd);
      var x = d[0];
      var y = d[1];
      var z = d[2];
      this.square(x,y,z);
    }
    this.dirty = {};
    this.cleaned = {};
  };
  HTomb.World.validate.square = function(x,y,z) {
    this.slopes(x,y,z);
    this.floors(x,y,z);
    this.falling(x,y,z);
    this.liquids(x,y,z);
    this.cleaned[coord(x,y,z)] = true;
  }
  HTomb.World.validate.all = function() {
    this.dirty = {};
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        for (var z=1; z<NLEVELS-1; z++) {
          this.square(x,y,z);
        }
      }
    }
  };
  HTomb.World.validate.dirtify = function(x,y,z) {
    this.dirty[coord(x,y,z)]===true;
  };
  HTomb.World.validate.dirtyNeighbors = function(x,y,z) {
    this.dirtify(x,y,z);
    var dx;
    var dy;
    var dz;
    var dirs = HTomb.dirs[26];
    for (var i=0; i<dirs.length; i++) {
      dx = x+dirs[i][0];
      dy = y+dirs[i][1];
      dz = z+dirs[i][2];
      this.dirtify(dx,dy,dz);
    }
  }
  HTomb.World.validate.cleanNeighbors = function(x,y,z) {
    this.dirtyNeighbors(x,y,z);
    this.clean();
  }
  HTomb.World.validate.slopes = function(x,y,z) {
    // validate.all slopes
    var t = HTomb.World.tiles[z][x][y];
    if (t===HTomb.Tiles.UpSlopeTile) {
      if (HTomb.World.tiles[z+1][x][y].fallable===true) {
        HTomb.World.tiles[z+1][x][y] = HTomb.Tiles.DownSlopeTile;
      }
    } else if (t===HTomb.Tiles.DownSlopeTile) {
      t = HTomb.World.tiles[z-1][x][y];
      if (t!==HTomb.Tiles.UpSlopeTile) {
        if (t.solid) {
          HTomb.World.tiles[z][x][y] = HTomb.Tiles.FloorTile;
        } else {
          HTomb.World.tiles[z][x][y] = HTomb.Tiles.EmptyTile;
        }
      }
    }
  };
  HTomb.World.validate.floors = function(x,y,z) {
    if (HTomb.World.tiles[z][x][y]===HTomb.Tiles.EmptyTile && HTomb.World.tiles[z-1][x][y].solid) {
      HTomb.World.tiles[z][x][y] = HTomb.Tiles.FloorTile;
    }
  };
  HTomb.World.validate.falling = function(x,y,z) {
    if (HTomb.World.tiles[z][x][y].fallable) {
      var creature = HTomb.World.creatures[coord(x,y,z)];
      if (creature && creature.movement.flies!==true) {
        creature.fall();
      }
      var items = HTomb.World.items[coord(x,y,z)] || [];
      while (items && items.length>0) {
        items[0].fall();
      }
    }
  };
  HTomb.World.validate.liquids = function(x,y,z) {
    var t = HTomb.World.turfs[coord(x,y,z)];
    if (t && t.liquid) {
      t.liquid.flood();
    }
  };

  // //************Concrete methods for populating a world****************
  var placement = {
    creatures: {},
    items: {},
    features: {}
  };
  placement.stack = function(thing,x,y,z) {
    var crd = coord(x,y,z);
    var stack;
    if (thing.feature) {
      stack = this.features[crd] || [];
      stack.push(thing);
      this.features[crd] = stack;
    } else if (thing.item) {
      stack = this.items[crd] || [];
      stack.push(thing);
      this.items[crd] = stack;
    } else if (thing.creature) {
      stack = this.creatures[crd] || [];
      stack.push(thing);
      this.creatures[crd] = stack;
    } else {
      thing.place(x,y,z);
    }
  }
  placement.resolve = function() {
    var crd, stack, d;
    for (crd in this.creatures) {
      if (HTomb.World.creatures[crd]) {
        continue;
      }
      stack = this.creatures[crd];
      if (stack.length>1) {
        HTomb.shuffle(stack);
      }
      d = HTomb.decoord(crd);
      stack[0].place(d[0],d[1],d[2]);
    }
    for (crd in this.features) {
      if (HTomb.World.features[crd]) {
        continue;
      }
      stack = this.features[crd];
      if (stack.length>1) {
        HTomb.shuffle(stack);
      }
      d = HTomb.decoord(crd);
      stack[0].place(d[0],d[1],d[2]);
    }
    for (crd in this.items) {
      if (HTomb.World.items[crd]) {
        continue;
      }
      stack = this.items[crd];
      if (stack.length>1) {
        HTomb.shuffle(stack);
      }
      d = HTomb.decoord(crd);
      stack[0].place(d[0],d[1],d[2]);
    }
  };

  function timeIt(name,callb) {
    console.time(name);
    callb();
    console.timeEnd(name);
  }




  HTomb.World.generators = {};
  HTomb.World.generators.bestSoFar = function() {
timeIt("elevation", function() {
    assignElevation(50);
}); timeIt("lava", function() {
    if (HTomb.Debug.faster!==true) {
      placeLava(10);
    }
}); timeIt("water", function() {
    waterTable(48,4);
}); timeIt("graveyards", function() {
    graveyards();
}); timeIt("slopes", function() {
    addSlopes();
}); timeIt("minerals", function() {
    placeMinerals({template: "IronOre", p: 0.001});
    placeMinerals({template: "Bloodstone", p: 0.001});
    placeMinerals({template: "GoldOre", p: 0.001});
    placeMinerals({template: "Moonstone", p: 0.001});
    placeMinerals({template: "Jade", p: 0.001});
}); timeIt("caverns", function() {
    cavernLevels(3);
}); timeIt("labyrinths", function() {
    labyrinths();
}); timeIt("grass", function() {
    grassify();
}); timeIt("plants", function() {
    growPlants({template: "Tree", p: 0.05});
    growPlants({template: "Shrub", p: 0.05});
    growPlants({template: "WolfsbanePlant", p: 0.001});
    growPlants({template: "AmanitaPlant", p: 0.001});
    growPlants({template: "MandrakePlant", p: 0.001});
    growPlants({template: "WormwoodPlant", p: 0.001});
    growPlants({template: "BloodwortPlant", p: 0.001});
}); timeIt("player", function() {
    placePlayer();
}); timeIt("critters", function() {
    placeCritters();
}); timeIt("resolving", function() {
    placement.resolve();
}); timeIt("no hauling", function() {
    notOwned();
});
  };

  var lowest;
  var highest;
  function assignElevation(ground) {
    ground = ground || 50;
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
    lowest = mn;
    highest = mx;
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
              if (tiles[z][square[0]][square[1]]===HTomb.Tiles.WallTile
                  && tiles[z+1][square[0]][square[1]]===HTomb.Tiles.FloorTile) {
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

  function waterTable(elev, depth) {
    elev = elev || lowest+3;
    depth = depth || 4;
    var rock = new ROT.Map.Cellular(LEVELW,LEVELH);
    rock.randomize(0.45);
    for (var i=0; i<10; i++) {
      rock.create();
    }
    function nonsolids(x,y,z) {return HTomb.World.tiles[z][x][y].solid!==true;}
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        for (var z=elev; z>=lowest; z--) {
          if (z<elev-depth && HTomb.World.tiles[z][x][y]===HTomb.Tiles.WallTile) {
            break;
          } else if (rock._map[x][y]===0 || HTomb.World.tiles[z][x][y]!==HTomb.Tiles.WallTile
              || HTomb.Tiles.countNeighborsWhere(x,y,z,nonsolids)>0) {
            HTomb.Things.create("Water").place(x,y,z);
          }
        }
      }
    }
  }
  function placeLava(elev) {
    elev = elev || 10;
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        for (var z=elev; z>0; z--) {
          if (z<elev) {
            HTomb.World.tiles[z][x][y] = HTomb.Tiles.EmptyTile;
          }
          HTomb.Things.create("Lava").place(x,y,z);
        }
      }
    }
  }
  function graveyards(options) {
    options = options || {};
    var template = options.template || "Shrub";
    var p = options.p || 0.01;
    var n = options.n || 3;
    var born = options.born || [0,0.1,0.2,0.3,0.5,0.3,0.2,0];
    var survive = options.survive || [0.7,0.8,0.8,0.8,0.6,0.4,0.2,0.1];
    var cells = new HTomb.Cells({
      born: born,
      survive: survive
    });
    cells.randomize(p);
    cells.iterate(n);
    function fallables(x,y,z) {return HTomb.World.tiles[z][x][y].fallable;}
    cells.apply(function(x,y,val) {
      if (val) {
        var z = HTomb.Tiles.groundLevel(x,y);
        if (HTomb.Tiles.countNeighborsWhere(x,y,z,fallables)===0
            && HTomb.World.turfs[coord(x,y,z)]===undefined
            && HTomb.World.turfs[coord(x,y,z-1)]===undefined) {
          var grave = HTomb.Things["Tombstone"]();
          placement.stack(grave,x,y,z);
        }
      }
    });
  }

  function cavernLevels(n) {
    n = n || 4;
    n = parseInt(ROT.RNG.getNormal(n,1));
    var used = [];
    for (var k=0; k<n; k++) {
      var placed = false;
      var tries = 0;
      var max = 50;
      while (placed===false && tries<max) {
        var z = parseInt(Math.random()*40)+11;
        if (used.indexOf(z)!==-1) {
          tries+=1;
          continue;
        }
        placed = true;
        var z = parseInt(Math.random()*30)+11;
        used.push(z);
        used.push(z+1);
        used.push(z-1);
        var caves = new ROT.Map.Cellular(LEVELW-2,LEVELH-2,{connected: true});
        caves.randomize(0.5);
        for (var i=0; i<6; i++) {
          caves.create();
        }
        console.log("cavern level at " + z);
        caves.create(function(x,y,val) {
          if (val) {
            HTomb.World.tiles[z][x+1][y+1] = HTomb.Tiles.FloorTile;
            HTomb.World.validate.dirtify(x+1,y+1,z);
          }
        });
      }
    }
    HTomb.World.validate.clean();
  }
  function labyrinths(n) {
    n = n || 12;
    n = parseInt(ROT.RNG.getNormal(n,n/4));
    for (var k=0; k<n; k++) {
      var width = parseInt(Math.random()*8)+8;
      var height = parseInt(Math.random()*8)+8;
      var placed = false;
      var tries = 0;
      var max = 50;
      while (placed===false && tries<max) {
        var x = parseInt(Math.random()*(LEVELW-20))+10;
        var y = parseInt(Math.random()*(LEVELH-20))+10;
        var z = parseInt(Math.random()*(lowest-8))+11;
        placed = true;
        outerLoop:
        for (var i=x; i<x+width; i++) {
          for (var j=y; j<y+height; j++) {
            if (HTomb.World.tiles[z][i][j]!==HTomb.Tiles.WallTile) {
              placed = false;
              break outerLoop;
            }
          }
        }
        if (placed===true) {
          var maze = new ROT.Map.EllerMaze(width,height);
          maze.create(function(x0,y0,val) {
            if (val===0) {
              HTomb.World.tiles[z][x+x0][y+y0] = HTomb.Tiles.FloorTile;
              HTomb.World.validate.dirtify(x+x0,y+y0,z);
            }
          });
        }
        tries = tries+1;
      }
    }
    HTomb.World.validate.clean();
  }
  function placeMinerals(options) {
    options = options || {};
    var template = options.template || "IronOre";
    var p = options.p || 0.01;
    var n = options.n || 3;
    var depth = options.depth || 2;
    var born = options.born || [0,0.1,0.2,0.3,0.5,0.5,0.8,0.8];
    var survive = options.survive || [0.5,0.5,0.5,0.7,0.7,0.5,0.5,0.5];
    var cells;
    function nonsolids(x,y,z) {return HTomb.World.tiles[z][x][y].solid!==true;}
    // save some time for now by skipping lower levels
    var bottom = (HTomb.Debug.faster) ? 40 : 15;
    for (var z=bottom; z<=highest; z++) {
      cells = new HTomb.Cells({
        born: born,
        survive: survive
      });
      // If we're above some ground level, mask non-wall squares
      if (z>=lowest) {
        cells.setMask(function(x,y) {
          if (HTomb.World.tiles[z][x][y]===HTomb.Tiles.WallTile) {
            return null;
          } else {
            return 0;
          }
        });
      }
      cells.randomize(p);
      cells.iterate(n);
      cells.apply(function(x,y,val) {
        if (val && HTomb.Tiles.countNeighborsWhere(x,y,z,nonsolids)===0) {
          var mineral = HTomb.Things[template]();
          mineral.item.makeStack();
          placement.stack(mineral,x,y,z);
        }
      });
    }
  }
  function growPlants(options) {
    options = options || {};
    var template = options.template || "Shrub";
    var p = options.p || 0.01;
    var n = options.n || 3;
    var born = options.born || [0,0.1,0.2,0.3,0.5,0.5,0.8,0.8];
    var survive = options.survive || [0.9,0.8,0.8,0.7,0.7,0.2,0.2,0.2];
    var cells = new HTomb.Cells({
      born: born,
      survive: survive
    });
    cells.randomize(p);
    cells.iterate(n);
    cells.apply(function(x,y,val) {
      if (val) {
        var z = HTomb.Tiles.groundLevel(x,y);
        var t = HTomb.World.turfs[coord(x,y,z)];
        var plant;
        if (t && t.liquid) {
          if (Math.random()<0.5) {
            plant = HTomb.Things.Seaweed();
            placement.stack(plant,x,y,z);
          }
        } else {
          plant = HTomb.Things[template]();
          if (plant.crop) {
            plant.crop.mature();
          }
          placement.stack(plant,x,y,z);
        }
      }
    });
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
  function notOwned() {
    for (var fe in HTomb.World.features) {
      HTomb.World.features[fe].owned = false;
    }
    for (var it in HTomb.World.items) {
      var items = HTomb.World.items[it];
      for (var i=0; i<items.length; i++) {
        items[i].item.owned=false;
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

  function placeCritters(p) {
    p = p || 0.01;
    var landCritters = ["Bat","Spider"];
    var waterCritters = ["Fish"];
    var template;
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        if (Math.random()<p) {
          var z = HTomb.Tiles.groundLevel(x,y);
          var t = HTomb.World.turfs[coord(x,y,z)]
          if (t && t.liquid) {
            template = HTomb.shuffle(waterCritters)[0];
          } else {
            template = HTomb.shuffle(landCritters)[0];
          }
          var critter = HTomb.Things[template]();
          placement.stack(critter,x,y,z);
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
    newMoon: {symbol: "\u25CF", light: 1},
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
      var darkest = 64;
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
    shade: function(arr) {
      var c = ROT.Color.fromString(arr[1]);
      var bg = ROT.Color.fromString(arr[2]);
      c = ROT.Color.multiply(c,[this.lightLevel(),this.lightLevel(),this.lightLevel()]);
      bg = ROT.Color.multiply(bg,[this.lightLevel(),this.lightLevel(),this.lightLevel()]);
      c[0] = (isNaN(c[0])) ? 0 : c[0];
      c[1] = (isNaN(c[1])) ? 0 : c[1];
      c[2] = (isNaN(c[2])) ? 0 : c[2];
      c = ROT.Color.toHex(c);
      bg[0] = (isNaN(bg[0])) ? 0 : bg[0];
      bg[1] = (isNaN(bg[1])) ? 0 : bg[1];
      bg[2] = (isNaN(bg[2])) ? 0 : bg[2];
      bg = ROT.Color.toHex(bg);
      arr[1] = c;
      arr[2] = bg;
      return arr;
    }
  };


  // faster to track this as globally rather than in grass
  var grassGrower = {};
  grassGrower.growGrass = function() {
    // check only once every ten turns
    // could add to some kind of scheduler, to preserve frame rate
    if (HTomb.World.dailyCycle.turn%50!==0) {
      return;
    }
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        if (Math.random()>=0.1) {
          continue;
        }
        var z = HTomb.Tiles.groundLevel(x,y);
        if (HTomb.World.tiles[z][x][y]!==HTomb.Tiles.FloorTile || HTomb.World.turfs[coord(x,y,z)]) {
          continue;
        }
        // count adjacent grass
        var n = HTomb.Tiles.countNeighborsWhere(x,y,z,function(x,y,z) {
          return (HTomb.World.turfs[coord(x,y,z)] && HTomb.World.turfs[coord(x,y,z)].template==="Grass");
        });
        if (n>0) {
          var grass = HTomb.Things.Grass();
          grass.place(x,y,z);
        }
      }
    }
  };
  HTomb.Events.subscribe(grassGrower,"TurnBegin");
  grassGrower.onTurnBegin = grassGrower.growGrass;

  //callback is optional
  HTomb.World.creaturesWithin = function(x,y,z,r,callb) {
    var creatures = [];
    for (var c in HTomb.World.creatures) {
      var cr = HTomb.World.creatures[c];
      if (callb && callb(cr)===false) {
        continue;
      } else {
        if (HTomb.Path.distance(x,y,cr.x,cr.y) && Math.abs(z-cr.z)<=1) {
          creatures.push(cr);
        }
      }
    }
    return creatures;
  };

   HTomb.World.creaturesWithin = function(x,y,z,r,callb) {
     var creatures = [];
     for (var i=-r; i<=r; i++) {
       for (var j=-r; j<=r; j++) {
         var cr = HTomb.World.creatures[coord(x+i,y+j,z)];
         if (cr && (callb===undefined || callb(cr))) {
           creatures.push(cr);
         }
       }
     }
     return creatures;
   };

  return HTomb;
})(HTomb);
