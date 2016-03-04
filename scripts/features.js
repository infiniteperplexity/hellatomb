// Features are large, typically immobile objects
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.coord;

  HTomb.Things.defineFeature({
    template: "Tombstone",
    name: "tombstone",
    symbol: ["\u271D", "\u271E","\u271F","\u2670","\u2671"],
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
    fg: "#77BB00",
    randomColor: 15
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
    plural: true,
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
    template: "Throne",
    name: "throne",
    //symbol: "\u2655",
    symbol: "\u265B",
    fg: "#CCAA00"
  });

  HTomb.Things.defineFeature({
    template: "ScryingGlass",
    name: "scrying glass",
    symbol: "\u25CB",
    fg: "cyan"
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
        HTomb.GUI.sensoryEvent("Unlocked " + this.describe()+".",this.x, this.y, this.z);
        this.locked = false;
        this.solid = false;
        this.name = "door";
        this.symbol = "\u25A5";
      } else {
        HTomb.GUI.sensoryEvent("Locked " + this.describe()+".",this.x,this.y,this.z);
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

  HTomb.Things.defineTurf({
    template: "Water",
    name: "water",
    symbol: "~",
    flowSymbol: "\u2248",
    fg: HTomb.Constants.WATERFG || "#3388FF",
    bg: HTomb.Constants.WATERBG || "#1144BB",
    behaviors: {Liquid: {}}
  });
  HTomb.Things.defineTurf({
    template: "Lava",
    name: "lava",
    symbol: "~",
    flowSymbol: "\u2248",
    fg: "#FF8833",
    bg: "#DD4411",
    behaviors: {Liquid: {}}
  });

  HTomb.Things.defineTurf({
    template: "Grass",
    name: "grass",
    symbol: '"',
    fg: HTomb.Constants.GRASSFG ||"#668844",
    bg: HTomb.Constants.GRASSBG || "#334422"
  });

  HTomb.Things.defineTurf({
    template: "Soil",
    name: "soil",
    symbol: '"',
    fg: HTomb.Constants.GRASSFG ||"#886644",
    bg: HTomb.Constants.GRASSBG || "#443322"
  });

  return HTomb;
})(HTomb);
