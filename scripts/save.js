// This submodule handles saving the game
HTomb = (function(HTomb) {
  "use strict";
  let LEVELW = HTomb.Constants.LEVELW;
  let LEVELH = HTomb.Constants.LEVELH;
  let NLEVELS = HTomb.Constants.NLEVELS;


  let fakeLocalStorage;
  HTomb.Save.saveGame = function() {
    let saveGame = {};
    console.time("save game");
    saveGame.things = HTomb.World.things;
    saveGame.tiles = HTomb.World.tiles;
    saveGame.explored = HTomb.World.explored;
    saveGame.covers = HTomb.World.covers;
    saveGame.dailyCycle = HTomb.World.dailyCycle;
    let json = HTomb.Save.stringify(saveGame);
    //localStorage.saveGame = json;
    fakeLocalStorage = json;
    console.timeEnd("save game");
    console.log(json.length);
  };

  let seen = [];
  HTomb.Save.duplicates = [];
  HTomb.Save.nThings = 0;
  //HTomb.Save.stringify = function(obj) {
  HTomb.Save.stringify = function(obj, arg) {
    let json = JSON.stringify(obj, function(key, val) {
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
      //} else if (this===HTomb.World.things) {
      } else if (arg===true) {
        arg = false;
        HTomb.Save.nThings+=1;
        // stringify only those things on the "each" list
        for (let p in val) {
          if (p!=="each" && val.hasOwnProperty(p)===false) {
            delete val[p];
          }
      		// this should not delete inherited properties or attached things
            //// Can maybe dump x, y, and z, and reconstruct from lists?
      		//if (p!=="each" && val.each.indexOf(p)===-1) {
      		//	delete val[p];
      		//}
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
      for (let i=0; i<fromList.length; i++) {
        toList.push(fromList[i]);
      }
    } else {
      for (let t in toList) {
        delete toList[t];
      }
      for (let f in fromList) {
        toList[f] = fromList[f];
      }
    }
  };

  function fillGrid3dFrom(fromGrid, toGrid, callb) {
  // default callback is to return self
    callb = callb || function(x) {return x;};
    // pull all elements from old grid
    for (let z=0; z<NLEVELS; z++) {
      for (let x=0; x<LEVELW; x++) {
        for (let y=0; y<LEVELH; y++) {
          toGrid[z][x][y] = callb(fromGrid[z][x][y]);
        }
      }
    }
  };

  HTomb.Save.restoreGame = function(j) {
    let json = localStorage.saveGame;
    let tids = [];
    //let templates = [];
    let player = null;
    // parse while keeping a list of references to thingIds
    let saveGame = JSON.parse(json, function (key, val) {
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
    for (let i=0; i<tids.length; i++) {
      let tid = tids[i];
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
