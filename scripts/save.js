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


  HTomb.Save.restoreGame = function(txt) {
    let path = "C:/Users/m543015/Desktop/GitHub/hellatomb/saves/";
    txt = txt || "save";
    let req = new XMLHttpRequest();
    req.open('GET', 'file://'+path+txt+".json", false);
    req.send();
    let json = req.responseText;
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
      } else if (val.ItemContainer) {
        let ic = new ItemContainer();
        for (let i=0; i<val.ItemContainer.length; i++) {
          ic.push(val.ItemContainer[i]);
          ic.parent = this;
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
    // swap all thingId references for their thing
    for (let i=0; i<tids.length; i++) {
      let tid = tids[i];
      tid[0][tid[1]] = saveGame.things[tid[2].tid];
    }
    HTomb.Player = player.entity;
    fillListFrom(saveGame.things, HTomb.World.things);
    fillGrid3dFrom(saveGame.tiles, HTomb.World.tiles, HTomb.Types.templates.Tile.parse);
    fillGrid3dFrom(saveGame.explored, HTomb.World.explored);
    fillListFrom(saveGame.creatures, HTomb.World.creatures);
    fillListFrom(saveGame.items, HTomb.World.items);
    fillListFrom(saveGame.features, HTomb.World.features);
    fillListFrom(saveGame.zones, HTomb.World.zones);
    fillListFrom(saveGame.covers, HTomb.World.covers, HTomb.Types.templates.Cover.parse);
    HTomb.Time.dailyCycle.turn = saveGame.dailyCycle.turn;
    HTomb.Time.dailyCycle.minute = saveGame.dailyCycle.minute;
    HTomb.Time.dailyCycle.hour = saveGame.dailyCycle.hour;
    HTomb.Time.dailyCycle.day = saveGame.dailyCycle.day;
    HTomb.FOV.resetVisible();
    if (HTomb.Player.sight) {
      HTomb.FOV.findVisible(HTomb.Player.x, HTomb.Player.y, HTomb.Player.z, HTomb.Player.sight.range);
    }
    HTomb.GUI.splash("Game restored.");
  };



  HTomb.Save.saveGame = function() {
    let saveGame = {};
    console.time("save game");
    //saveGame.things = HTomb.World.things;
    //saveGame.tiles = HTomb.World.tiles;
    //saveGame.explored = HTomb.World.explored;
    //saveGame.covers = HTomb.World.covers;
    //saveGame.lights = HTomb.World.lights;
    //saveGame.dailyCycle = HTomb.Time.dailyCycle;
    //let json = HTomb.Save.stringify(saveGame);
    //let json = stringifyList(HTomb.World.things,{callback: openBlob});
    let json = stringifyList(HTomb.World.things,{callback: postData});
    //let json = stringifyList(HTomb.World.things,{callback: storeLocal});
    //let json = stringifyList(HTomb.World.things);
    console.timeEnd("save game");
  };

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

  function openBlob(json) {
    let blob = new Blob([json],{type:"text/json"});
    let url = (window.URL ? URL : webkitURL).createObjectURL(blob);
    open(url);
    HTomb.Time.unlockTime();
  }

  function storeLocal(json) {
    localStorage.setItem('savedGame',json);
    let test = localStorage.getItem('saveGame');
    console.log("saved game length:");
    console.log(test.length);
  }

  HTomb.Save.stageFile = function() {
    let reader = new FileReader();
    reader.onload = function(e) {
      let contents = e.target.result;
      HTomb.Save.stagedFile = contents;
    }
    reader.readAsText(document.getElementById("file").files[0]);
  }

  HTomb.Save.loadPath = function(txt) {
    let req = new XMLHttpRequest();
    req.open('GET', 'file://'+txt, false);
    req.send();
    HTomb.Save.loadedJSON = req.responseText;
  }
  HTomb.Save.loadFiles = function() {
    let finput = document.getElementById("file");
    finput.style.display = "inline";
    //finput.setAttribute("onChange",stageFile);
  }


  HTomb.Save.stringifyThing = function(obj) {
    let topLevel = true;
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
      } else if (topLevel===true) {
        topLevel = false;
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
        return val;
      }
    }," ");
    return json;
  };

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
        delete toList[t];
      }
      for (let f in fromList) {
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
