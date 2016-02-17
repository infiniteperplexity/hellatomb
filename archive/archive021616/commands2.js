// The Commands submodule defines the various things a player can do
HTomb = (function(HTomb) {
  "use strict";

  HTomb.Things.defineBehavior({
    template: "Commands",
    name: "commands",
    tryMoveDir: function(x1, y1) {
      var f = function() {
        tryMove(x1,y1);
      };
      return f;
    },
    tryMove: function(x1, y1) {
      var x = this.entity.x;
      var y = this.entity.y;
      var z = this.entity.z;
      var newx = x+x1;
      var newy = y+y1;
      // If you can't go that way...
      if (this.entity.movement===undefined || HTomb.entity.movement.canPass(newx,newy,z)===false) {
        var square0 = HTomb.Tiles.getSquare(x,y,z);
        var square1 = HTomb.Tiles.getSquare(newx,newy,z);
        // If the way is blocked, try to scramble up or down a slope
        if (square0.terrain.zmove===+1) {
          this.tryMoveUp();
        } else if (square0.terrain.zmove===-1) {
          this.tryMoveDown();
        // If the mobility debug option is enabled, you can go anywhere
        } else if (HTomb.Debug.mobility===true) {
          this.moveEntity(newx,newy,z);
        } else {
          // Tell the player they can't do that
          HTomb.GUI.pushMessage("Can't go that way.");
        }
      } else {
        // Move successfully
        this.moveEntity(newx,newy,z);
      }
    },
    tryMoveUp: function() {
      var x = this.entity.x;
      var y = this.entity.y;
      var z = this.entity.z;
      var square = HTomb.Tiles.getSquare(x,y,z);
      if (square.terrain.zmove===+1) {
        HTomb.GUI.pushMessage("You scramble up the slope.");
        this.moveEntity(x,y,z+1);
      } else if (HTomb.Debug.mobility===true) {
        this.moveEntity(x,y,z+1);
      } else {
        HTomb.GUI.pushMessage("Can't go up here.");
      }
    },
    tryMoveDown: function() {
      var x = this.entity.x;
      var y = this.entity.y;
      var z = this.entity.z;
      var square = HTomb.Tiles.getSquare(x,y,z);
      if (square.feature!==undefined && square.feature.template==="DownSlope") {
        HTomb.GUI.pushMessage("You scramble down the slope.");
        this.moveEntity(x,y,z-1);
      } else if (square.terrain.zmove===-1) {
        HTomb.GUI.pushMessage("You scramble down the slope.");
        this.moveEntity(x,y,z-1);
      }else if (HTomb.Debug.mobility===true) {
        this.moveEntity(x,y,z-1);
      } else {
        HTomb.GUI.pushMessage("Can't go down here.");
      }
    },
    wait: function() {
      HTomb.turn();
    },
    // Describe creatures, items, and features in this square and adjoined slopes
    // This method may be obsolete now that we have "hover"
    glance: function(square) {
      if (square.items) {
        // This should use the listItems method
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
    },
    // Move the player, glance, and spend an action
    moveEntity: function(x,y,z) {
      this.entity.place(x,y,z);
      var square = HTomb.Tiles.getSquare(x,y,z);
      this.glance(square);
      HTomb.turn();
    },
    // Try to pick up items
    pickup: function() {
      var square = this.entity.getSquare();
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
    },
    // Try to drop an item
    drop: function() {
      var p = this.entity;
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
                p.inventory.drop(item);
                HTomb.turn();
                HTomb.GUI.reset();
              };
            }
          );
        }
      }
    },
    // Show a menu of the spells the player can cast
    showSpells: function() {
      GUI.choosingMenu("Choose a spell:", this.entity.caster.spells,
        function(sp) {
          return function() {
            this.entity.caster.cast(sp);
            HTomb.turn();
            HTomb.GUI.reset();
          };
        }
      );
    },
    // Show a menu of the tasks the player can assign
    showJobs: function() {
      GUI.choosingMenu("Choose a task:", this.entity.master.tasks,
        function(task) {
          return function() {
            this.entity.master.designate(task);
            //HTomb.turn();
          };
        }
      );
    }
  });

  return HTomb;
})(HTomb);
