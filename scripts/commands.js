HTomb = (function(HTomb) {
  "use strict";
  var Commands = HTomb.Commands;
  var Controls = HTomb.Controls;
  var GUI = HTomb.GUI;
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  Commands.tryMoveWest = function() {Commands.tryMove('W');};
  Commands.tryMoveNorth = function() {Commands.tryMove('N');};
  Commands.tryMoveEast = function() {Commands.tryMove('E');};
  Commands.tryMoveSouth = function() {Commands.tryMove('S');};
  Commands.tryMoveNorthWest = function() {Commands.tryMove('NW');};
  Commands.tryMoveNorthEast = function() {Commands.tryMove('NE');};
  Commands.tryMoveSouthWest = function() {Commands.tryMove('SW');};
  Commands.tryMoveSouthEast = function() {Commands.tryMove('SE');};
  Commands.tryMove = function(dir) {
    var x = HTomb.Player._x;
    var y = HTomb.Player._y;
    var z = HTomb.Player._z;
    var newx = x;
    var newy = y;
    if (dir==='N') {
      newy-=1;
    } else if (dir==='NW') {
      newx-=1;
      newy-=1;
    } else if (dir==='NE') {
      newx+=1;
      newy-=1;
    } else if (dir==='S') {
      newy+=1;
    } else if (dir==='SW') {
      newx-=1;
      newy+=1;
    } else if (dir==='SE') {
      newx+=1;
      newy+=1;
    } else if (dir==='W') {
      newx-=1;
    } else if (dir==='E') {
      newx+=1;
    }
    if (HTomb.Player.movement===undefined || HTomb.Player.movement.canPass(newx,newy,z)===false) {
      var square0 = HTomb.World.getSquare(x,y,z);
      var square1 = HTomb.World.getSquare(newx,newy,z);
      if (square0.feature!==undefined && square0.feature.template==="UpSlope" && square1.terrain.solid===true) {
        Commands.tryMoveUp();
      } else if (square0.feature!==undefined && square0.feature.template==="DownSlope" && square1.terrain.fallable===true) {
        Commands.tryMoveDown();
      }
      HTomb.GUI.pushMessage("Can't go that way.");
    } else {
      Commands.movePlayer(newx,newy,z);
    }
  };
  Commands.tryMoveUp = function() {
    var x = HTomb.Player._x;
    var y = HTomb.Player._y;
    var z = HTomb.Player._z;
    var square = HTomb.World.getSquare(x,y,z);
    if (square.feature!==undefined && square.feature.template==="UpSlope") {
      HTomb.GUI.pushMessage("You scramble up the slope.");
      Commands.movePlayer(x,y,z+1);
    } else {
      HTomb.GUI.pushMessage("Can't go up here.");
    }
  };
  Commands.tryMoveDown = function() {
    var x = HTomb.Player._x;
    var y = HTomb.Player._y;
    var z = HTomb.Player._z;
    var square = HTomb.World.getSquare(x,y,z);
    if (square.feature!==undefined && square.feature.template==="DownSlope") {
      HTomb.GUI.pushMessage("You scramble down the slope.");
      Commands.movePlayer(x,y,z-1);
    } else {
      HTomb.GUI.pushMessage("Can't go down here.");
    }
  };
  Commands.look = function(square) {
    if (square.creature) {
      HTomb.GUI.pushMessage("There is " + square.creature.describe() + " here.");
    }
    HTomb.GUI.pushMessage(square.terrain.name + " square at " + square.x +", " + square.y + ", " + square.z + ".");
    Commands.glance(square);
  };
  Commands.glance = function(square) {
    if (square.items) {
      var mesg = "This square contains";
      for (var i = 0; i<square.items.length; i++) {
        mesg = mesg + " " + square.items[i].describe();
        if (i===square.items.length-2) {
          mesg = mesg + ", and";
        } else if (i<square.items.length-1) {
          mesg = mesg + ",";
        }
      }
      HTomb.GUI.pushMessage(mesg+".");
    }
    if (square.feature) {
      HTomb.GUI.pushMessage("There is " + square.feature.describe() + " here.");
    }
  };
  Commands.movePlayer = function(x,y,z) {
    HTomb.Player.place(x,y,z);
    var square = HTomb.World.getSquare(x,y,z);
    Commands.glance(square);
    HTomb.turn();
  };
  Commands.pickup = function() {
    var square = HTomb.Player.getSquare();
    if (!square.items) {
      HTomb.GUI.pushMessage("Nothing here to pick up.");
    } else if (!HTomb.Player.inventory) {
      HTomb.GUI.pushMessage("You cannot carry items.");
    } else if (HTomb.Player.inventory.n >= HTomb.Player.inventory.capacity) {
      HTomb.GUI.pushMessage("You cannot carry any more items.");
    } else {
      // just pick up the first item for now
      var item = square.items[0];
      item.remove();
      HTomb.Player.inventory.add(item);
      HTomb.GUI.pushMessage("You pick up " + item.describe() + ".");
      HTomb.turn();
    }
  };
  Commands.drop = function() {
    var p = HTomb.Player;
    if (!p.inventory) {
      HTomb.GUI.pushMessage("You cannot carry items.");
    } else if (p.inventory.items.length===0) {
      HTomb.GUI.pushMessage("You have no items.");
    } else {
      var item = p.inventory.items[0];
      p.inventory.remove(item);
      item.place(p._x,p._y,p._z);
      HTomb.GUI.pushMessage("You drop " + item.describe() + ".");
      HTomb.turn();
    }
  };
  Commands.showSpells = function() {
    GUI.choosingMenu("Choose a spell:", HTomb.Player.caster.spells,
      function(sp) {
        return function() {
          HTomb.Player.caster.cast(sp);
          HTomb.turn();
          HTomb.GUI.reset();
        };
      }
    );
  };
  Commands.showJobs = function() {
    GUI.choosingMenu("Choose a task:", HTomb.Player.master.tasks,
      function(task) {
        return function() {
          HTomb.Player.master.designate(task);
          //HTomb.turn();
        };
      }
    );
  };
  return HTomb;
})(HTomb);
