Game.World.levels = [];
Game.World.enumtiles = {floorTile: 0, wallTile: 1};
Game.World.tileProperties = [];
Game.World.tileProperties[Game.World.enumtiles.floorTile] = {symbol: "."};
Game.World.tileProperties[Game.World.enumtiles.wallTile] = {symbol: "#", opaque: true, solid: true};
Game.World.actors = [];
Game.World.addLevel = function(z) {
  // create grid
  var level = {};
  if(z===undefined) {
      z = Game.World.levels.length;
  }
  Game.World.levels[z] = level;
  level.grid = [];
  for (var x = 0; x < Game.Constants.levelw; x++) {
    level.grid.push([]);
    for (var y = 0; y < Game.Constants.levelh; y++) {
      if (x===0 || x===(Game.Constants.levelw-1) || y===0 || y===(Game.Constants.levelh-1) || z===0 || z===(Game.Constants.nlevels-1)) {
        level.grid[x][y] = [Game.World.enumtiles.wallTile,[],[],[]];
      } else {
        level.grid[x][y] = [Game.World.enumtiles.floorTile,[],[],[]];
      }
      //Map.fastXGrid[x*25 + y] = Map.grid[x][y];
      //Map.fastYGrid[y*80 + x] = Map.grid[x][y];
    }
  }
  // create fov
  level.visible = [];
  // this should be a closure...is it?
  var passlight = function(x,y) {
    if (x<0 || x>Game.Constants.levelw-1 || y<0 || y>Game.Constants.levelh-1) {
      return false;
    } else {
      return (Game.World.tileProperties[level.grid[x][y][0]].opaque === undefined);
    }
  };
  level.fov = new ROT.FOV.PreciseShadowcasting(passlight);
  var show = function(x,y,r,v) {
    // could add circular range limits here
    // or maybe I should just copy the code by hand...
    level.visible[x*Game.Constants.levelw + y] = true;
  }
  level.visibleFrom = function(x,y,r) {
    level.fov.compute(x,y,r,show);
  }
  level.resetVisible = function() {
    while(level.visible.length>0) {
      level.visible.pop();
    }
  };
};
for (var i = 0; i<Game.Constants.nlevels; i++) {
  Game.World.addLevel();
}
