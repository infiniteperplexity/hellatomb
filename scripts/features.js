HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;

  var b = HTomb.Behavior;

  HTomb.Entity.define({
    template: "UpSlope",
    name: "upward slope",
    isFeature: true,
    portalTo: null,
    symbol: "\u02C4",
    zView: +1,
    fg: HTomb.Constants.ABOVE,
    onPlace: function(x,y,z) {
      HTomb.Entity.create("DownSlope").place(x,y,z+1);
      HTomb.World.levels[z+1].grid[x][y] = HTomb.Tiles.FLOORTILE;
      HTomb.World.portals[x*LEVELW*LEVELH+y*LEVELH+z] = [x,y,z+1];
    }
  });
  HTomb.Entity.define({
    template: "DownSlope",
    name: "downward slope",
    isFeature: true,
    portalTo: null,
    zView: -1,
    symbol: "\u02C5",
    fg: HTomb.Constants.BELOW,
    onPlace: function(x,y,z) {
      HTomb.World.portals[x*LEVELW*LEVELH+y*LEVELH+z] = [x,y,z-1];
    }
  });
  HTomb.Entity.define({
    template: "Pit",
    name: "pit",
    isFeature: true,
    zView: -1,
    symbol: "\u25CB",
    //bg: "#444444"
    fg: HTomb.Constants.BELOW
  });
  HTomb.Entity.define({
    template: "Tombstone",
    name: "tombstone",
    isFeature: true,
    symbol: "\u271F" /*"\u2229"*/ /*"\u26FC"*/,
    fg: "#AAAAAA",
    onPlace: function(x,y,z) {
      HTomb.Entity.create("Corpse").place(x,y,z-1);
    }
  });

  HTomb.Entity.define({
    template: "Tree",
    name: "tree",
    isFeature: true,
    symbol: /*"\u03D4"*/ /*"\u262B"*/ "\u2663",
    fg: "#559900"
  });

  HTomb.Entity.define({
    template: "Shrub",
    name: "shrub",
    isFeature: true,
    symbol: /*"\u03D4"*/ "\u262B",
    fg: "#779922"
  });

  HTomb.Entity.define({
    template: "Puddle",
    name: "puddle",
    isFeature: true,
    symbol: "~",
    fg: "#0088DD"
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
