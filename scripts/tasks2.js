HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;

  // Define a generic task that gets workers assigned
  HTomb.Things.define({
    template: "Task",
    name: "task",
    parent: "Thing",
    assigner: null,
    assignee: null,
    zone: null,
    zoneTemplate: null,
    construct: null,
    each: ["assigner","assignee","zone","construct"],
    onDefine: function() {
      if (this.zoneTemplate) {
        var z = this.zoneTemplate;
        z.isZone = true;
        // is this how we define an entity?
        HTomb.Things.define(z);
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
      var path = HTomb.Path.aStar(zone.x,zone.y,zone.z,cr.x,cr.y,cr.z);
      if (path!==false) {
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
      var cr = this.assignedTo;
      if (cr.minion===undefined) {
        HTomb.Debug.pushMessage("Problem unassigning task");
      } else {
        this.assignedTo = null;
        cr.minion.unassign();
      }
    },
    placeZone: function(x,y,z) {
      if (this.canDesignateTile(x,y,z)) {
        var zone = HTomb.Things.create(this.zoneTemplate.template);
        zone.place(x,y,z);
        var t = HTomb.Things[this.template]();
        zone.task = t;
        t.zone = zone;
        t.master = this.assigner;
        this.assigner.master.taskList.push(t);
      }
    }
    // one common way of designating tasks
    designateSquare: function(options) {
      options = options || {};
      this.assigner = options.master || HTomb.Player;
      var z = this.assigner.z;
      HTomb.GUI.selectSquare(z,this.placeZone);
      HTomb.GUI.reset();
    },
    // one common way of designating tasks
    designateSquares: function(options) {
      options = options || {};
      this.assigner = options.master || HTomb.Player;
      options.outline = options.outline || false;
      var taskSquares = function(squares) {
        for (var i=0; i<squares.length; i++) {
          var crd = squares[i];
          this.placeZone(crd[0],crd[1],crd[2]);
        }
        HTomb.GUI.reset();
      };
      HTomb.GUI.selectSquareZone(this.assigner.z,taskSquares,{outline: options.outline, bg: this.zoneTemplate.bg});
    },
    ai: function() {
      this.seekZoneAI();
    },
    // A common AI pattern for Tasks
    seekZoneAI: function() {
      var cr = this.assignedTo;
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
      this.entity.ai.acted = true;
    },
    work: function(x,y,z) {
      this.buildConstruction();
      //spend action points
    },
    buildConstruction: function() {
      var x = this.zone.x;
      var y = this.zone.y;
      var z = this.zone.z;
      var f = HTomb.World.features[coord(x,y,z)];
      if (f && f.template==="Construction" && f.target===this.construct {
        f.doWork();
        return f;
      } else {
        var construct = HTomb.Things.Construction({target: HTomb.Things[this.construct]()});
        if (f) {
          console.log("removed a feature to make room for " + construct.describe());
          f.remove();
        }
        construct.place(x,y,z);
        return construct;
      }
    }
  });

  HTomb.Tasks.define({
    template: "DigTask",
    name: "dig",
    zoneTemplate: {
      template: "DigZone",
      name: "dig",
      bg: "#553300"
    },
    construct: "Excavation",
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
    }
    designate: function(master) {
      this.designateSquares({master: master});
    },
    work: function() {
      var construct = this.buildConstruction();
      // should test whether it's complete or not?
      if (HTomb.World.tiles[z][x][y].solid) {
        construct.placement = [0,0,0];
      } else {
        construct.placement = [0,0,-1];
      }
    }
  });

  HTomb.Tasks.define({
    template: "BuildTask",
    name: "build",
    zoneTemplate: {
      template: "BuildZone",
      name: "build",
      bg: "#444444"
    },
    construct: "WallTile",
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
    }
    designate: function(master) {
      this.designateSquares({master: master, outline: true});
    },
    work: function() {
      var construct = this.buildConstruction();
    }
  });

  HTomb.Tasks.define({
    template: "Undesignate",
    name: "undesignate",
    designate: function(master) {
      if (master.entity===HTomb.Player) {
        var deleteZones = function(squares) {
          for (var i=0; i<squares.length; i++) {
            var crd = squares[i];
            var z = HTomb.World.zones[coord(crd[0], crd[1], crd[2]);
            if (z) {
              z.remove();
            }
          }
        };
        HTomb.GUI.selectSquareZone(HTomb.Player._z,deleteZones,{outline: false});
      }
    }
  });

  HTomb.Tasks.define({
    template: "PatrolTask",
    name: "patrol",
    zone: {
      template: "PatrolZone",
      name: "patrol",
      bg: "#880000"
    },
    designate: function(master) {
      this.designateSquare({master: master});
    },
    ai: function() {
      var cr = this.assignedTo;
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


  return HTomb;
})(HTomb);

/*
some thoughts...
..."okayTiles" could be a property of the template, not the arguments

*/
