HTomb = (function(HTomb) {
  "use strict";

  var b = HTomb.Behavior;

  HTomb.Entity.define({
    template: "Rock",
    name: "rock",
    isItem: true,
    symbol: "*",
    behaviors: [b.Stackable()]
  });

  return HTomb;
})(HTomb);
