HTomb = (function(HTomb) {
  "use strict";

//  var b = HTomb.Behavior;

  var Tasks = HTomb.Tasks;
  var Entity = HTomb.Entity;

  Tasks.templates = {};

  var task = {
      describe: function() {return this.name;}
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
      console.log("trying to designate");
      if (this.entity===HTomb.Player) {
        var digSquares = function(squares) {
          for (var i=0; i<squares.length; i++) {
            var coord = squares[i];
            //HTomb.World.zones[coord[0]*LEVELW*LEVELH+coord[1]*LEVELH+coord[2]] = HTomb.Tasks.createZone(this);
          }
          HTomb.GUI.pushMessage("You tried to designate " + squares.length + " squares for digging but that's not yet implemented.");
        };
        HTomb.GUI.selectSquareZone(HTomb.Player._z,digSquares,{outline: false});
      }
    }
  });

  return HTomb;
})(HTomb);
