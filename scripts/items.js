HTomb = (function(HTomb) {
  "use strict";

  HTomb.Things.defineItem({
    template: "Rock",
    name: "rock",
    symbol: "\u2022",
    fg: "#CCCCCC",
    behaviors: {Stackable: {n: 10}},
    onPlace: function() {
      var r = parseInt(Math.random()*5);
      this.stack.n = r;
    },
    randomColor: 10
  });

  HTomb.Things.defineItem({
    template: "FlintStone",
    name: "flint stone",
    symbol: "\u2022",
    fg: "#CCCCCC",
    behaviors: {Stackable: {n: 10}},
    onPlace: function() {
      this.stack.n = 1;
    },
    randomColor: 10
  });

  HTomb.Things.defineItem({
    template: "Corpse",
    name: "corpse",
    symbol: "%",
    //symbol: "\u2620",
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
    symbol: "\u2234",
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
    symbol: "\u2234",
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
    symbol: "\u2234",
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
    symbol: "\u2234",
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
    symbol: "\u2234",
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
