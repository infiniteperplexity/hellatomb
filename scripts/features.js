// Features are large, typically immobile objects
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;

  var b = HTomb.Behavior;

  // Slopes might get converted into a terrain type
  HTomb.Entity.define({
    template: "UpSlope",
    name: "upward slope",
    isFeature: true,
    portalTo: null,
    symbol: "\u02C4",
    // You can see up this slop
    zView: +1,
    fg: HTomb.Constants.ABOVE,
    randomColor: 10,
    // Upon placing an upward slope, a downward slope is added above
    onPlace: function(x,y,z) {
      HTomb.Entity.create("DownSlope").place(x,y,z+1);
      HTomb.World.levels[z+1].grid[x][y] = HTomb.Tiles.FLOORTILE;
      HTomb.World.portals[x*LEVELW*LEVELH+y*LEVELH+z] = [x,y,z+1];
      // Wait...shouldn't I create a "portalTo"?
    }
  });
  HTomb.Entity.define({
    template: "DownSlope",
    name: "downward slope",
    isFeature: true,
    portalTo: null,
    // You can see down this slope
    zView: -1,
    symbol: "\u02C5",
    fg: HTomb.Constants.BELOW,
    randomColor: 10,
    onPlace: function(x,y,z) {
      HTomb.World.portals[x*LEVELW*LEVELH+y*LEVELH+z] = [x,y,z-1];
      // Wait...shouldn't I create a "portalTo"?
    }
  });
  HTomb.Entity.define({
    template: "Pit",
    name: "pit",
    isFeature: true,
    // You can see down into the pit
    zView: -1,
    symbol: "\u25CB",
    fg: HTomb.Constants.BELOW
  });
  HTomb.Entity.define({
    template: "Tombstone",
    name: "tombstone",
    isFeature: true,
    symbol: "\u271F",
    fg: "#AAAAAA",
    randomColor: 5,
    onPlace: function(x,y,z) {
      // Bury a corpse beneath the tombstone
      HTomb.Entity.create("Corpse").place(x,y,z-1);
    }
  });

  HTomb.Entity.define({
    template: "Tree",
    name: "tree",
    isFeature: true,
    //symbol: "\u2663",
    symbol: ["\u2663","\u2660"],
    fg: "#559900",
    randomColor: 20
  });

  HTomb.Entity.define({
    template: "Shrub",
    name: "shrub",
    isFeature: true,
    symbol: "\u262B",
    fg: "#779922",
    randomColor: 20
  });

  HTomb.Entity.define({
    template: "Puddle",
    name: "puddle",
    isFeature: true,
    symbol: "~",
    fg: "#0088DD",
    randomColor: 20
  });

  HTomb.Entity.define({
    template: "IncompletePit",
    name: "pit (under contruction)",
    isFeature: true,
    symbol: "\u2022",
    behaviors: [b.Construction()]
  });

  HTomb.Entity.define({
    template: "IncompleteWall",
    name: "wall (under contruction)",
    isFeature: true,
    symbol: "\u25AB",
    behaviors: [b.Construction()]
  });

  return HTomb;
})(HTomb);
