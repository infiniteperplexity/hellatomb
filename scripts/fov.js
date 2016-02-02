HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var levels = HTomb.World.levels;
  var grid;
  var explored;
  var terrain = HTomb.Tiles.terrain;
  var visible = [];
  for (var i=0; i<LEVELW; i++) {
    visible.push([]);
    for (var j=0; j<LEVELH; j++) {
      visible[i][j] = false;
    }
  }
  var ox, oy, r0;

  var passlight = function(x,y) {
      //constrain to the grid
      if (x<=0 || x>=LEVELW-1 || y<=0 || y>=LEVELH-1) {
        return false;
      }
      //curve the edges
      if (Math.sqrt((x-ox)*(x-ox)+(y-oy)*(y-oy)) > r0) {
        return false;
      }
      //only opaque tiles block light
      //if this ever changes use a different FOV
      return (terrain[grid[x][y]].opaque === undefined);
  };

  var show = function(x,y,r,v) {
    visible[x][y] = true;
    explored[x][y] = true;
  };

  var caster = new ROT.FOV.PreciseShadowcasting(passlight);

  HTomb.FOV.resetVisible = function() {
    for (var x=0; x<LEVELW; x++) {
      for (var y=0; y<LEVELH; y++) {
        visible[x][y] = false;
      }
    }
  };
  HTomb.FOV.findVisible = function(x,y,z,r) {
    //test code
    ox = x;
    oy = y;
    r0 = r;
    //end test
    grid = levels[z].grid;
    explored = levels[z].explored;
    caster.compute(x,y,r,show);
  };
  HTomb.FOV.visible = visible;
  return HTomb;
})(HTomb);
