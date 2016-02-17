HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;

  //*************Create a generic world****************
  var levels = [];
  function addLevel(z) {
    var level = {};
    if (z===undefined) {
      z = levels.length;
    }
    levels[z] = level;
    level.grid = [];
    level.explored = [];
    for (var x=0; x<LEVELW; x++) {
      level.grid.push([]);
      level.explored.push([]);
      for (var y=0; y<LEVELH; y++) {
        if (x===0 || x===LEVELW-1 || y===0 || y===LEVELH-1 || z===0 || z===NLEVELS-1) {
          level.grid[x][y] = HTomb.Tiles.VOIDTILE;
        } else {
          level.grid[x][y] = HTomb.Tiles.EMPTYTILE;
        }
        level.explored[x][y] = false;
      }
    }
  }
  HTomb.World.levels = levels;
  HTomb.World.init = function() {
    for (var z=0; z<NLEVELS; z++) {
      addLevel();
    }
    populate();
    //createFastGrid();
  };



  
  HTomb.World.colors = [];
  HTomb.World.creatures = {};
  HTomb.World.items = {};
  HTomb.World.features = {};
  HTomb.World.portals = {};
  HTomb.World.zones = {};

  HTomb.World.dailyCycle = {hour: 8, minute: 0,
    onTurnBegin: function() {
      this.minute+=1;
      if (this.minute>=60) {
        this.minute = 0;
        this.hour = (this.hour+1)%24;
      }},
    shade: function(color) {
      color = ROT.Color.fromString(color);
      //color = ROT.Color.add(color,[0,50,50]); //midday?
      //color = ROT.Color.add(color,[50,50,0]); //dawn?
      //color = ROT.Color.add(color,[50,0,0]); //dusk?
      //color = ROT.Color.add(color,[-50,-50,0]); //night?
      //at this point we need to add daylight stuff
      return ROT.Color.toHex(color);
  }};

  HTomb.World.Things = {
    table: [],
    assign: function(thing) {
      var id = this.table.length;
      thing.thingId = id;
      this.table.push(thing);
    },
    release: function(thing) {
      this.table.splice(this.table.indexOf(thing),0);
    }
  };

  return HTomb;
})(HTomb);
