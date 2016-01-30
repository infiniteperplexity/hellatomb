HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
//  var b = HTomb.Behavior;

  var Tasks = HTomb.Tasks;
  var Entity = HTomb.Entity;
  Tasks.templates = {};
  Tasks.taskList = [];

  var task = {
      describe: function() {return this.name;},
      assignedTo: null,
      tryAssign: function(cr) {
        console.log("shouldn't use this default");
        this.assignTo(cr);
        return true;
      },
      assignTo: function(cr) {
        if (cr.minion===undefined) {
          alert("not good!");
        } else {
          this.assignedTo = cr;
          cr.minion.onAssign(this);
        }
      },
      unassign: function() {
        var cr = this.assignedTo;
        if (cr.minion===undefined) {
          alert("not good!");
        } else {
          this.assignedTo = null;
          cr.minion.unassign();
        }
      }
  };
  HTomb.Tasks.define = function(properties) {
    if (!properties || !properties.template) {
      console.log("invalid template definition");
      return;
    }
    Tasks[properties.template] = function() {
      var tsk = Object.create(task);
      for (var p in properties) {
        tsk[p] = properties[p];
      }
      if (tsk.zone) {
        var z = tsk.zone;
        z.isZone = true;
        HTomb.Entity.define(z);
      }
      return tsk;
    };
  };

  Tasks.assignTasks = function() {
    for(var i=0; i<Tasks.taskList.length; i++) {
      var tsk = HTomb.Tasks.taskList[i];
      if (tsk.assignedTo!==null) {
        continue;
      }
      var master = tsk.master;
      var minions = master.minions;
      // maybe should shuffle this only once per turn?
      //minions = minions.randomize(); //this randomization function erases the original
      for (var j=0; j<minions.length; j++) {
        if (minions[j].minion.task!==null) {
          continue;
        }
        var assigned = tsk.tryAssign(minions[j]);
        if (assigned) {
          break;
        }
        //tsk.assignTo(minions[j]);
      }
    }
  };



  HTomb.Tasks.define({
    template: "DigTask",
    name: "dig",
    zone: {
      template: "DigZone",
      name: "dig",
      isZone: true,
      bg: "brown"
    },
    tryAssign: function(cr) {
      var zone = this.zone;
      // run the path backwards for faster failure
      var path = HTomb.Path.aStar(zone._z,zone._y,zone._z,cr._x,cr._y,cr._z);
      if (path!==false) {
        this.assignTo(cr);
        return true;
      }
      return false;
    },
    designate: function(master) {
      var self = this;
      if (master.entity===HTomb.Player) {
        var digSquares = function(squares) {
          for (var i=0; i<squares.length; i++) {
            var coord = squares[i];
            var z = HTomb.Entity.create("DigZone");
            z.task = self;
            self.zone = z;
            z.place(coord[0],coord[1],coord[2]);
          }
          self.master = master;
          Tasks.taskList.push(self);
        };
        HTomb.GUI.selectSquareZone(HTomb.Player._z,digSquares,{outline: false});
      }
    },
    ai: function() {
      var cr = this.assignedTo;
      if (cr.movement) {
        var zone = this.zone;
        var x = zone._x;
        var y = zone._y;
        var z = zone._z;
        // the Z issue is a problem
        var dist = HTomb.Path.distance(cr._x,cr._y,x,y);
        if (dist>1 || cr._z!==z) {
          cr.movement.walkToward(x,y,z);
        } else if (dist===0) {
          cr.movement.walkRandom();
        } else if (dist===1) {
          console.log(cr.describe() + " digs.");
          cr.worker.dig(x,y,z);
        } else {
          //wtf?
          alert(dist);
        }
      }
    }
  });
  HTomb.Tasks.define({
    template: "BuildTask",
    name: "build",
    // I don't like reusing this name
    zone: {
      template: "BuildZone",
      name: "build",
      isZone: true,
      bg: "gray"
    },
    tryAssign: function(cr) {
      var zone = this.zone;
      // run the path backwards for faster failure
      var path = HTomb.Path.aStar(zone._z,zone._y,zone._z,cr._x,cr._y,cr._z);
      if (path!==false) {
        this.assignTo(cr);
        return true;
      }
      return false;
    },
    designate: function(master) {
      var self = this;
      if (master.entity===HTomb.Player) {
        var buildSquares = function(squares) {
          for (var i=0; i<squares.length; i++) {
            var coord = squares[i];
            var z = HTomb.Entity.create("BuildZone");
            z.task = self;
            self.zone = z;
            z.place(coord[0],coord[1],coord[2]);
          }
          self.master = master;
          Tasks.taskList.push(self);
        };
        HTomb.GUI.selectSquareZone(HTomb.Player._z,buildSquares,{outline: true});
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
        } else {
          //wtf?
          alert(dist);
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

  return HTomb;
})(HTomb);
