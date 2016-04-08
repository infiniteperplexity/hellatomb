HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var coord = HTomb.Utils.coord;


  function timeIt(name,callb) {
    console.time(name);
    callb();
    console.timeEnd(name);
  }

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
        HTomb.Utils.shuffle(stack);
      }
      d = HTomb.Utils.decoord(crd);
      stack[0].place(d[0],d[1],d[2]);
    }
    for (crd in this.features) {
      if (HTomb.World.features[crd]) {
        continue;
      }
      stack = this.features[crd];
      if (stack.length>1) {
        HTomb.Utils.shuffle(stack);
      }
      d = HTomb.Utils.decoord(crd);
      stack[0].place(d[0],d[1],d[2]);
    }
    for (crd in this.items) {
      if (HTomb.World.items[crd]) {
        continue;
      }
      stack = this.items[crd];
      if (stack.length>1) {
        HTomb.Utils.shuffle(stack);
      }
      d = HTomb.Utils.decoord(crd);
      stack[0].place(d[0],d[1],d[2]);
    }
  };

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
    voronoi();
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
            HTomb.World.covers[coord(x,y,z)] = HTomb.Covers.Water;
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
          HTomb.World.covers[coord(x,y,z)] = HTomb.Covers.Lava;
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
            && HTomb.World.covers[coord(x,y,z)]===undefined
            && HTomb.World.covers[coord(x,y,z-1)]===undefined) {
          var grave = HTomb.Things["Tombstone"]();
          placement.stack(grave,x,y,z);
        }
      }
    });
  }

  function graveyards2(options) {
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
            && HTomb.World.covers[coord(x,y,z)]===undefined
            && HTomb.World.covers[coord(x,y,z-1)]===undefined) {
          var grave = HTomb.Things["Tombstone"]();
          placement.stack(grave,x,y,z);
        }
      }
    });
  }

  function voronoi() {
    let points = [];
    for (let i=1; i<LEVELW-1; i++) {
      for (let j=1; j<LEVELH-1; j++) {
        if (Math.random()<0.001) {
          points.push([i,j]);
        }
      }
    }
    let boundaries = HTomb.Path.voronoi(points,3).boundaries;
    for (let i=0; i<boundaries.length; i++) {
      let x = boundaries[i][0];
      let y = boundaries[i][1];
      let z = HTomb.Tiles.groundLevel(x,y);
      HTomb.World.covers[coord(x,y,z)] = HTomb.Covers.Road;
    }
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
        var t = HTomb.World.covers[coord(x,y,z)];
        var plant;
        if (t && t.liquid) {
          if (Math.random()<0.5) {
            plant = HTomb.Things.Seaweed();
            placement.stack(plant,x,y,z);
          }
        } else {
          plant = HTomb.Things[template]();
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
        if (tiles[z][x][y]===HTomb.Tiles.FloorTile && HTomb.World.covers[coord(x,y,z)]===undefined) {
          HTomb.World.covers[coord(x,y,z)] = HTomb.Covers.Grass;
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
      if (HTomb.World.covers[coord(x,y,z)] && HTomb.World.covers[coord(x,y,z)].liquid) {
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
          var t = HTomb.World.covers[coord(x,y,z)]
          if (t && t.liquid) {
            template = HTomb.Utils.shuffle(waterCritters)[0];
          } else {
            template = HTomb.Utils.shuffle(landCritters)[0];
          }
          var critter = HTomb.Things[template]();
          placement.stack(critter,x,y,z);
        }
      }
    }
  }




  // faster to track this as globally rather than in grass
  var grassGrower = {};
  grassGrower.growGrass = function() {
    // check only once every ten turns
    // could add to some kind of scheduler, to preserve frame rate
    if (HTomb.Time.dailyCycle.turn%50!==0) {
      return;
    }
    var x,y,z;
    //// need a way to speed this up
    // var grasses = HTomb.Utils.where(HTomb.World.covers,function(v,k,o) {return (v.template==="Grass");});
    // for (var g=0; g<grasses.length; g++) {
    //   x = grasses[g].x;
    //   y = grasses[g].y;
    //   z = grasses[g].z;
    //   if (z<HTomb.Tiles.groundLevel(x,y)) {
    //     if (Math.random()<0.1) {
    //       grasses[g].destroy();
    //     }
    //   }
    // }
    for (x=1; x<LEVELW-1; x++) {
      for (y=1; y<LEVELH-1; y++) {
        if (Math.random()>=0.1) {
          continue;
        }
        z = HTomb.Tiles.groundLevel(x,y);
        if (HTomb.World.tiles[z][x][y]!==HTomb.Tiles.FloorTile || HTomb.World.covers[coord(x,y,z)]) {
          continue;
        }
        // count adjacent grass
        var n = HTomb.Tiles.countNeighborsWhere(x,y,z,function(x,y,z) {
          return (HTomb.World.covers[coord(x,y,z)] && HTomb.World.covers[coord(x,y,z)].template==="Grass");
        });
        if (n>0) {
          HTomb.World.covers[coord(x,y,z)] = HTomb.Covers.Grass;
        }
      }
    }
  };
  HTomb.Events.subscribe(grassGrower,"TurnBegin");
  grassGrower.onTurnBegin = grassGrower.growGrass;


  return HTomb;
})(HTomb);
