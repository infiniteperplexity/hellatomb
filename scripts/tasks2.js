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
        // this is hacky and needs to change
      } else if (HTomb.Tiles.isTouchableFrom(zone.x,zone.y,zone.z,cr.x,cr.y,cr.z)) {
        return true;
      } else {
        return false;
      }
    },
    canDesignateTile: function(x,y,z) {
      return true;
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
        if (taskList.indexOf(this)!==-1) {
          taskList.splice(taskList.indexOf(this),1);
        }
      }
      if (this.assignee) {
        this.assignee.minion.unassign();
      }
      if (this.zone) {
        //prevent recursion traps
        var z = this.zone;
        this.zone = null;
        z.remove();
      }
    },
    complete: function() {
      var master = this.assigner;
      if (master) {
        var taskList = this.assigner.master.taskList;
        if (taskList.indexOf(this)!==-1) {
          taskList.splice(taskList.indexOf(this),1);
        }
      }
      if (this.assignee) {
        this.assignee.minion.unassign();
      }
      if (this.zone) {
        this.zone.remove();
        //this.zone = null;
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
      } else if (HTomb.World.explored[z][x][y]!==true) {
        var dzone = HTomb.Things.DummyZone({name: this.zoneTemplate.name, bg: this.zoneTemplate.bg});
        dzone.place(x,y,z);
        var dt = HTomb.Things.DummyTask({fakeAs: this.template, name: this.name});
        dzone.task = dt;
        dt.zone = dzone;
        dt.assigner = master;
        dt.assigner.master.taskList.push(dt);
      }
      return zone || dzone;
    },
    // note that this passes the behavior, not the entity
    designate: function(master) {
      this.designateSquares({master: master});
    },
    // one common way of designating tasks
    designateSquare: function(options) {
      options = options || {};
      var master = options.master || HTomb.Player;
      var z = master.entity.z;
      var that = this;
      function createZone(x,y,z) {
        that.placeZone(x,y,z);
      }
      HTomb.GUI.selectSquare(z,createZone);
    },
    // one common way of designating tasks
    designateSquares: function(options) {
      options = options || {};
      var master = options.master || HTomb.Player.master;
      options.outline = options.outline || false;
      var that = this;
      var taskSquares = function(squares) {
        for (var i=0; i<squares.length; i++) {
          var crd = squares[i];
          that.placeZone(crd[0],crd[1],crd[2]);
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
        if (HTomb.Tiles.isTouchableFrom(x,y,z,cr.x,cr.y,cr.z)) {
          this.work(x,y,z);
        } else if (dist>1 || cr.z!==z) {
          cr.movement.walkToward(x,y,z);
        } else if (dist===0) {
          cr.movement.walkRandom();
        } else if (dist<=1) {

        }
      }
      cr.ai.acted = true;
    },
    work: function(x,y,z) {
      if (HTomb.World.turfs[coord(x,y,z)]) {
        (HTomb.World.turfs[coord(x,y,z)]).remove();
      }
      var f = HTomb.World.features[coord(x,y,z)];
      if (f===this.feature) {
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
      alert("don't use this!");
    }
  });




  HTomb.Things.defineTask({
    template: "UnearthingSigil",
    name: "unearthing sigil",
    zoneTemplate: {
      template: "DigZone",
      name: "dig",
      bg: "#553300"
    },
    featureTemplate: {
      name: "incomplete excavation",
      //symbol: "\u2022",
      symbol: "\u2717",
      steps: 5,
      fg: HTomb.Constants.BELOW
    },
    canDesignateTile: function(x,y,z) {
      var t = HTomb.World.tiles[z][x][y];
      var tb = HTomb.World.tiles[z-1][x][y];
      if (t===HTomb.Tiles.VoidTile) {
        return false;
      } else if (t===HTomb.Tiles.FloorTile && tb===HTomb.Tiles.VoidTile) {
        return false;
      } else if (t===HTomb.Tiles.EmptyTile && (tb===HTomb.Tiles.EmptyTile || tb===HTomb.Tiles.FloorTile)) {
        return false;
      }
      return true;
    },
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
      if (tiles[z-1][x][y]===UpSlopeTile && HTomb.World.explored[z-1][x][y] && (t===WallTile || t===FloorTile)) {
        tiles[z][x][y] = DownSlopeTile;
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
      } else if (t===EmptyTile) {
        tiles[z-1][x][y] = FloorTile;
      }
      c.remove();
      HTomb.World.validate();
    },
    placeZone: function(x,y,z, master) {
      master = master || HTomb.Player;
      // raise a zombie if we can
      if (this.canDesignateTile(x,y,z) && HTomb.World.explored[z][x][y]) {
        var items = HTomb.World.items[coord(x,y,z-1)] || [];
        for (var i=0; i<items.length; i++) {
          if (items[i].template==="Corpse") {
            items[i].remove();
            if (HTomb.World.tiles[z-1][x][y]===HTomb.Tiles.WallTile) {
              HTomb.World.tiles[z-1][x][y]=HTomb.Tiles.UpSlopeTile;
            }
            var zombie = HTomb.Things.Zombie();
            zombie.place(x,y,z-1);
            HTomb.Things.Minion().addToEntity(zombie);
            zombie.minion.setMaster(master);
            master.master.addMinion(zombie);
            zombie.ai.acted = true;
            var zn = HTomb.Things.templates.Task.placeZone.call(this,x,y,z,master);
            zn.task.tryAssign(zombie);
            return;
          }
        }
      }
      // otherwise just place a zone
      HTomb.Things.templates.Task.placeZone.call(this,x,y,z,master);
    }
  });

  HTomb.Things.defineTask({
    template: "EarthenSigil",
    name: "earthen sigil",
    zoneTemplate: {
      template: "BuildZone",
      name: "build",
      bg: "#444444"
    },
    featureTemplate: {
      name: "incomplete construction",
      //symbol: "\u25AB",
      symbol: "\u2692",
      fg: HTomb.Constants.ABOVE,
      steps: 5
    },
    canDesignateTile: function(x,y,z) {
      //shouldn't be able to build surrounded by emptiness
      var t = HTomb.World.tiles[z][x][y];
      if (t===HTomb.Tiles.VoidTile || t===HTomb.Tiles.WallTile) {
        return false;
      } else {
        return true;
      }
    },
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
    } else if (t===UpSlopeTile) {
        tiles[z][x][y] = WallTile;
        if (tiles[z+1][x][y] === DownSlopeTile) {
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
    template: "RevokingSigil",
    name: "revoking sigil",
    allowedTiles: "all",
    designate: function(master) {
      if (master.entity===HTomb.Player) {
        var deleteZones = function(squares) {
          for (var i=0; i<squares.length; i++) {
            var crd = squares[i];
            var z = HTomb.World.zones[coord(crd[0], crd[1], crd[2])];
            if (z && z.task) {
              z.task.cancel();
            }
          }
        };
        HTomb.GUI.selectSquareZone(HTomb.Player.z,deleteZones,{outline: false});
      }
    }
  });

  HTomb.Things.defineTask({
    template: "WardingSigil",
    name: "warding sigil",
    zoneTemplate: {
      template: "PatrolZone",
      name: "patrol",
      bg: "#880000"
    },
    canDesignateTile: function() {
      return true;
    },
    designate: function(master) {
      this.designateSquare({master: master});
    },
    ai: function() {
      var cr = this.assignee;
      cr.ai.patrol(this.zone.x,this.zone.y,this.zone.z);
    }
  });

  HTomb.Things.defineTask({
    template: "HoardingSigil",
    name: "hoarding sigil",
    zoneTemplate: {
      template: "HoardZone",
      name: "hoard",
      bg: "#880000"
    },
    canDesignateTile: function(x,y,z) {
      if (HTomb.World.tiles(x,y,z)===HTomb.Tiles.FloorTile) {
        return true;
      } else {
        return false;
      }
    },
    designate: function(master) {
      this.designateSquares({master: master});
    },
    ai: function() {
      //var cr = this.assignee;
      //cr.ai.patrol(this.zone.x,this.zone.y,this.zone.z);
    }
  });
  HTomb.Things.defineTask({
    template: "ForbiddenSigil",
    name: "forbidden sigil",
    zoneTemplate: {
      template: "ForbiddenZone",
      name: "forbidden",
      bg: "#880000"
    },
    canDesignateTile: function(x,y,z) {
      return true;
    },
    designate: function(master) {
      this.designateSquares({master: master});
    },
    ai: function() {
      //var cr = this.assignee;
      //cr.ai.patrol(this.zone.x,this.zone.y,this.zone.z);
    }
  });
  HTomb.Things.defineTask({
    template: "MurderousSigil",
    name: "murderous sigil",
    zoneTemplate: {
      template: "MurderZone",
      name: "murder",
      bg: "#880000"
    },
    canDesignateTile: function(x,y,z) {
      return true;
    },
    designate: function(master) {
      this.designateSquare({master: master});
    },
    ai: function() {
      //var cr = this.assignee;
      //cr.ai.patrol(this.zone.x,this.zone.y,this.zone.z);
    }
  });
  HTomb.Things.defineTask({
    template: "HarvestingSigil",
    name: "harvesting sigil",
    zoneTemplate: {
      template: "MurderZone",
      name: "murder",
      bg: "#880000"
    },
    canDesignateTile: function(x,y,z) {
      return true;
    },
    designate: function(master) {
      this.designateSquares({master: master});
    },
    ai: function() {
      //var cr = this.assignee;
      //cr.ai.patrol(this.zone.x,this.zone.y,this.zone.z);
    }
  });
  HTomb.Things.defineTask({
    template: "DismantlingSigil",
    name: "dismantling sigil",
    zoneTemplate: {
      template: "DismantleZone",
      name: "dismantle",
      bg: "#880000"
    },
    canDesignateTile: function(x,y,z) {
      if (HTomb.World.features[coord(x,y,z)]) {
        return true;
      } else {
        return false;
      }
    },
    designate: function(master) {
      this.designateSquare({master: master});
    },
    ai: function() {
      //var cr = this.assignee;
      //cr.ai.patrol(this.zone.x,this.zone.y,this.zone.z);
    }
  });

  HTomb.Things.defineTask({
    template: "CraftingSigil",
    name: "crafting sigil",
    zoneTemplate: {
      template: "BuildDoorZone",
      name: "build",
      bg: "#553300"
    },
    featureTemplate: {
      name: "incomplete ",
      symbol: "\u25AB",
      steps: 10,
      fg: "#BB9922"
    },
    features: ["Door"],
    finish: function() {
      var c = this.feature;
      var x = c.x;
      var y = c.y;
      var z = c.z;
      c.remove();
      this.zone.feature.place(x,y,z);
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
      if (square.terrain===HTomb.Tiles.FloorTile && HTomb.World.features[coord(x,y,z)]===undefined) {
        return true;
      } else {
        return false;
      }
    },
    // note that this passes the behavior, not the entity
    designate: function(master) {
      HTomb.GUI.choosingMenu("Choose a feature:", this.features,
      function(feature) {
          return function() {
            this.designateSquare({master: master, feature: feature});
          }
        }
      );
    },
    designateSquare: function(options) {
      HTomb.Things.templates.Task.designateSquare.call(this,options);
      this.zone.feature = HTomb.Things[options.feature]();
      this.feature.name = this.feature.name + options.feature.name;
    }
  });


  HTomb.Things.defineTask({
    template: "DummyTask",
    fakeTemplate: null,
    zoneTemplate: {
      template: "DummyZone"
    },
    tryAssign: function(cr) {
      var zone = this.zone;
      if (HTomb.World.explored[zone.z][zone.x][zone.y]) {
        HTomb.GUI.pushMessage("Designation invalid");
        this.cancel();
        return false;
      } else if (this.canReachZone(cr)) {
        this.assignTo(cr);
        return true;
      } else {
        return false;
      }
    },
    canDesignateTile: function(x,y,z) {
      return true;
    },
    work: function(x,y,z) {
      HTomb.World.explored[z][x][y] = true;
      HTomb.GUI.pushMessage("Designation invalid");
      this.cancel();
    }
  });

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
