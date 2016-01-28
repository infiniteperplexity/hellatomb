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
      onPlace: function(x,y,z) {
        HTomb.Entity.create("DownSlope").place(x,y,z+1);
        HTomb.World.levels[z+1].grid[x][y] = HTomb.Constants.FLOORTILE;
        HTomb.World.portals[x*LEVELW*LEVELH+y*LEVELH+z] = [x,y,z+1];
      }
  });
  HTomb.Entity.define({
      template: "DownSlope",
      name: "downward slope",
      isFeature: true,
      portalTo: null,
      symbol: "\u02C5",
      onPlace: function(x,y,z) {
        HTomb.World.portals[x*LEVELW*LEVELH+y*LEVELH+z] = [x,y,z-1];
      }
  });
  HTomb.Entity.define({
    template: "Tombstone",
    name: "tombstone",
    isFeature: true,
    symbol: "\u2229",
    fg: "gray",
    onPlace: function(x,y,z) {
      HTomb.Entity.create("Corpse").place(x,y,z-1);
    }
  });

  HTomb.Entity.define({
    template: "Tree",
    name: "tree",
    isFeature: true,
    symbol: "\u03D4",
    fg: "green"
  });


  return HTomb;
})(HTomb);
