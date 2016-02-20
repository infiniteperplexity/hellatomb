HTomb = (function(HTomb) {
  "use strict";

  HTomb.Things.defineItem({
    template: "Rock",
    name: "rock",
    symbol: "*",
    fg: "#CCCCCC",
    behaviors: {Stackable: {n: 10}},
    onPlace: function() {
      var r = parseInt(Math.random()*5);
      this.stack.n = r;
    },
    randomColor: 10
  });

  HTomb.Things.defineItem({
    template: "Corpse",
    name: "corpse",
    symbol: "%",
    fg: "brown",
    randomColor: 10
  });

  HTomb.Things.defineItem({
    template: "Stick",
    name: "stick",
    symbol: "-",
    fg: "brown",
    randomColor: 20
  });

  return HTomb;
})(HTomb);
