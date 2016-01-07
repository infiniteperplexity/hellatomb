Game.World.levels = [];
Game.World.enumtiles = {floorTile: 0, wallTile: 1};
Game.World.tileProperties = [];
Game.World.tileProperties[Game.World.enumtiles.floorTile] = {symbol: "."};
Game.World.tileProperties[Game.World.enumtiles.wallTile] = {symbol: "#", opaque: true, solid: true};
for(var z=0; z<Game.Constants.nlevels; z++) {
  Game.World.levels.push({grid: []});
  for (var x = 0; x < Game.Constants.levelw; x++) {
    Game.World.levels[z].grid.push([]);
    for (var y = 0; y < Game.Constants.levelh; y++) {
      if (x===0 || x===(Game.Constants.levelw-1) || y===0 || y===(Game.Constants.levelh-1) || z===0 || z===(Game.Constants.nlevels-1)) {
        Game.World.levels[z].grid[x][y] = Game.World.enumtiles.wallTile;
      } else {
        Game.World.levels[z].grid[x][y] = Game.World.enumtiles.floorTile;
      }
      //Map.fastXGrid[x*25 + y] = Map.grid[x][y];
      //Map.fastYGrid[y*80 + x] = Map.grid[x][y];
    }
  }
}
Game.World.actors = [];
