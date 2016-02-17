HTomb = (function(HTomb) {
  "use strict";

  HTomb.Things.defineEntity({
    template: "Rock",
    name: "rock",
    isItem: true,
    symbol: "*",
    fg: "#CCCCCC",
    behaviors: {Stackable: {n: 10}},
    onPlace: function() {
      var r = parseInt(Math.random()*5);
      this.stack.n = r;
    },
    randomColor: 10
  });

  HTomb.Things.defineEntity({
    template: "Corpse",
    name: "corpse",
    isItem: true,
    symbol: "%",
    fg: "brown",
    randomColor: 10
  });

  HTomb.Things.defineEntity({
    template: "Stick",
    name: "stick",
    isItem: true,
    symbol: "-",
    fg: "brown",
    randomColor: 20
  });

  return HTomb;
})(HTomb);
