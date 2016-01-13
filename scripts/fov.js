HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var levels = HTomb.World.levels;
  var grid;
  var tiles = HTomb.World.tiles;
  var visible = [];
  for (var i=0; i<LEVELW; i++) {
    visible.push([]);
    for (var j=0; j<LEVELH; j++) {
      visible[i][j] = false;
    }
  }

  var passlight = function(x,y) {
      if (x<0 || x>=LEVELW || y<0 || y>=LEVELH) {
        return false;
      }
      return (tiles[grid[x][y]].opaque === undefined);
  };

  var show = function(x,y,r,v) {
    visible[x][y]= true;
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
    grid = levels[z].grid;
    caster.compute(x,y,r,show);
  };
  HTomb.FOV.visible = visible;
  return HTomb;
})(HTomb);
