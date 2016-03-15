// The Commands submodule defines the various things a player can do
HTomb = (function(HTomb) {
  "use strict";
  var Commands = HTomb.Commands;
  var Controls = HTomb.Controls;
  var GUI = HTomb.GUI;
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.coord;
  Commands.tryMoveWest = function() {Commands.tryMove('W');};
  Commands.tryMoveNorth = function() {Commands.tryMove('N');};
  Commands.tryMoveEast = function() {Commands.tryMove('E');};
  Commands.tryMoveSouth = function() {Commands.tryMove('S');};
  Commands.tryMoveNorthWest = function() {Commands.tryMove('NW');};
  Commands.tryMoveNorthEast = function() {Commands.tryMove('NE');};
  Commands.tryMoveSouthWest = function() {Commands.tryMove('SW');};
  Commands.tryMoveSouthEast = function() {Commands.tryMove('SE');};
  Commands.tryMove = function(dir) {
    var x = HTomb.Player.x;
    var y = HTomb.Player.y;
    var z = HTomb.Player.z;
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
    var square = HTomb.Tiles.getSquare(newx,newy,z);
    // If you can't go that way...
    if (HTomb.Player.movement) {
      if (HTomb.Player.movement.canPass(newx,newy,z)) {
        Commands.movePlayer(newx,newy,z);
      } else if (HTomb.World.creatures[coord(newx,newy,z)]!==undefined) {
        var c = HTomb.World.creatures[coord(newx,newy,z)];
        if (c.ai && c.ai.hostile===false) {
          Commands.displaceCreature(newx,newy,z);
        } else {
          HTomb.Player.combat.attack(c);
          HTomb.turn();
        }
      } else if (square.feature && square.feature.activate) {
        square.feature.activate();
      } else if (HTomb.Debug.mobility===true) {
        Commands.movePlayer(newx,newy,z);
      } else if (HTomb.World.tiles[z][x][y].zmove===+1) {
        Commands.tryMoveUp();
      } else if (HTomb.World.tiles[z][x][y].zmove===-1) {
        Commands.tryMoveDown();
      } else {
        HTomb.GUI.pushMessage("Can't go that way.");
      }
    } else {
      HTomb.GUI.pushMessage("You can't move!");
    }
  };
  Commands.tryMoveUp = function() {
    var x = HTomb.Player.x;
    var y = HTomb.Player.y;
    var z = HTomb.Player.z;
    var square = HTomb.Tiles.getSquare(x,y,z);
    if (HTomb.Debug.mobility===true) {
      Commands.movePlayer(x,y,z+1);
    } else if (square.terrain.zmove===+1) {
      if (HTomb.Player.movement.canPass(x,y,z+1) && HTomb.World.tiles[z+1][x][y].zmove===-1) {
        HTomb.GUI.pushMessage("You scramble up the slope.");
        Commands.movePlayer(x,y,z+1);
        // This is allows player to move through floors
      } else if (HTomb.World.creatures[coord(x,y,z+1)]) {
        Commands.displaceCreature(x,y,z+1);
      }
    } else {
      HTomb.GUI.pushMessage("Can't go up here.");
    }
  };
  Commands.tryMoveDown = function() {
    var x = HTomb.Player.x;
    var y = HTomb.Player.y;
    var z = HTomb.Player.z;
    var square = HTomb.Tiles.getSquare(x,y,z);
    if (HTomb.Debug.mobility===true) {
      Commands.movePlayer(x,y,z-1);
    } else if (square.terrain.zmove===-1) {
      if (HTomb.Player.movement.canPass(x,y,z-1)) {
        HTomb.GUI.pushMessage("You scramble down the slope.");
        Commands.movePlayer(x,y,z-1);
        // This is allows player to move through floors
      } else if (HTomb.World.creatures[coord(x,y,z-1)]) {
        Commands.displaceCreature(x,y,z-1);
      }
    } else {
      HTomb.GUI.pushMessage("Can't go down here.");
    }
  };
  Commands.act = function() {
    function activate(x,y,z) {
      var f = HTomb.World.features[coord(x,y,z)];
      if (f && f.activate) {
        f.activate();
        HTomb.turn();
      }
    }
    HTomb.GUI.pickDirection(activate);
  }
  // Do nothing
  Commands.wait = function() {
    HTomb.turn();
  };
  // Describe creatures, items, and features in this square and adjoined slopes
  // This method may be obsolete now that we have "hover"
  Commands.look = function(square) {
    if (square.creature) {
      HTomb.GUI.pushMessage("There is " + square.creature.describe() + " here.");
    }
    if (square.feature) {
      var seeSquare = null;
      var mesg = null;
      var i;
      if (square.feature.zView===+1) {
        seeSquare = HTomb.Tiles.getSquare(square.x,square.y,square.z+1);
        if (seeSquare.creature) {
          HTomb.GUI.pushMessage("There is " + square.creature.describe() + " above here.");
        }
        if (seeSquare.items) {
          mesg = "The square above contains";
          for (i = 0; i<seeSquare.items.length; i++) {
            mesg = mesg + " " + seeSquare.items[i].describe();
            if (i===seeSquare.items.length-2) {
              mesg = mesg + ", and";
            } else if (i<seeSquare.items.length-1) {
              mesg = mesg + ",";
            }
          }
          HTomb.GUI.pushMessage(mesg+".");
        }
      } else if (square.feature.zView===-1) {
        seeSquare = HTomb.Tiles.getSquare(square.x,square.y,square.z-1);
        if (seeSquare.creature) {
          HTomb.GUI.pushMessage("There is " + square.creature.describe() + " below here.");
        }
        if (seeSquare.items) {
          mesg = "The square below contains";
          for (i = 0; i<seeSquare.items.length; i++) {
            mesg = mesg + " " + seeSquare.items[i].describe();
            if (i===seeSquare.items.length-2) {
              mesg = mesg + ", and";
            } else if (i<seeSquare.items.length-1) {
              mesg = mesg + ",";
            }
          }
          HTomb.GUI.pushMessage(mesg+".");
        }
      }
    }
    HTomb.GUI.pushMessage(square.terrain.name + " square at " + square.x +", " + square.y + ", " + square.z + ".");
    Commands.glance(square);
  };
  // A quick glance for when the player enters the square
  Commands.glance = function(square) {
    if (square.items) {
      // This should use the listItems method
      var mesg = square.items.list();
      HTomb.GUI.pushMessage("You see " + mesg + " here.");
    }
    if (square.feature) {
      HTomb.GUI.pushMessage("There is " + square.feature.describe() + " here.");
    }
  };
  // Move the player, glance, and spend an action
  Commands.movePlayer = function(x,y,z) {
    HTomb.Player.place(x,y,z);
    var square = HTomb.Tiles.getSquare(x,y,z);
    Commands.glance(square);
    HTomb.turn();
  };
  Commands.displaceCreature = function(x,y,z) {
    var p = HTomb.Player;
    var x0 = HTomb.Player.x;
    var y0 = HTomb.Player.y;
    var z0 = HTomb.Player.z;
    var cr = HTomb.World.creatures[coord(x,y,z)];
    cr.remove();
    HTomb.Player.place(x,y,z);
    cr.place(x0,y0,z0);
    HTomb.GUI.pushMessage(HTomb.Player.describe() + " displaces " + cr.describe() + ".");
    Commands.glance(HTomb.Tiles.getSquare(x,y,z));
    HTomb.turn();

  };
  // Try to pick up items
  Commands.pickup = function() {
    var p = HTomb.Player;
    var square = HTomb.Tiles.getSquare(p.x,p.y,p.z);
    if (!square.items) {
      HTomb.GUI.pushMessage("Nothing here to pick up.");
    } else if (!HTomb.Player.inventory) {
      HTomb.GUI.pushMessage("You cannot carry items.");
    } else if (HTomb.Player.inventory.n >= HTomb.Player.inventory.capacity) {
      HTomb.GUI.pushMessage("You cannot carry any more items.");
    } else {
      if (square.items.length===1) {
        HTomb.Player.inventory.pickup(square.items[0]);
        HTomb.turn();
      } else {
        // If there are multiple items, display a menu
        GUI.choosingMenu("Choose an item:",square.items,
          function(item) {
            return function() {
              HTomb.Player.inventory.pickup(item);
              HTomb.turn();
              HTomb.GUI.reset();
            };
          }
        );
      }
    }
  };
  // Try to drop an item
  Commands.drop = function() {
    var p = HTomb.Player;
    if (!p.inventory) {
      HTomb.GUI.pushMessage("You cannot carry items.");
    } else if (p.inventory.items.length===0) {
      HTomb.GUI.pushMessage("You have no items.");
    } else {
      if (p.inventory.items.length===1) {
        p.inventory.drop(p.inventory.items[0]);
      } else {
        // If the player has multiple items, display a menu
        GUI.choosingMenu("Choose an item:",p.inventory.items,
          function(item) {
            return function() {
              HTomb.Player.inventory.drop(item);
              HTomb.turn();
              HTomb.GUI.reset();
            };
          }
        );
      }
    }
  };
  Commands.inventory = function() {
    var p = HTomb.Player;
    if (!p.inventory) {
      HTomb.GUI.pushMessage("You cannot carry items.");
    } else if (p.inventory.items.length===0) {
      HTomb.GUI.pushMessage("You have no items.");
    } else {
        // If the player has multiple items, display a menu
      GUI.choosingMenu("You are carrying:",p.inventory.items,
        function(item) {
          return function() {
            HTomb.GUI.reset();
          };
        }
      );
    }
  };
  // Show a menu of the spells the player can cast
  Commands.showSpells = function() {
    //var spells = [];
    //for (var i=0;)
    GUI.choosingMenu("Choose a spell:", HTomb.Player.caster.listSpells(),
      function(sp) {
        return function() {
          HTomb.Player.caster.cast(sp);
        };
      }
    );
  };
  // Show a menu of the tasks the player can assign
  Commands.showJobs = function() {
    GUI.choosingMenu("Choose a task:", HTomb.Player.master.listTasks(),
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
