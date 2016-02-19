// This submodule handles saving the game
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;

  HTomb.Save.saveGame = function() {
    var saveGame = {};
    saveGame.things = HTomb.World.things;
    saveGame.tiles = HTomb.World.tiles;
    saveGame.explored = HTomb.World.explored;
    saveGame.creatures = HTomb.World.creatures;
    saveGame.items = HTomb.World.items;
    saveGame.features = HTomb.World.features;
    saveGame.zones = HTomb.World.zones;
    var json = HTomb.Save.stringify(saveGame);
    localStorage.saveGame = json;
    console.log(json.length);
  };

  HTomb.Save.stringify = function(obj) {
    var json = JSON.stringify(obj, function(key, val) {
      //console.log([this,key,val]);
      if (val===undefined) {
        //console.log("why is val undefined?");
        return undefined;
      } else if (val===null) {
        //console.log("could I just do null normally?");
        return null;
      }
      // if it has special instructions, use those to stringify
      if (val.stringify) {
        //console.log("special way to stringify");
        return val.stringify();
        // if it's from the global things table, stringify it normally
      } else if (this===HTomb.World.things) {
        //console.log("thing on the thing list");
        // stringify only those things on the "each" list
        for (var p in val) {
      		// this should not delete inherited properties or attached things
            //// Can maybe dump x, y, and z, and reconstruct from lists?
      		if (val.each.indexOf(p)===-1 && val.thingId===undefined) {
      			delete val[p];
      		}
      	}
        return val;
      // if it's on the global things table, stringify its ID
      } else if (val.thingId) {
        //console.log("serialized as ID");
        return {tid: val.thingId};
      } else {
        //console.log("normal value");
        return val;
      }
    });
    return json;
  };

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
      if (key==="tid") {
        // This will need to restore the prototype chain
        return thingParse.things[val];
      } else {
        return val;
      }
    });
    fillListFrom(thingParse.things, HTomb.World.things);
    fillGrid3dFrom(restParse.tiles, HTomb.World.tiles, HTomb.Things.templates.Terrain.parse);
    fillGrid3dFrom(restParse.explored, HTomb.World.explored);
    fillListFrom(restParse.creatures, HTomb.World.creatures);
    fillListFrom(restParse.items, HTomb.World.items);
    fillListFrom(restParse.features, HTomb.World.features);
    fillListFrom(restParse.zones, HTomb.World.zones);
    //fillListFrom(restParse.tasks, HTomb.World.tasks);
  };

  return HTomb;
})(HTomb);
