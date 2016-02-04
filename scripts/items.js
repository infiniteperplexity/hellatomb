HTomb = (function(HTomb) {
  "use strict";

  var b = HTomb.Behavior;

  HTomb.Entity.define({
    template: "Rock",
    name: "rock",
    isItem: true,
    symbol: "*",
    fg: "#CCCCCC",
    behaviors: [b.Stackable()],
    onPlace: function() {
      var r = parseInt(Math.random()*5);
      this.stack.n = r;
    },
    randomColor: 10
  });

  HTomb.Entity.define({
    template: "Corpse",
    name: "corpse",
    isItem: true,
    symbol: "%",
    fg: "brown",
    randomColor: 10
  });

  HTomb.Entity.define({
    template: "Stick",
    name: "stick",
    isItem: true,
    symbol: "-",
    fg: "brown",
    randomColor: 10
  });

  return HTomb;
})(HTomb);
