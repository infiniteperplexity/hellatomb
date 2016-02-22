HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.coord;

  // Define a generic task that gets workers assigned
  HTomb.Things.define({
    template: "Task",
    name: "task",
    parent: "Thing",
    assigner: null,
    assignee: null,
    zone: null,
    zoneTemplate: null,
    feature: null,
    featureTemplate: null,
    each: ["assigner","assignee","zone","feature"],
    allowedTiles: [],
    onDefine: function() {
      if (this.zoneTemplate) {
        HTomb.Things.defineZone(this.zoneTemplate);
      }
    },
    tryAssign: function(cr) {
      if (this.canReachZone(cr)) {
        this.assignTo(cr);
        return true;
      } else {
        return false;
      }
    },
    // one of the more common ways to test if a task can be assigned
    canReachZone: function(cr) {
      var zone = this.zone;
      var path = HTomb.Path.aStar(zone.x,zone.y,zone.z,cr.x,cr.y,cr.z,{useLast: false});
      if (path!==false) {
        return true;
      } else if (zone.z===cr.z && HTomb.Path.distance(cr.x,cr.y,zone.x,zone.y)<=1) {
        return true;
      } else {
        return false;
      }
    },
    canDesignateTile: function(x,y,z) {
      if (this.allowedTiles==="all") {
        return true;
      } else if (this.allowedTiles.indexOf(HTomb.World.tiles[z][x][y])>=0) {
        return true;
      } else {
        return false;
      }
    },
    assignTo: function(cr) {
      if (cr.minion===undefined) {
        HTomb.Debug.pushMessage("Problem assigning task");
      } else {
        this.assignee = cr;
        cr.minion.onAssign(this);
      }
    },
    unassign: function() {
      var cr = this.assignee;
      if (cr.minion===undefined) {
        HTomb.Debug.pushMessage("Problem unassigning task");
      } else {
        this.assignee = null;
        cr.minion.unassign();
      }
    },
    cancel: function() {
      var master = this.assigner;
      if (master) {
        var taskList = this.assigner.master.taskList;
        taskList.splice(taskList.indexOf(this),1);
      }
      if (this.assignee) {
        this.assignee.minion.unassign();
      }
      if (this.zone) {
        this.zone.remove();
      }
    },
    complete: function() {
      var master = this.assigner;
      if (master) {
        var taskList = this.assigner.master.taskList;
        taskList.splice(taskList.indexOf(this),1);
      }
      if (this.assignee) {
        this.assignee.minion.unassign();
      }
      if (this.zone) {
        this.zone.remove();
      }
      if (this.onComplete) {
        this.onComplete();
      }
    },
    // the last parameter is optional
    placeZone: function(x,y,z, master) {
      master = master || HTomb.Player;
      if (this.canDesignateTile(x,y,z)) {
        var zone = HTomb.Things[this.zoneTemplate.template]();
        zone.place(x,y,z);
        var t = HTomb.Things[this.template]();
        zone.task = t;
        t.zone = zone;
        t.assigner = master;
        t.assigner.master.taskList.push(t);
      }
    },
    // note that this passes the behavior, not the entity
    designate: function(master) {
      this.designateSquares({master: master});
    },
    // one common way of designating tasks
    designateSquare: function(options) {
      options = options || {};
      var master = options.master || HTomb.Player;
      var callb = options.callback || this.placeZone;
      var z = master.entity.z;
      var that = this;
      function createZone(x,y,z) {
        callb(x,y,z);
      }
      HTomb.GUI.selectSquare(z,createZone);
    },
    // one common way of designating tasks
    designateSquares: function(options) {
      options = options || {};
      var callb = options.callback || this.placeZone;
      var master = options.master || HTomb.Player.master;
      options.outline = options.outline || false;
      var that = this;
      var taskSquares = function(squares) {
        for (var i=0; i<squares.length; i++) {
          var crd = squares[i];
          callb(crd[0],crd[1],crd[2]);
        }
        HTomb.GUI.reset();
      };
      HTomb.GUI.selectSquareZone(master.entity.z,taskSquares,{outline: options.outline, bg: this.zoneTemplate.bg});
    },
    ai: function() {
      this.seekZoneAI();
    },
    // A common AI pattern for Tasks
    seekZoneAI: function() {
      var cr = this.assignee;
      if (cr.movement) {
        var zone = this.zone;
        var x = zone.x;
        var y = zone.y;
        var z = zone.z;
        var dist = HTomb.Path.distance(cr.x,cr.y,x,y);
        if (dist>1 || cr.z!==z) {
          cr.movement.walkToward(x,y,z);
        } else if (dist===0) {
          cr.movement.walkRandom();
        } else if (dist===1) {
          this.work(x,y,z);
        }
      }
      cr.ai.acted = true;
    },
    work: function(x,y,z) {
      var f = HTomb.World.features[coord(x,y,z)];
      if (f===this.feature) {
        console.log("doing work");
        f.steps-=1;
        if (f.steps<=0) {
          this.finish();
          this.complete();
        }
      } else {
        this.feature = HTomb.Things.Construction(this.featureTemplate);
        this.feature.task = this;
        if (f) {
          console.log("removed a feature to make room for " + this.feature.describe());
          f.remove();
        }
        this.feature.place(x,y,z);
      }
    },
    finish: function() {
      HTomb.Debug.pushMessage("Don't use default!");
    }
  });




  HTomb.Things.defineTask({
    template: "Dig",
    name: "dig",
    zoneTemplate: {
      template: "DigZone",
      name: "dig",
      bg: "#553300"
    },
    featureTemplate: {
      name: "incomplete excavation",
      symbol: "\u2022",
      steps: 5,
      fg: HTomb.Constants.BELOW
    },
    allowedTiles: [
      HTomb.Tiles.FloorTile,
      HTomb.Tiles.WallTile,
      HTomb.Tiles.UpSlopeTile,
      HTomb.Tiles.DownSlopeTile,
      HTomb.Tiles.EmptyTile
    ],
    finish: function() {
      var tiles = HTomb.World.tiles;
      var EmptyTile = HTomb.Tiles.EmptyTile;
      var FloorTile = HTomb.Tiles.FloorTile;
      var WallTile = HTomb.Tiles.WallTile;
      var UpSlopeTile = HTomb.Tiles.UpSlopeTile;
      var DownSlopeTile = HTomb.Tiles.DownSlopeTile;
      var c = this.feature;
      var x = c.x;
      var y = c.y;
      var z = c.z;
      var t = tiles[z][x][y];
      // If there is a slope below, dig out the floor
      if (tiles[z-1][x][y]===UpSlopeTile && HTomb.World.explored[z-1][x][y] &&
        (
          t===WallTile || t===DownSlopeTile || t===FloorTile
        )
      ) {
        tiles[z][x][y] = EmptyTile;
      // If it's a wall, dig a tunnel
      } else if (t===WallTile) {
        tiles[z][x][y] = FloorTile;
      } else if (t===FloorTile) {
        // If it's a floor with a wall underneath dig a trench
        if (tiles[z-1][x][y]===WallTile) {
          tiles[z][x][y] = DownSlopeTile;
          tiles[z-1][x][y] = UpSlopeTile;
        // Otherwise just remove the floor
        } else {
          tiles[z][x][y] = EmptyTile;
        }
      // If it's a down slope tile, remove the slopes
      } else if (t===DownSlopeTile) {
        tiles[z][x][y] = EmptyTile;
        tiles[z-1][x][y] = FloorTile;
      // if it's an upward slope, remove the slope
      } else if (t===UpSlopeTile) {
        tiles[z][x][y] = FloorTile;
        if (tiles[z+1][x][y]===DownSlopeTile) {
          tiles[z+1][x][y] = EmptyTile;
        }
      }
      c.remove();
      HTomb.World.validate();
    }
  });

  HTomb.Things.defineTask({
    template: "Build",
    name: "build",
    zoneTemplate: {
      template: "BuildZone",
      name: "build",
      bg: "#444444"
    },
    featureTemplate: {
      name: "incomplete construction",
      symbol: "\u25AB",
      fg: HTomb.Constants.ABOVE,
      steps: 5
    },
    allowedTiles: [
      // for now, can't build unless there is a floor
      HTomb.Tiles.FloorTile,
      HTomb.Tiles.UpSlopeTile,
      HTomb.Tiles.DownSlopeTile,
      HTomb.Tiles.EmptyTile
    ],
    finish: function() {
      var tiles = HTomb.World.tiles;
      var EmptyTile = HTomb.Tiles.EmptyTile;
      var FloorTile = HTomb.Tiles.FloorTile;
      var WallTile = HTomb.Tiles.WallTile;
      var UpSlopeTile = HTomb.Tiles.UpSlopeTile;
      var DownSlopeTile = HTomb.Tiles.DownSlopeTile;
      var c = this.feature;
      var x = c.x;
      var y = c.y;
      var z = c.z;
      var t = tiles[z][x][y];
      // If it's a floor, build a slope
      if (t===FloorTile) {
        tiles[z][x][y] = UpSlopeTile;
        if (tiles[z+1][x][y]===EmptyTile) {
          tiles[z+1][x][y] = DownSlopeTile;
        }
      // If it's a slope, make it into a wall
      } else if (UpSlopeTile) {
        tiles[z][x][y] = WallTile;
        if (tiles[z+1][x][y] = DownSlopeTile) {
          tiles[z+1][x][y] = FloorTile;
        }
      // If it's empty, add a floor
      } else if (t===DownSlopeTile || t===EmptyTile) {
        tiles[z][x][y] = FloorTile;
      }
      HTomb.World.validate();
      c.remove();
    },
    designate: function(master) {
      this.designateSquares({master: master, outline: true});
    }
  });

  HTomb.Things.defineTask({
    template: "Undesignate",
    name: "undesignate",
    allowedTiles: "all",
    designate: function(master) {
      if (master.entity===HTomb.Player) {
        var deleteZones = function(squares) {
          for (var i=0; i<squares.length; i++) {
            var crd = squares[i];
            var z = HTomb.World.zones[coord(crd[0], crd[1], crd[2])];
            if (z) {
              z.task.cancel();
            }
          }
        };
        HTomb.GUI.selectSquareZone(HTomb.Player.z,deleteZones,{outline: false});
      }
    }
  });

  HTomb.Things.defineTask({
    template: "PatrolTask",
    name: "patrol",
    zoneTemplate: {
      template: "PatrolZone",
      name: "patrol",
      bg: "#880000"
    },
    allowedTiles: "all",
    designate: function(master) {
      this.designateSquare({master: master});
    },
    ai: function() {
      var cr = this.assignee;
      cr.ai.patrol(this.zone.x,this.zone.y,this.zone.z);
    }
  });

  HTomb.Things.defineTask({
    template: "BuildDoor",
    name: "build door",
    zoneTemplate: {
      template: "BuildDoorZone",
      name: "build",
      bg: "#553300"
    },
    featureTemplate: {
      name: "incomplete door",
      symbol: "\u25AB",
      steps: 10,
      fg: "#BB9922"
    },
    finish: function() {
      var c = this.feature;
      var x = c.x;
      var y = c.y;
      var z = c.z;
      c.remove();
      HTomb.Things.Door().place(x,y,z);
    },
    tryAssign: function(cr) {
      if (this.canReachZone(cr)) {
        this.assignTo(cr);
        return true;
      } else {
        return false;
      }
    },
    canDesignateTile: function(x,y,z) {
      var square = HTomb.Tiles.getSquare(x,y,z);
      if (square.terrain===HTomb.Tiles.FloorTile) {
        return true;
      } else {
        return false;
      }
    },
    // note that this passes the behavior, not the entity
    designate: function(master) {
      this.designateSquare({master: master});
    }
  });

  // any tile that can be touched by a worker from a square
  HTomb.Tiles.touchableFrom = function(x,y,z) {
    var touchable = [];
    //sideways
    var t, x1, y1;
    for (var i=0; i<ROT.DIRS.length; i++) {
      x1 = x+ROT.DIRS[i][0];
      y1 = y+ROT.DIRS[i][1];
      touchable.push([x1,y1,z]);
      t = HTomb.World.tiles[z][x1][y1];
      if (t.zmove===-1 || t.fallable) {
        touchable.push([x1,y1,z-1]);
      }
    }
    t = Htomb.World.tiles[z][x][y];
    if (t.zmove===+1) {
      touchable.push([x,y,z+1]);
    }
    return touchable;
  }
  return HTomb;
})(HTomb);


/*

Q: Turn a floor tile into a wall tile?
A: Build on the tile once to create a slope, and then build on the tile again to create a wall.

Q: Turn an upward slope into a wall tile?
A: Build once on the slope.

Q: Build a passage to the next level up?
A: Build once on a floor tile to create a slope.  If there is no ceiling above, you can reach the next level up.  Otherwise, dig a hole in the ceiling (see below.)

Q: Turn a deep pit or trench into a shallow pit or trench?
A: Build once in the pit.  Do not build above the pit or a worker may place a floor above the slope.

Q: Fill in a pit from above?
A: Build once in the pit to create a slope, then build in it a second time to fill in the pit.

Q: Build a floor in an empty tile?
A: Build once in the empty tile.

Q: Build a ceiling from above?
A: Same as building a floor.

Q: Build a ceiling from below?
A: Build an upward slope directly below, then build on the level above.

Q: Dig a shallow pit or trench in the floor?
A: Dig once on a floor tile to create a downward slope.

Q: Dig a deep pit or trench in the floor?
A: Dig once on a floor tile to create a downward slope; then dig once more either above or on the slope.  Do not dig in the pit if there is an upward slope directly below the tile, or a worker might remove the floor of the pit.

Q: Build a passage to the next level down?
A: Dig once on a floor tile.

Q: Create a tunnel (with floor and ceiling intact) from a wall tile?
A: Dig once in the wall tile.  Make sure there is not an upward slope directly below the tile, or a worker might remove the floor of the tunnel.

Q: Dig a hole in the ceiling from below?
A: Build once on the floor directly below to create an upward slope.  Then dig once in the wall tile above.

Q: Dig a hole in the ceiling from above?
A: Same as digging a shallow pit.

*/
