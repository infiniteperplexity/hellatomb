HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
//  var b = HTomb.Behavior;

  var Tasks = HTomb.Tasks;
  var Entity = HTomb.Entity;

  Tasks.templates = {};
  Tasks.zones = {};

  var task = {
      describe: function() {return this.name;},
  };

  HTomb.Tasks.createZone = function(zn,x,y,z) {
    var zone = {};
    for (var p in zn) {
      zone[p] = zn[p];
    }
    zone.master = this.entity;
    zone.x = x;
    zone.y = y;
    zone.z = z;
    return zone;
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
        Tasks.zones[tsk.zone.name] = tsk.zone;
      }
      return tsk;
    };
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
    designate: function() {
      if (this.entity===HTomb.Player) {
        var digSquares = function(squares) {
          for (var i=0; i<squares.length; i++) {
            var coord = squares[i];
            HTomb.World.zones[coord[0]*LEVELW*LEVELH+coord[1]*LEVELH+coord[2]] = HTomb.Tasks.createZone(Tasks.zones.dig,coord[0],coord[1],coord[2]);
          }
        };
        HTomb.GUI.selectSquareZone(HTomb.Player._z,digSquares,{outline: false});
      }
    }
  });
  HTomb.Tasks.define({
    template: "BuildTask",
    name: "build",
    zone: {
      template: "BuildZone",
      name: "build",
      isZone: true,
      bg: "gray"
    },
    designate: function() {
      if (this.entity===HTomb.Player) {
        var buildSquares = function(squares) {
          for (var i=0; i<squares.length; i++) {
            var coord = squares[i];
            HTomb.World.zones[coord[0]*LEVELW*LEVELH+coord[1]*LEVELH+coord[2]] = HTomb.Tasks.createZone(Tasks.zones.build,coord[0],coord[1],coord[2]);
          }
        };
        HTomb.GUI.selectSquareZone(HTomb.Player._z,buildSquares,{outline: true});
      }
    }
  });
  HTomb.Tasks.define({
    template: "Undesignate",
    name: "undesignate",
    designate: function() {
      if (this.entity===HTomb.Player) {
        var deleteZones = function(squares) {
          for (var i=0; i<squares.length; i++) {
            var coord = squares[i];
            delete HTomb.World.zones[coord[0]*LEVELW*LEVELH+coord[1]*LEVELH+coord[2]];
          }
        };
        HTomb.GUI.selectSquareZone(HTomb.Player._z,deleteZones,{outline: false});
      }
    }
  });

  return HTomb;
})(HTomb);
