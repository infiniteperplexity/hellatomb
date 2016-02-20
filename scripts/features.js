// Features are large, typically immobile objects
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.coord;

  HTomb.Things.defineEntity({
    template: "Tombstone",
    name: "tombstone",
    isFeature: true,
    symbol: "\u271F",
    fg: "#AAAAAA",
    randomColor: 5,
    onPlace: function(x,y,z) {
      // Bury a corpse beneath the tombstone
      HTomb.Things.create("Corpse").place(x,y,z-1);
    }
  });

  HTomb.Things.defineEntity({
    template: "Tree",
    name: "tree",
    isFeature: true,
    //symbol: "\u2663",
    symbol: ["\u2663","\u2660"],
    fg: "#559900",
    randomColor: 20
  });

  HTomb.Things.defineEntity({
    template: "Shrub",
    name: "shrub",
    isFeature: true,
    symbol: "\u262B",
    fg: "#779922",
    randomColor: 20
  });

  HTomb.Things.defineEntity({
    template: "Puddle",
    name: "puddle",
    isFeature: true,
    symbol: "~",
    fg: "#0088DD",
    randomColor: 20
  });

  // An excavation is a special, dynamic entity that digs out a square and then removes itself
  HTomb.Things.defineEntity({
    template: "Excavation",
    name: "excavation",
    isFeature: true,
    constructionSymbol: "\u2022",
    onPlace: function(x,y,z) {
      var t = HTomb.World.tiles[z][x][y];
      var below = HTomb.World.tiles[z-1][x][y];
      if (t===HTomb.Tiles.WallTile) {
        if (below.solid===true) {
          HTomb.World.tiles[z][x][y] = HTomb.Tiles.FloorTile;
        } else {
          HTomb.World.tiles[z][x][y] = HTomb.Tiles.EmptyTile;
        }
      } else if (t===HTomb.Tiles.FloorTile) {
        HTomb.World.tiles[z][x][y] = HTomb.Tiles.EmptyTile;
        if (below.solid===true) {
          HTomb.World.tiles[z][x][y] = HTomb.Tiles.FloorTile;
        } else {
          HTomb.World.tiles[z][x][y] = HTomb.Tiles.EmptyTile;
        }
      }
      this.remove();
    }
  });

  HTomb.Things.defineEntity({
    template: "Construction",
    name: "construction",
    isFeature: true,
    steps: 10,
    task: null,
    symbol: "X",
    each: ["steps","symbol","fg","task","name"]
  });

  HTomb.Things.defineEntity({
    template: "Door",
    name: "door",
    isFeature: true,
    active: true,
    get symbol() {
      if (this.active) {
        return "\u25A5";
      } else {
        return "\u25FB";
      }
    },
    fg: "#BB9922",
    each: ["active"],
    activate: function() {
      if (this.active) {
        this.active=false;
      } else {
        this.active=true;
      }
      HTomb.GUI.reset();
    },
    get passable() {
      if (this.active) {
        return false;
      } else {
        return true;
      }
    }
  });

  HTomb.Things.defineEntity({
    template: "Water",
    name: "water",
    isLiquid: true,
    symbol: "~",
    fg: "blue",
    bg: "#0000BB",
    darkbg: "#000088",
    shimmer: function() {
      var bg = ROT.Color.fromString(this.bg);
      bg = ROT.Color.randomize(bg,[0, 0, this.randombg]);
      bg = ROT.Color.toHex(bg);
      return bg;
    },
    randombg: 25
  });

  return HTomb;
})(HTomb);
