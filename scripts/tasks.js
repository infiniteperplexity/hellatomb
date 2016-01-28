HTomb = (function(HTomb) {
  "use strict";

//  var b = HTomb.Behavior;

  var Tasks = HTomb.Tasks;
  var Entity = HTomb.Entity;

  HTomb.Tasks.define = function() {};
  HTomb.Tasks.define({
    template: "DigTask",
    name: "dig",
    zone: {
      template: "DigZone",
      name: "dig",
      isZone: true,
      bg: "brown"
    },
    control: function() {
      var digSquares = function(squares) {
        for (var i=0; i<squares.length; i++) {
          var coord = squares[i];
          HTomb.World.zones[coord[0]*LEVELW*LEVELH+coord[1]*LEVELH+coord[2]] = HTomb.Tasks.createZone(this);
        }
      };
      HTomb.GUI.selectSquareZone(HTomb.Player._z,digSquares,{outline: false});
    }
  });

  return HTomb;
})(HTomb);
