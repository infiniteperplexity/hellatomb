// The FOV submodule contains vision algorithms, which should be highly optimized
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var coord = HTomb.coord;
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
      if (grid[x][y].opaque===true) {
        return false;
      }
      var f = HTomb.World.features[coord(x,y,z0)];
      if (f && f.opaque===true) {
        return false;
      }
      return true;
  };

  var show = function(x,y,r,v) {
    var visible = HTomb.World.visible;
    var explored = HTomb.World.explored;
    visible[coord(x,y,z0)] = true;
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
    for (var crd in visible) {
      delete visible[crd];
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

  HTomb.FOV.ambientLight = function() {
    var light = 255;
    for (var x=1; x<LEVELW-1; x++) {
      for (var y=1; y<LEVELH-1; y++) {
        var blocked = false;
        for (var z=NLEVELS-2; z>0; z--) {
          z0 = z;
          if (blocked===false && passLight(x,y)) {
            HTomb.World.lit[z][x][y] = -light;
          } else {
            HTomb.World.lit[z][x][y] = (HTomb.World.lit[z][x][y]>=0) ? 0 : HTomb.World.lit[z][x][y];
          }
          for (var i=0; i<4; i++) {
            var d = ROT.DIRS[4][i];
            var dx = d[0];
            var dy = d[1];
            if (passLight(x+dx,y+dy)) {
              HTomb.World.lit[z][x][y] = Math.min(HTomb.World.lit[z][x][y],light/2);
            }
          }
          if (HTomb.World.tiles[z][x][y]===HTomb.Tiles.EmptyTile || HTomb.Tiles.DownSlopeTile) {
            z-=1;
          } else {
            blocked = true;
          }
        }
      }
    }
  };

  HTomb.FOV.pointLights = function() {
    for (var l in HTomb.World.lights) {
      var light = HTomb.World.lights[l];
      var c = HTomb.decoord(l);
      var x = c[0];
      var y = c[1];
      var z = c[2];

    }
  };

  function illuminate(x,y,z,r) {
    x0 = x;
    y0 = y;
    r0 = r;
    z0 = z;
    grid = HTomb.World.tiles[z];
    caster.compute(x,y,r,light);
  }

  function light(x,y,r,v) {
    //light this space
    if (grid[x][y].zview===+1) {
      //light above space
    } else if (grid[x][y].zview===-1) {
      //light below space
    }
  };

  function resolveLights() {
    for (x=1; x<LEVELW-1; x++) {
      for (y=1; y<LEVELH-1; y++) {
        for (z=1; z<NLEVELS-1; z++) {
          HTomb.World.lit[z][x][y] = -HTomb.World.lit[z][x][y];
        }
      }
    }
  }


  return HTomb;
})(HTomb);
