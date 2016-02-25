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
    //symbol: "\u2A4D",
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
    symbol: "\u2698",
    fg: "#779922",
    randomColor: 20
  });

  HTomb.Things.defineFeature({
    template: "Seaweed",
    name: "seaweed",
    symbol: ["\u2648","\u2724","\u060F"],
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
    locked: false,
    symbol: "\u25A5",
    fg: "#BB9922",
    each: ["locked","name","passable","symbol"],
    activate: function() {
      if (this.locked) {
        HTomb.GUI.pushMessage("Unlocked " + this.describe()+".");
        this.locked = false;
        this.solid = false;
        this.name = "door";
        this.symbol = "\u25A5";
      } else {
        HTomb.GUI.pushMessage("Locked " + this.describe()+".");
        this.locked = true;
        this.solid = true;
        this.name = "locked door";
        this.symbol = "\u26BF";
      }
      HTomb.GUI.reset();
    },
    solid: false,
    opaque: true
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
