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

  HTomb.Save.serialize = function() {
    var saveGame = {};

    saveGame.levels = HTomb.World.levels;

    saveGame.creatures = HTomb.World.creatures;
    console.log(saveGame);
    //var json = JSON.stringify(saveGame);
    saveGame.items = HTomb.World.items;

    saveGame.features = HTomb.World.features;
    saveGame.zones = HTomb.World.zones;
    console.log("test");
    //saveGame.taskList = HTomb.World.taskList;
    //saveGame.dailyCycle = HTomb.World.dailyCycle;
    //var json = JSON.stringify(saveGame);

  };

  HTomb.Save.access = function(f) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var json = e.target.result;
      HTomb.Save.parse(json);
    };
    reader.readAsText(f);
  };

  HTomb.Save.parse = function(json) {
    var saveGame = JSON.parse(json);
    var arrays = ["levels","taskList"];
    var objects = ["creatures","items","features","zones","dailyCycle"];
    // restore top-level arrays
    var i, j;
    for (i=0; i<arrays.length; i++) {
      var arr = HTomb.World[arrays[i]];
      while (arr.length>0) {
        arr.pop();
      }
      arr = saveGame[arrays[i]];
      for (j=0; j<arr.length; j++) {
        HTomb.World[arrays[i]].push(arr[j]);
      }
    }
    for (i=0; i<objects.length; i++) {
      var obj = HTomb.World[objects[i]];
      for (j in obj) {
        delete obj[j];
      }
      obj = saveGame[objects[i]];
      for (j in obj) {
        HTomb.World[objects[i]]=obj[j];
      }
    }
  };

  return HTomb;
})(HTomb);

/*









  HTomb.Save.init = function() {

  var input = document.getElementById("saves");



  };



  };



};*/
