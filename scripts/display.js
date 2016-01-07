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
  var grid = Game.World.levels[z].grid;
  var xoffset = Game.screen.xoffset;
  var yoffset = Game.screen.yoffset;
  var tiles = Game.World.tileProperties;
  // draw the tiles
  for (var x = xoffset; x < xoffset+w; x++) {
    for (var y = yoffset; y < yoffset+h; y++) {
      Game.display.draw(
        x-xoffset,
        y-yoffset,
        tiles[grid[x][y]].symbol,
        "white",
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
        "white",
        "black"
      );
    }
  }
  Game.FOV.visibility();
};
