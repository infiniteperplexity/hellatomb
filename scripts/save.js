// This submodule handles saving the game
HTomb = (function(HTomb) {
  "use strict";
  var sv = document.createElement("button");
  sv.innerHTML = "save game";
  sv.onclick = function() {
    HTomb.Save.serialize();
  };

  var inpt = document.createElement("input");
  //accept=".json"
  inpt.setAttribute("type","file");
  inpt.setAttribute("id","saves");
  inpt.onchange = function() {
    var f = this.files[0];
    HTomb.Save.access(f);
  };
  document.body.appendChild(sv);
  document.body.appendChild(inpt);

  var json;
  HTomb.Save.serialize = function() {
    var saveGame = {};

    saveGame.things = HTomb.World.Things.table;
    saveGame.levels = HTomb.World.levels;

    saveGame.creatures = HTomb.World.creatures;
    saveGame.items = HTomb.World.items;

    saveGame.features = HTomb.World.features;
    saveGame.zones = HTomb.World.zones;
    saveGame.taskList = HTomb.World.taskList;
    saveGame.dailyCycle = HTomb.World.dailyCycle;
    json = JSON.stringify(saveGame,stringifyThings);
  };

  HTomb.Save.access = function(f) {
    var reader = new FileReader();
    reader.onload = function(e) {
      //var json = e.target.result;
      HTomb.Save.parse(json);
    };
    reader.readAsText(f);
  };

  HTomb.Save.parse = function(js) {
    // Parse it once normally to get the table of thingIds
    var thingParse = JSON.parse(js);
    // Then parse it a second time, replacing the thingIds with the actual things
    var otherParse = JSON.parse(js, function reviveThings(key, val) {
      if (key==="thingId") {
        return thingParse.things[val];
      }
      return val;
    });
    var i, j;
    // Empty the global things table
    while (HTomb.World.Things.table.length>0) {
      HTomb.World.Things.table.pop();
    }
    // Populate the table with saved things
    for (i=0;i<thingParse.things.length;i++) {
      HTomb.World.Things.table.push(thingParse.things[i]);
    }
    var arrays = ["levels","taskList"];
    var objects = ["creatures","items","features","zones","dailyCycle"];
    // restore top-level arrays
    for (i=0; i<arrays.length; i++) {
      var arr = HTomb.World[arrays[i]];
      while (arr.length>0) {
        arr.pop();
      }
      arr = otherParse[arrays[i]];
      for (j=0; j<arr.length; j++) {
        HTomb.World[arrays[i]].push(arr[j]);
      }
    }
    // Restore top-level objects
    for (i=0; i<objects.length; i++) {
      var obj = HTomb.World[objects[i]];
      for (j in obj) {
        delete obj[j];
      }
      obj = otherParse[objects[i]];
      for (j in obj) {
        HTomb.World[objects[i]]=obj[j];
      }
    }
    // Ugh...but doing it this way, we lose all the attached methods.  Dammit.
    // Some additional ideas...
      // Some "things" don't need to be serialized completely.  If they matched the template perfectly, just serialize the template name
      // Other things do need to save their properties.
  };


  var thingTally = 0;
  var notThings = [];
  HTomb.Save.problems = [];
  var stringifyThings = function(key, val) {
    // If it's a simple primitive, serialize it
    if (typeof(val)!=="object" || val===null) {
		    return val;
	  }
    // If the value has a thingId...
    if (val.thingId) {
      // ...then serialize it fully only in the thing table
      if (this===HTomb.World.Things.table) {
        thingTally+=1;
        if (thingTally%100===0) {
          console.log(HTomb.World.Thigns.table.length-thingTally + " things remaining.");
        }
        return val;
      } else {
        // ...elsewhere, simply serialize an ID number
        return {thingId: HTomb.World.Things.table.indexOf(val)};
      }
    // If no thingId, check to see if it has been seen before
    } else if (notThings.indexOf(val)>=0) {
      // ...if so, skip it and document it on a list of "problems"
      if (HTomb.Save.problems.indexOf(val)===-1) {
        HTomb.Save.problems.push([this,key,val]);
      }
      return undefined;
    } else {
      // ...otherwise treat it normally
      notThings.push(val);
      return val;
    }
  };

  return HTomb;
})(HTomb);
