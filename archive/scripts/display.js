Game.display = new ROT.Display({width: Game.Constants.screenw, height: Game.Constants.screenh});
document.body.appendChild(Game.display.getContainer());

Game.screen = {
  z: 1,
  xoffset: 0,
  yoffset: 0
};
// Now set up drawing
Game.render = function() {
  var p = Game.Player.entity;
  var w = Game.Constants.screenw;
  var h = Game.Constants.screenh;
  var tiles = Game.World.tileProperties;
  if (p.x >= Game.screen.xoffset+w-2) {
    Game.screen.xoffset = p.x-w+2;
  } else if (p.x <= Game.screen.xoffset) {
    Game.screen.xoffset = p.x-1;
  }
  if (p.y >= Game.screen.yoffset+h-2) {
    Game.screen.yoffset = p.y-h+2;
  } else if (p.y <= Game.screen.yoffset) {
    Game.screen.yoffset = p.y-1;
  }
  var z = 1;
  var level = Game.World.levels[z];
  var grid = level.grid;
  var xoffset = Game.screen.xoffset;
  var yoffset = Game.screen.yoffset;
  // draw the tiles
  var levelw = Game.Constants.levelw;
  for (var x = xoffset; x < xoffset+w; x++) {
    for (var y = yoffset; y < yoffset+h; y++) {
      Game.display.draw(
        x-xoffset,
        y-yoffset,
        tiles[grid[x][y][0]].symbol,
        (level.visible[x*levelw+y]===true) ? "white" : "gray",
        "black"
      );
    }
  }
  // this doesn't make a whole lot of sense...what about items?
  var actor;
  for (var i = 0; i<Game.World.actors.length; i++) {
    actor = Game.World.actors[i];
    if (actor.z===z && actor.x>=xoffset && actor.x<w+xoffset && actor.y>=yoffset && actor.y<h+yoffset) {
      Game.display.draw(
        actor.x-xoffset,
        actor.y-yoffset,
        actor.symbol,
        (level.visible[actor.x*levelw+actor.y]===true) ? "white": "gray",
        "black"
      );
    }
  }
};
