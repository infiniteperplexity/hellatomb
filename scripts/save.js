// This submodule handles saving the game
HTomb = (function(HTomb) {
  "use strict";

  HTomb.Save.saveGame = function() {
    var saveGame = {};
    saveGame.things = HTomb.World.things;
    saveGame.tiles = HTomb.World.tiles;
    saveGame.explored = HTomb.World.explored;
    saveGame.creatures = HTomb.World.creatures;
    saveGame.items = HTomb.World.items;
    saveGame.features = HTomb.World.features;
    saveGame.zones = HTomb.World.zones;
    //saveGame.tasks = HTomb.World.tasks;
    var json = stringify(saveGame);
    //return json;
    localStorage.saveGame = json;
  }

  function stringify(obj) {
    var json = JSON.stringify(obj, function(key, val) {
    // if it has special instructions, use those to stringify
    if (val.stringify) {
      return val.stringify();
      // if it's from the global things table, stringify it normally
    } else if (this===HTomb.World.things) {
      return val;
    // if it's on the global things table, stringify its ID
    } else if (val.thingId) {
      if (val.thingId==="static") {
        return {staticThing: val.template};
    } else {
      return {thingId: val.thingId};
    } else {
    // otherwise stringify it normally
      return val;
    }
  }

  function fillListFrom(fromList, toList) {
    if (Array.isArray(fromList) && Array.isArray(toList)) {
      while(toList.length>0) {
        toList.pop();
      }
      for (var i=0; i<fromList.length; i++) {
        toList.push(fromList[i]);
      }
  } else {
    for (var t in toList) {
      delete toList[t];
    }
    for (var f in fromList) {
      toList[f] = fromList[f];
    }
  }

  function fillGrid3dFrom(fromGrid, toGrid, callb) {
  // default callback is to return self
    callb = callb || function(x) {return x;};
    // pull all elements from old grid
    for (var z=0; z<NLEVELS; z++) {
      for (var x=0; x<LEVELW; x++) {
        for (var y=0; y<LEVELH; y++) {
          toGrid[z][x][y] = callb(fromGrid[z][x][y]);
        }
      }
    }
  }

  HTomb.Save.restoreGame = function(saveGame) {
    saveGame = localStorage.saveGame;
    var thingParse = JSON.parse(saveGame);
    var restParse = JSON.parse(saveGame, function(key, val) {
      if (key==="thingId") {
        return thingParse.things[val];
      } else if (key==="staticThing") {
        return HTomb.Things.template[val]();
      } else {
        return val;
      }
    }
    fillListFrom(thingParse.things, HTomb.World.things);
    fillGridFrom(restParse.tiles, HTomb.World.tiles, HTomb.Things.templates.Terrain.parse);
    fillGridFrom(restParse.explored, HTomb.World.explored);
    fillListFrom(restParse.creatures, HTomb.World.creatures);
    fillListFrom(restParse.items, HTomb.World.items);
    fillListFrom(restParse.features, HTomb.World.features);
    fillListFrom(restParse.zones, HTomb.World.zones);
    //fillListFrom(restParse.tasks, HTomb.World.tasks);
  };

  return HTomb;
})(HTomb);
