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
    }
  });
  HTomb.Entity.define({

  });

  return HTomb;
})(HTomb);
