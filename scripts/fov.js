// The FOV submodule contains vision algorithms, which should be highly optimized
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var grid;
  var x0,y0,z0,r0;


  var passlight = function(x,y) {
      //constrain to the grid
      if (x<=0 || x>=LEVELW-1 || y<=0 || y>=LEVELH-1) {
        return false;
      }
      //curve the edges
      if (Math.sqrt((x-x0)*(x-x0)+(y-y0)*(y-y0)) > r0) {
        return false;
      }
      //only opaque tiles block light
      //if this ever changes use a different FOV
      return (grid[x][y].opaque === undefined);
  };

  var show = function(x,y,r,v) {
    var visible = HTomb.World.visible;
    var explored = HTomb.World.explored;
    visible[z0][x][y] = true;
    explored[z0][x][y] = true;
    if (grid[x][y].zview===+1) {
      explored[z0+1][x][y] = true;
    } else if (grid[x][y].zview===-1) {
      explored[z0-1][x][y] = true;
    }
  };

  var caster = new ROT.FOV.PreciseShadowcasting(passlight);

  HTomb.FOV.resetVisible = function() {
    var visible = HTomb.World.visible;
    for (var x=0; x<LEVELW; x++) {
      for (var y=0; y<LEVELH; y++) {
        for (var z=0; z<NLEVELS; z++) {
          visible[z][x][y] = false;
        }
      }
    }
  };
  HTomb.FOV.findVisible = function(x,y,z,r) {
    x0 = x;
    y0 = y;
    r0 = r;
    z0 = z;
    grid = HTomb.World.tiles[z];
    caster.compute(x,y,r,show);
  };

  return HTomb;
})(HTomb);
