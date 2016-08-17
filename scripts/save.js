// This submodule handles saving the game
HTomb = (function(HTomb) {
  "use strict";
  let LEVELW = HTomb.Constants.LEVELW;
  let LEVELH = HTomb.Constants.LEVELH;
  let NLEVELS = HTomb.Constants.NLEVELS;

  function stringifyList(arr, options) {
    HTomb.Time.lockTime();
    console.time("stringify list");
    options = options || {};
    var every = options.every || 1000;
    var callback = options.callback || function() {};
    var count = 0;
    var list = ['['];
    var recurse = function() {
      for (; count<arr.length; count++) {
        list.push(HTomb.Save.stringifyThing(arr[count]));
        if (count<arr.length-1) {
          list.push(',');
        } else {
          list.push(']');
          list = list.join('');
          console.log(list.length);
          callback(list);
          console.timeEnd("stringify list");
        }
        if (count>0 && count%every===0) {
          //!!!! Should be a more informative message
          console.log(count);
          count++;
          setTimeout(recurse);
          break;
        }
      }
    };
    recurse();
  }

  function restoreData(parsed) {
    let things = parsed.things;
    let explored = parsed.explored;
    let covers = parsed.covers;
    let lights = parsed.lights;
    let cycle = parsed.cycle;
  }

  HTomb.Save.restoreGame = function(json) {
    let tids = [];
    //let templates = [];
    let player = null;
    // parse while keeping a list of references to thingIds
    console.time("actual parsing");
    let saveGame = JSON.parse(json, function (key, val) {
      if (val===null) {
        return null;
      } else if (val.tid) {
        tids.push([this,key,val]);
        return undefined;
      } else if (val.ItemContainer) {
        let ic = new HTomb.ItemContainer();
        ic.parent = this;
        for (let i=0; i<val.ItemContainer.length; i++) {
          // length somehow gets really messed up here...
          if (val.ItemContainer[i]===undefined) {
            continue;
          }
          ic.push(val.ItemContainer[i]);
        }
        return ic;
      } else if (val.template) {
        let template = HTomb.Things.templates[val.template];
        let dummy = Object.create(template);
        for (let p in val) {
          if (p!=="template" || val[p]!==template[p]) {
            dummy[p] = val[p];
          }
        }
        if (val.template==="Player") {
          console.log("found player");
          player = val;
        }
      }
      return val;
    });
    console.timeEnd("actual parsing");
    // swap all thingId references for their thing
    for (let i=0; i<tids.length; i++) {
      let tid = tids[i];
      tid[0][tid[1]] = saveGame.things[tid[2].tid];
    }
    //HTomb.Player = player.entity;
    fillListFrom(saveGame.things, HTomb.World.things);
    console.log("filled things");
    fillGrid3dFrom(saveGame.tiles, HTomb.World.tiles, HTomb.Types.parseTile);
    fillGrid3dFrom(saveGame.explored, HTomb.World.explored);
    console.log("filled tiles and explored");
    fillListFrom(saveGame.creatures, HTomb.World.creatures);
    fillListFrom(saveGame.items, HTomb.World.items);
    fillListFrom(saveGame.features, HTomb.World.features);
    fillListFrom(saveGame.zones, HTomb.World.zones);
    console.log("filled entities");
    fillListFrom(saveGame.covers, HTomb.World.covers, HTomb.Types.parseCover);
    console.log("parsed all covers");
    HTomb.Time.dailyCycle.turn = saveGame.dailyCycle.turn;
    HTomb.Time.dailyCycle.minute = saveGame.dailyCycle.minute;
    HTomb.Time.dailyCycle.hour = saveGame.dailyCycle.hour;
    HTomb.Time.dailyCycle.day = saveGame.dailyCycle.day;
    console.log("restored everything");
    HTomb.FOV.resetVisible();
    console.log("reset visiblity");
    if (HTomb.Player.sight) {
      HTomb.FOV.findVisible(HTomb.Player.x, HTomb.Player.y, HTomb.Player.z, HTomb.Player.sight.range);
    }
    console.log("refreshed visibility");
    HTomb.GUI.splash("Game restored.");
  };

  function batchMap(func, arr, options) {
    options = options || {};
    let splitby = options.splitby || 1;
    let then = options.then || function() {};
    let progress = options.progress || function(i) {console.log(i);};
    let retn = [];
    let count = 0;
    let recurse = function() {
      for (; count<arr.length; count++) {
        retn.push(func(arr[count], count, arr));
        if (count>=arr.length-1) {
          then(retn);
        }
        if (count>0 && count%splitby===0) {
          progress(count);
          count++;
          setTimeout(recurse);
          break;
        }
      }
    };
    recurse();
  }

  HTomb.Save.saveGame = function() {
    HTomb.Time.lockTime();
    console.time("save game");
    let totalN = HTomb.World.things.length;
    batchMap(function(v, i, a) {
        return HTomb.Save.stringifyThing(v, true);
      }, HTomb.World.things,
    //batchMap(HTomb.Save.stringifyThing, HTomb.World.things,
      {
        splitby: 1000,
        progress: function(i) {
          HTomb.GUI.pushMessage("%"+parseInt(100*i/totalN) + " complete (" + i + " entities.)");
        },
        then: function(rslt) {
          HTomb.GUI.pushMessage("Finished saving " + rslt.length + " entities.");
          console.timeEnd("save game");
          let things = rslt.join(',');
          things = '['.concat(things,']');
          let tiles = HTomb.Save.stringifyThing(HTomb.World.tiles, false);
          let explored = HTomb.Save.stringifyThing(HTomb.World.explored, false);
          let covers = HTomb.Save.stringifyThing(HTomb.World.covers, false);
          let lights = HTomb.Save.stringifyThing(HTomb.World.lights, false);
          let cycle = HTomb.Save.stringifyThing(HTomb.Time.dailyCycle, false);
          let json = '{'.concat(
            '"things": ', things, ", ",
            '"tiles": ', tiles, ", ",
            '"explored": ', explored, ", ",
            '"covers": ', covers, ", ",
            '"lights": ', lights, ", ",
            '"cycle": ', cycle,
            '}'
          );
          console.time("complex parse");
          HTomb.Save.restoreGame(json);
          console.timeEnd("complex parse");
          //console.time("simple parse");
          //let dta = JSON.parse(json);
          //console.log(dta.length);
          //console.timeEnd("simple parse");
          //postData(json);
          HTomb.Time.unlockTime();
        }
      }
    );
  };

  HTomb.Save.loadGame = function(json) {
    HTomb.Time.lockTime();
    getData();
  }

  function restoreData(parsed) {
    let things = parsed.things;
    let explored = parsed.explored;
    let covers = parsed.covers;
    let lights = parsed.lights;
    let cycle = parsed.cycle;
  }

  function postData(json) {
  //function postData(json, file) {
    var file = 'saves/test.json';
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", file, true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(json);
    HTomb.Time.unlockTime();
  }

  //function getData(file) {
  function getData() {
    console.time("get request");
    var file = 'saves/test.json';
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == XMLHttpRequest.DONE) {
        if (xhttp.status == 200) {
          console.log("Got our JSON, now we should do something with it.");
          console.log(xhttp.responseText.length);
          let json = JSON.parse(xhttp.responseText);
          console.timeEnd("get request");
        } else if (xhttp.status == 400) {
          console.log("There was an error 400");
        } else {
          console.log("Something other than 200 was returned.");
        }
        HTomb.Time.unlockTime();
      }
    };
    xhttp.open("GET", file, true);
    xhttp.send();
  }

  function getDir() {
    console.time("get request");
    var file = '/saves/';
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (xhttp.readyState == XMLHttpRequest.DONE) {
        if (xhttp.status == 200) {
          console.log("Got our JSON, now we should do something with it.");
          console.log(xhttp.responseText);
          console.timeEnd("get request");
        } else if (xhttp.status == 400) {
          console.log("There was an error 400");
        } else {
          console.log("Something other than 200 was returned.");
        }
        HTomb.Time.unlockTime();
      }
    };
    xhttp.open("GET", file, true);
    xhttp.send();
  }

  HTomb.Save.getData = function() {
    getData();
  };
  HTomb.Save.getDir = function() {
    getDir();
  };

  HTomb.Save.stringifyThing = function(obj, topLevel) {
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
        return val.stringify();
        // if it's from the global things table, stringify it normally
      } else if (topLevel===true && val.thingId!==undefined) {
        if (val.template==="Player") {
          console.log("hit the player.");
        }
        topLevel = false;
        let dummy = {};
        let template = HTomb.Things.templates[val.template];
        for (let p in val) {
          if (p==="template" || val[p]!==template[p]) {
            dummy[p] = val[p];
          }
        }
        if (dummy.thingId) {
          delete dummy.thingId;
        }
        return dummy;
      // if it's on the global things table, stringify its ID
      } else if (val.thingId!==undefined) {
        return {tid: val.thingId};
      } else {
        return val;
      }
    }," ");
    return json;
  };

  // This method was used only for testing for circular references
  let seen = [];
  HTomb.Save.duplicates = [];
  HTomb.Save.nThings = 0;
  HTomb.Save.stringify = function(obj) {
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
        seen.push(val);
        //console.log("special way to stringify");
        return val.stringify();
        // if it's from the global things table, stringify it normally
      } else if (this===HTomb.World.things) {
        seen.push(val);
      //} else if (arg===true) {
        //arg = false;
        HTomb.Save.nThings+=1;
        // stringify only those things on the "each" list
        let dummy = {};
        let template = HTomb.Things.templates[val.template];
        for (let p in val) {
          if (p==="template" || val[p]!==template[p]) {
            dummy[p] = val[p];
          }
        }
        if (dummy.thingId) {
          delete dummy.thingId;
        }
        return dummy;
      // if it's on the global things table, stringify its ID
    } else if (val.thingId!==undefined) {
        //console.log("serialized as ID");
        return {tid: val.thingId};
      } else {
        if (seen.indexOf(val)!==-1) {
          if (HTomb.Save.duplicates.indexOf(val)===-1) {
            HTomb.Save.duplicates.push([this, key, val]);
          }
        } else {
          seen.push(val);
        }
        return val;
      }
    }," ");
    return json;
  };


  function fillListFrom(fromList, toList, callb) {
    // default callback is to return self
    callb = callb || function(x) {return x;};

    // if fromList is an array
    if (Array.isArray(fromList) && Array.isArray(toList)) {
      while(toList.length>0) {
        toList.pop();
      }
      for (let i=0; i<fromList.length; i++) {
        toList.push(callb(fromList[i]));
      }
    // if fromList is an associative array
    } else {
      for (let t in toList) {
        if (callb === HTomb.Types.parseCover) {
          console.log(["deleting",toList[t]]);
        }
        delete toList[t];
      }
      for (let f in fromList) {
        if (callb === HTomb.Types.parseCover) {
          console.log(["inserting",fromList[f]]);
        }
        toList[f] = callb(fromList[f]);
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

  return HTomb;

})(HTomb);
