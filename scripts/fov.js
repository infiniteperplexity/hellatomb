var tiles = Game.World.tileProperties;
Game.FOV = {};
var passlight = function(x,y) {return (tiles[Game.FOV.grid[x][y]].opaque===undefined);};
Game.FOV.grid = {};
Game.FOV.caster = new ROT.FOV.PreciseShadowcasting(passlight);
Game.FOV.visibility = function() {
  var radius = 10;
  Game.FOV.grid = Game.World.levels[Game.Player.entity.z].grid;
  var show = function(x, y, r, v) {
    grid[x][y].visible = true;
    console.log([x,y]);
    //Game.display.draw();
  };
  Game.FOV.caster.compute(Game.Player.entity.x,Game.Player.entity.y, radius, show);
};
