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
    each: ["assigner","assignee","zone"],
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
      this.buildConstruction(x,y,z);
    }
    buildConstruction: function(x,y,z) {
      //this will be unique to the task

    },
  });

  HTomb.Tasks.define({
    template: "DigTask",
    name: "dig",
    zoneTemplate: {
      template: "DigZone",
      name: "dig",
      bg: "#553300"
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
    }
    designate: function(master) {
      this.designateSquares({master: master});
    },
    /*
      Anything we can generalize from here?
      - The "seeker" AI could be standardized.
      - The "build a construction" proc could be standardized.
      - The "finish" a construction" proc could be standardized.
    */
    buildConstruction: function(x,y,z) {
      var crd = coord(x,y,z);
      var feature = HTomb.World.features[crd];
      if (feature) {
        // If there is an incomplete pit, work on completing it
        if (feature.template==="IncompletePit") {
          feature.construction.stepsLeft-=1;
          if (feature.construction.stepsLeft<=0) {
            // If the pit is completed, remove the incomplete pit
            feature.remove();
            // If the pit was dug in the ground...
            if (HTomb.World.levels[z].grid[x][y]===HTomb.Tiles.FLOORTILE) {
              // ...then place a pit and drop one level...
              //HTomb.Entity.create("Pit").place(x,y,z);
              z-=1;
}
            // ...otherwise just empty out the current square
            HTomb.Tiles.emptySquare(x,y,z);
            // Explore the bottom of the pit
            HTomb.Tiles.explore(x,y,z);
            // Clean up the DigZone if there was one...bad place to do this
            var zone = HTomb.World.zones[coord];
            if (zone && zone.template==="DigZone") {
              zone.remove();
            }
          }
        } else {
          // Clear out an existing feature to make room for digging
          console.log(this.entity.describe() + " removes " + feature.describe() + " to make room for digging.");
          feature.remove();
        }
      } else {
        // Begin digging by creating an incomplete pit
        HTomb.Entity.create("IncompletePit").place(x,y,z);
      }
      // Spend action

    }
  });

  ///////All these shall change
  HTomb.Tasks.define({
    template: "BuildTask",
    name: "build",
    // I don't like reusing this name
    zone: {
      template: "BuildZone",
      name: "build",
      isZone: true,
      bg: "#444444"
    },
    tryAssign: function(cr) {
      var zone = this.zone;
      // run the path backwards for faster failure
      var path = HTomb.Path.aStar(zone._x,zone._y,zone._z,cr._x,cr._y,cr._z);
      if (path!==false) {
        this.assignTo(cr);
        return true;
      }
      return false;
    },
    designate: function(master) {
      if (master.entity===HTomb.Player) {
        var buildSquares = function(squares) {
          for (var i=0; i<squares.length; i++) {
            var coord = squares[i];
            if (HTomb.World.levels[coord[2]].grid[coord[0]][coord[1]]!==HTomb.Tiles.FLOORTILE) {
              continue;
            }
            var z = HTomb.Entity.create("BuildZone");
            z.place(coord[0],coord[1],coord[2]);
            var t = HTomb.Tasks.BuildTask();
            z.task = t;
            t.zone = z;
            t.master = master;
            Tasks.taskList.push(t);
          }
        };
        HTomb.GUI.selectSquareZone(HTomb.Player._z,buildSquares,{outline: true, bg: this.zone.bg});
      }
    },
    ai: function() {
      var cr = this.assignedTo;
      if (cr.movement) {
        var zone = this.zone;
        var x = zone._x;
        var y = zone._y;
        var z = zone._z;
        var dist = HTomb.Path.distance(cr._x,cr._y,x,y);
        if (dist>1 || cr._z!==z) {
          cr.movement.walkToward(x,y,z);
        } else if (dist===0) {
          cr.movement.walkRandom();
        } else if (dist===1) {
          console.log(cr.describe() + " builds.");
          cr.worker.build(x,y,z);
        }
      }
    }
  });
  HTomb.Tasks.define({
    template: "Undesignate",
    name: "undesignate",
    designate: function(master) {
      if (master.entity===HTomb.Player) {
        var deleteZones = function(squares) {
          for (var i=0; i<squares.length; i++) {
            var coord = squares[i];
            var z = HTomb.World.zones[coord[0]*LEVELW*LEVELH+coord[1]*LEVELH+coord[2]];
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
      isZone: true,
      bg: "#880000"
    },
    designate: function(master) {
      if (master.entity===HTomb.Player) {
        var _z = HTomb.Player._z;
        var createZone = function(x,y,z) {
          var zone = HTomb.Entity.create("PatrolZone");
          zone.place(x,y,z);
          var t = HTomb.Tasks.PatrolTask();
          zone.task = t;
          t.zone = zone;
          t.master = master;
          Tasks.taskList.push(t);
          HTomb.GUI.reset();
        };
        HTomb.GUI.selectSquare(_z,createZone);
      }
    },
    ai: function() {
      var cr = this.assignedTo;
      cr.ai.patrol(this.zone._x,this.zone._y,this.zone._z);
    },
    tryAssign: function(cr) {
      var zone = this.zone;
      // run the path backwards for faster failure
      var path = HTomb.Path.aStar(zone._x,zone._y,zone._z,cr._x,cr._y,cr._z);
      if (path!==false) {
        this.assignTo(cr);
        return true;
      }
      return false;
    },
  });


  return HTomb;
})(HTomb);

/*
some thoughts...
..."okayTiles" could be a property of the template, not the arguments

*/
