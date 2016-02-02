
var vis = HTomb.FOV.visible;
var terrain = HTomb.Tiles.terrain;
var creatures = HTomb.World.creatures;
var items = HTomb.World.items;
var features = HTomb.World.features;
var zones = HTomb.World.zones;
Tiles.drawSymbol = function(x,y,z) {
  var coord = Tiles.coord(x,y,z);
  var level = HTomb.World.levels[z];
  var grid = level.grid;
  var explored = level.explored;
  var sym, fg, bg, thing;
  fg = "white";
  bg = (zones[coord]===undefined) ? "black" : zones[coord].bg;
  if (!explored[x][y]) {
    sym = " ";
  } else if (vis[x][y]===false) {
    fg = SHADOW;
    if (items[coord]) {
      thing = items[coord][items[coord].length-1];
      sym = thing.symbol || "X";
    } else if (features[coord]) {
      thing = features[coord];
      sym = thing.symbol || "X";
    } else {
      sym = terrain[grid[x][y]].symbol || "X";
    }
  } else {
    if (creatures[coord]) {
      thing = creatures[coord];
      sym = thing.symbol || "X";
      fg = thing.fg || "white";
    } else if (items[coord]) {
      thing = items[coord][items[coord].length-1];
      sym = thing.symbol || "X";
      fg = thing.fg || "white";
    } else if (features[coord]) {
      thing = features[coord];
      sym = thing.symbol || "X";
      fg = thing.fg || EARTHTONE;
    } else {
      thing = terrain[grid[x][y]];
      sym = thing.symbol || "X";
      fg = thing.fg || EARTHTONE;
    }
  }
  display.draw(this.x0+x-xoffset,this.y0+y-yoffset, sym, fg, bg);
};

gameScreen.render = function() {
  var z = gameScreen.z;
  var xoffset = gameScreen.xoffset;
  var yoffset = gameScreen.yoffset;

  // I am not sure if this is the best way
  for (var x = xoffset; x < xoffset+SCREENW; x++) {
    for (var y = yoffset; y < yoffset+SCREENH; y++) {
      coord = x*LEVELW*LEVELH + y*LEVELH + z;
      fg = "white";

      // testing
      // explored[x][y] = true;
      // end testing

    }
  }
};
