HTomb = (function(HTomb) {
  "use strict";

  var b = HTomb.Behavior;

  HTomb.Entity.define({
    template: "Rock",
    name: "rock",
    isItem: true,
    symbol: "*",
    fg: "#CCCCCC",
    behaviors: [b.Stackable()]
  });

  HTomb.Entity.define({
    template: "Corpse",
    name: "corpse",
    isItem: true,
    symbol: "%",
    fg: "brown"
  });

  return HTomb;
})(HTomb);
