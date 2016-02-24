// Features are large, typically immobile objects
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.coord;

  HTomb.Things.defineFeature({
    template: "Tombstone",
    name: "tombstone",
    symbol: "\u271F",
    fg: "#AAAAAA",
    randomColor: 5,
    onPlace: function(x,y,z) {
      // Bury a corpse beneath the tombstone
      HTomb.Things.create("Corpse").place(x,y,z-1);
    }
  });

  HTomb.Things.defineFeature({
    template: "Tree",
    name: "tree",
    //symbol: "\u2663",
    symbol: ["\u2663","\u2660"],
    fg: "#559900",
    randomColor: 20
  });

  HTomb.Things.defineFeature({
    template: "Shrub",
    name: "shrub",
    symbol: "\u262B",
    fg: "#779922",
    randomColor: 20
  });

  HTomb.Things.defineFeature({
    template: "Puddle",
    name: "puddle",
    symbol: "~",
    fg: "#0088DD",
    randomColor: 20
  });

  HTomb.Things.defineFeature({
    template: "Construction",
    name: "construction",
    steps: 10,
    task: null,
    symbol: "X",
    each: ["steps","symbol","fg","task","name"]
  });

  HTomb.Things.defineFeature({
    template: "Door",
    name: "door",
    active: true,
    symbol: "\u25A5",
    fg: "#BB9922",
    each: ["active"],
    activate: function() {
      if (this.active) {
        this.active=false;
        this.passable=true;
        this.symbol="\u25FB";
      } else {
        this.active=true;
        this.passable=false;
        this.symbol="\u25A5"
      }
      HTomb.GUI.reset();
    },
    passable: false
  });

  HTomb.Things.defineLiquid({
    template: "Water",
    name: "water",
    symbol: "~",
    //symbol: "\u2652",
    fg: "#3388FF",
    bg: "#1144BB",
    darkbg: "#002288",
    shimmer: function() {
      var bg = ROT.Color.fromString(this.bg);
      bg = ROT.Color.randomize(bg,[0, 0, this.randombg]);
      bg = ROT.Color.toHex(bg);
      return bg;
    },
    randombg: 25
  });

  return HTomb;
})(HTomb);
