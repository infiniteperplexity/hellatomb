HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var coord = HTomb.coord;

  HTomb.Types.define({
  	template: "Encounter",
  	name: "encounter",
    hostile: true,
    spawn: function() {},
    onDefine: function() {
      if (HTomb.Encounters.table===undefined) {
        HTomb.Encounters.table = [];
      }
      HTomb.Encounters.table.push([this.frequency,this]);
    }
  });
  HTomb.Encounters.roll = function(callb) {
    var cumulative = 0;
    var table;
    if (callb===undefined) {
      table = HTomb.Encounters.table;
    } else {
      table = [];
      for (var k=0; k<HTomb.Encounters.table.length; k++) {
        if (callb(HTomb.Encounters.table[k][1])) {
          if (HTomb.Debug.peaceful && HTomb.Encounters.table[k][1].hostile) {
            continue;
          } else {
            table.push(HTomb.Encounters.table[k]);
          }
        }
      }
    }
    if (table.length===0) {
      return;
    }
    for (var i=0; i<table.length; i++) {
      cumulative+=table[i][0];
    }
    var roll = Math.random()*cumulative;
    cumulative = 0;
    for (var j=0; table.length; j++) {
      cumulative+=table[j][0];
      if (roll<cumulative) {
        table[j][1].spawn();
        break;
      }
    }
  };

  function noCreature(x,y,z) {
    if (HTomb.World.creatures[coord(x,y,z)]===undefined) {
      return true;
    } else {
      return false;
    }
  }
  HTomb.Tiles.getEdgeSquare = function(callb) {
    callb = callb || noCreature;
    var TRIES = 100;
    var tries = 0;
    while (true) {
      tries+=1;
      var x = Math.floor(Math.random()*LEVELW);
      var y = Math.floor(Math.random()*LEVELH);
      if (x>LEVELW/2) {
        x = LEVELW-2;
      } else {
        x = 1;
      }
      if (y>LEVELH/2) {
        y = LEVELH-2;
      } else {
        y = 1;
      }
      var z = HTomb.Tiles.groundLevel(x,y);
      if (callb(x,y,z)) {
        return [x,y,z];
      }
      if (tries>=TRIES) {
        alert("failed to find ")
        return;
      }
    }
  };

  HTomb.Types.defineEncounter({
    template: "GhoulTest",
    name: "ghoul test",
    frequency: 1,
    spawn: function() {
      var c = HTomb.Tiles.getEdgeSquare();
      var cr = HTomb.Things.Ghoul();
      cr.place(c[0],c[1],c[2]);
      console.log("placed a ghoul");
    }
  });

  HTomb.Types.defineEncounter({
    template: "SpiderTest",
    name: "spidertest",
    frequency: 2,
    hostile: false,
    spawn: function() {
      var c = HTomb.Tiles.getEdgeSquare();
      var cr = HTomb.Things.Spider();
      cr.place(c[0],c[1],c[2]);
      console.log("placed a spider");
    }
  });
  //***currently broken based on how ExhumeTask works
  // for (var i in World.items) {
  //   if (World.items[i].template==="Corpse") {
  //     var co = World.items[i];
  //     var f = HTomb.World.features[coord(co.x,co.y,co.z)];
  //     if (f && f.template==="Tombstone") {
  //       var g = Things.Ghast();
  //       g.place(co.x,co.y,co.z);
  //       World.tiles[co.x,co.y,co.z] = Tiles.UpSlopeTile;
  //       var t = Things.ExhumeTask();
  //       t.assignTo(g);
  //       HTomb.GUI.sensoryEvent("You hear an ominous stirring below the earth...",co.x,co.y,co.z);
  //       co.remove();
  //       break;
  //     }
  //   }
  // }





  return HTomb;
})(HTomb);
