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
        var z = this.zoneTemplate;
        z.isZone = true;
        // is this how we define an entity?
        HTomb.Things.defineEntity(z);
      }
    },
    tryAssign: function(cr) {
      HTomb.Debug.pushMessage("Probably shouldn't use default tryAssign()");
      this.assignTo(cr);
      return true;
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
        taskList.splice(taskList.indexOf(this));
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
        taskList.splice(taskList.indexOf(this),0);
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
        console.log(this.feature);
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
    template: "DigTask",
    name: "dig",
    zoneTemplate: {
      template: "DigZone",
      name: "dig",
      bg: "#553300"
    },
    featureTemplate: {
      name: "incomplete excavation",
      symbol: "\u2022",
      steps: 10,
      fg: HTomb.Constants.BELOW
    },
    finish: function() {
      var c = this.feature;
      var x = c.x;
      var y = c.y;
      var z = c.z;
      c.remove();
      var t = HTomb.World.tiles[z][x][y];
      // If we dug out a wall, build a tunnel
      if (t===HTomb.Tiles.WallTile) {
        if (HTomb.World.tiles[z-1][x][y].solid===true) {
          HTomb.World.tiles[z][x][y] = HTomb.Tiles.FloorTile;
        } else {
          HTomb.World.tiles[z][x][y] = HTomb.Tiles.EmptyTile;
        }
      // If we dug out a floor, build a pit
      } else if (t===HTomb.Tiles.FloorTile) {
        HTomb.World.tiles[z][x][y] = HTomb.Tiles.EmptyTile;
        // If the tile below is already dug out, skip it
        if (HTomb.World.tiles[z-1][x][y].solid===false) {
          null;
        // if two tiles below is solid, place a floor
        } else if (HTomb.World.tiles[z-2][x][y].solid===true) {
          HTomb.World.tiles[z-1][x][y] = HTomb.Tiles.FloorTile;
        // otherwise make it empty
        } else {
          HTomb.World.tiles[z-1][x][y] = HTomb.Tiles.EmptyTile;
        }
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
    canDesignateTile: function(x,y,z) {
      var square = HTomb.Tiles.getSquare(x,y,z);
      if (square.terrain.fallable || square.terrain.immutable) {
        return false;
      } else {
        return true;
      }
    },
    // note that this passes the behavior, not the entity
    designate: function(master) {
      this.designateSquares({master: master});
    }
  });

  HTomb.Things.defineTask({
    template: "BuildTask",
    name: "build wall",
    zoneTemplate: {
      template: "BuildZone",
      name: "build",
      bg: "#444444"
    },
    featureTemplate: {
      name: "incomplete wall",
      symbol: "\u25AB",
      fg: HTomb.Constants.ABOVE,
      steps: 10
    },
    finish: function() {
      var c = this.feature;
      var x = c.x;
      var y = c.y;
      var z = c.z;
      HTomb.World.tiles[z][x][y] = HTomb.Tiles.WallTile;
      c.remove();
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
      if (square.terrain.solid) {
        return false;
      } else {
        return true;
      }
    },
    designate: function(master) {
      this.designateSquares({master: master, outline: true});
    }
  });

  HTomb.Things.defineTask({
    template: "Undesignate",
    name: "undesignate",
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
    canDesignateTile: function(x,y,z) {
      var square = HTomb.Tiles.getSquare(x,y,z);
      if (square.terrain.solid || square.terrain.fallable) {
        return false;
      } else {
        return true;
      }
    },
    designate: function(master) {
      this.designateSquare({master: master});
    },
    ai: function() {
      var cr = this.assignee;
      cr.ai.patrol(this.zone.x,this.zone.y,this.zone.z);
    },
    tryAssign: function(cr) {
      if (this.canReachZone(cr)) {
        this.assignTo(cr);
        return true;
      } else {
        return false;
      }
    }
  });

  HTomb.Things.defineTask({
    template: "MakeSlope",
    name: "dig or build a slope",
    zoneTemplate: {
      template: "SlopeZone",
      name: "slope",
      bg: "#444444"
    },
    terrainTemplate: {

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
      if (square.terrain.solid) {
        return false;
      } else {
        return true;
      }
    },
    canDesignateTile: function(x,y,z) {
      var square = HTomb.Tiles.getSquare(x,y,z);
      if (square.terrain.fallable || square.terrain.immutable) {
        return false;
      } else {
        return true;
      }
    },
    // note that this passes the behavior, not the entity
    designate: function(master) {
      this.designateSquares({master: master});
    }
  });


  return HTomb;
})(HTomb);
