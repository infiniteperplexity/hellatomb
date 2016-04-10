// This submodule handles saving the game
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;

  // Okay so the key thing here is, I can't return anything...
  //...I have to do everything like bad C code
  // but this doesn't even like, take that long anymore.
  var count = 0;
  var list = [];
  function stringifyArray(arr, every) {
    every = every || 1000;
    var count = 0;
    var list = ['['];
    var recurse = function() {
      for (; count<arr.length; count++) {
        list.push(HTomb.Save.stringify(arr[count]));
        if (count<arr.length-1) {
          list.push(',');
        } else {
          list.push(']');
          localStorage.list = list.join('')
        }
        if (count>0 && count%every===0) {
          console.log(count);
          count++;
          setTimeout(recurse);
          break;
        }
      }
    };
    recurse();
  }
  // function stringifyObject(obj, every) {
  //   var keys = Object.keys(obj);
  //   var i = 0;
  //   var list = {};
  //   var recurse = function() {
  //     for (; i<keys.length; i++) {
  //       list[keys[i]] = HTomb.Save.stringify(obj[keys[i]]);
  //       if (i<arr.length-1) {
  //         list.push(',');
  //       }
  //     }
  //   }
  //   for (var i=0; i<keys.length; i++) {
  //
  //   }
  // }
  // function
  // var i=0;
  // list = [];
  // function save () {
  //   for (; i<HTomb.World.things.length; i++) {
  //     list.push(HTomb.Save.stringify(HTomb.World.things[i]));
  //     if (i>0 && i%1000===0) {
  //       var bg = ROT.Colconsole.log(i);
  //       i++;
  //       setTimeout(save);
  //   ;
  //     }
  //   }
  // }

  HTomb.Save.saveTest = function() {
    return stringifyArray(HTomb.World.things);
  };

  HTomb.Save.saveGame = function() {
    var saveGame = {};
    console.log("testing");
    saveGame.things = HTomb.World.things;
    saveGame.tiles = HTomb.World.tiles;
    saveGame.explored = HTomb.World.explored;
    saveGame.creatures = HTomb.World.creatures;
    saveGame.items = HTomb.World.items;
    saveGame.features = HTomb.World.features;
    saveGame.zones = HTomb.World.zones;
    saveGame.covers = HTomb.World.covers;
    saveGame.dailyCycle = HTomb.World.dailyCycle;
    //localStorage.saveGame = saveGame;
    var json = HTomb.Save.stringify(saveGame);
    localStorage.saveGame = json;
    console.log(json.length);
  };

  var seen = [];
  HTomb.Save.duplicates = [];
  HTomb.Save.nThings = 0;
  //HTomb.Save.stringify = function(obj) {
  HTomb.Save.stringify = function(obj) {
    var json = JSON.stringify(obj, function(key, val) {
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
        HTomb.Save.nThings+=1;
        // stringify only those things on the "each" list
        for (var p in val) {
          if (p!=="each" && val.hasOwnProperty(p)===false) {
            delete val[p];
          }
      	}
        if (val.each) {
          delete val.each;
        }
        return val;
      // if it's on the global things table, stringify its ID
      } else if (val.thingId) {
        //console.log("serialized as ID");
        return {tid: val.thingId};
      } else {
        //console.log("normal value");
        if (seen.indexOf(val)!==-1 && HTomb.Save.duplicates.indexOf(val)!==-1) {
          HTomb.Save.duplicates.push([this, key, val]);
        }
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
  };

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
  };

  HTomb.Save.restoreGame = function(j) {
    var json = localStorage.saveGame;
    var tids = [];
    //var templates = [];
    var player = null;
    // parse while keeping a list of references to thingIds
    var saveGame = JSON.parse(json, function (key, val) {
      if (val===null) {
        return null;
      } else if (val.tid) {
        tids.push([this,key,val]);
        return undefined;
      } else if (val.template) {
        // supposedly writing to __proto__ makes baby jesus cry
        val.__proto__ = HTomb.Things.templates[val.template];
        //templates.push([this,key,val]);
        if (val.template==="Player") {
          player = val;
        }
        return val;
      } else {
        return val;
      }
    });
    // swap all thingId references for their thing
    for (var i=0; i<tids.length; i++) {
      var tid = tids[i];
      tid[0][tid[1]] = saveGame.things[tid[2].tid];
    }
    HTomb.Player = player.entity;
    fillListFrom(saveGame.things, HTomb.World.things);
    fillGrid3dFrom(saveGame.tiles, HTomb.World.tiles, HTomb.Things.templates.Terrain.parse);
    fillGrid3dFrom(saveGame.explored, HTomb.World.explored);
    fillListFrom(saveGame.creatures, HTomb.World.creatures);
    fillListFrom(saveGame.items, HTomb.World.items);
    fillListFrom(saveGame.features, HTomb.World.features);
    fillListFrom(saveGame.zones, HTomb.World.zones);
    fillListFrom(saveGame.covers, HTomb.World.covers);
    HTomb.World.dailyCycle.turn = saveGame.dailyCycle.turn;
    HTomb.World.dailyCycle.minute = saveGame.dailyCycle.minute;
    HTomb.World.dailyCycle.hour = saveGame.dailyCycle.hour;
    HTomb.World.dailyCycle.day = saveGame.dailyCycle.day;
    HTomb.FOV.resetVisible();
    if (HTomb.Player.sight) {
      HTomb.FOV.findVisible(HTomb.Player.x, HTomb.Player.y, HTomb.Player.z, HTomb.Player.sight.range);
    }
    HTomb.GUI.splash("Game restored.");
  };

  return HTomb;

})(HTomb);
