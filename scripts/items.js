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


  HTomb.Things.defineItem({
    template: "Bloodstone",
    name: "bloodstone",
    symbol: "*",
    fg: "red",
    behaviors: {Stackable: {n: 10}},
    onPlace: function() {
      var r = parseInt(Math.random()*5);
      this.stack.n = r;
    },
    randomColor: 10
  });

  HTomb.Things.defineItem({
    template: "IronOre",
    name: "iron ore",
    symbol: "*",
    fg: "gray",
    behaviors: {Stackable: {n: 10}},
    onPlace: function() {
      var r = parseInt(Math.random()*5);
      this.stack.n = r;
    },
    randomColor: 10
  });

  HTomb.Things.defineItem({
    template: "GoldOre",
    name: "gold ore",
    symbol: "*",
    fg: "yellow",
    behaviors: {Stackable: {n: 10}},
    onPlace: function() {
      var r = parseInt(Math.random()*5);
      this.stack.n = r;
    },
    randomColor: 10
  });

  HTomb.Things.defineItem({
    template: "Moonstone",
    name: "moonstone",
    symbol: "*",
    fg: "cyan",
    behaviors: {Stackable: {n: 10}},
    onPlace: function() {
      var r = parseInt(Math.random()*5);
      this.stack.n = r;
    },
    randomColor: 10
  });

  HTomb.Things.defineItem({
    template: "Jade",
    name: "jade",
    symbol: "*",
    fg: "green",
    behaviors: {Stackable: {n: 10}},
    onPlace: function() {
      var r = parseInt(Math.random()*5);
      this.stack.n = r;
    },
    randomColor: 10
  });



  return HTomb;
})(HTomb);
