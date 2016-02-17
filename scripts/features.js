// Features are large, typically immobile objects
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.coord;

  HTomb.Things.defineEntity({
    template: "Tombstone",
    name: "tombstone",
    isFeature: true,
    symbol: "\u271F",
    fg: "#AAAAAA",
    randomColor: 5,
    onPlace: function(x,y,z) {
      // Bury a corpse beneath the tombstone
      HTomb.Things.create("Corpse").place(x,y,z-1);
    }
  });

  HTomb.Things.defineEntity({
    template: "Tree",
    name: "tree",
    isFeature: true,
    //symbol: "\u2663",
    symbol: ["\u2663","\u2660"],
    fg: "#559900",
    randomColor: 20
  });

  HTomb.Things.defineEntity({
    template: "Shrub",
    name: "shrub",
    isFeature: true,
    symbol: "\u262B",
    fg: "#779922",
    randomColor: 20
  });

  HTomb.Things.defineEntity({
    template: "Puddle",
    name: "puddle",
    isFeature: true,
    symbol: "~",
    fg: "#0088DD",
    randomColor: 20
  });

  HTomb.Things.defineEntity({
    template: "IncompletePit",
    name: "pit (under contruction)",
    isFeature: true,
    symbol: "\u2022",
    behaviors: []
  });

  HTomb.Things.defineEntity({
    template: "IncompleteWall",
    name: "wall (under contruction)",
    isFeature: true,
    symbol: "\u25AB",
    behaviors: []
  });

  return HTomb;
})(HTomb);
