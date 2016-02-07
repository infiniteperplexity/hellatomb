// ************ This submodule contains the most complex Behaviors related to creature activities
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;

  // The AI behavior allows creatures to choose actions
  HTomb.Behavior.define({
    template: "AI",
    name: "ai",
    // unimplemented
    target: null,
    // unimplemented
    mood: null,
    acted: false,
    // We may want to save a path for the entity
    init: function(){this.entity.path = [];},
    act: function() {
      // If the entity is the player, don't choose for it...maybe this should be a Behavior?
      if (this.entity===HTomb.Player) {
        return false;
      }
      // If the creature has already acted, bail out
      if (this.acted===true) {
        this.acted = false;
        return false;
      }
      // If the creature is a minion...
      if (this.entity.minion) {
        // If it has a task assigned, then run the AI for the task
        if (this.entity.minion.task) {
          this.entity.minion.task.ai();
        } else {
          // Otherwise, patrol around the creature's master
          this.patrol(this.entity.minion.master._x,this.entity.minion.master._y,this.entity.minion.master._z);
        }
      }
      // Otherwise, wander randomly
      if (this.acted===false) {
        this.wander();
      }
      if (this.acted===false) {
        HTomb.Debug.pushMessage("creature failed to act!");
      }
      // Reset activity for next turn
      this.acted = false;
    },
    // A patrolling creature tries to stay within a certain orbit of a target square
    patrol: function(x,y,z,min,max) {
      min = min || 2;
      max = max || 5;
      if (!this.entity.movement) {
        return false;
      }
      var dist = HTomb.Path.distance(this.entity._x,this.entity._y,x,y);
      if (dist<min) {
        this.acted = this.entity.movement.walkAway(x,y,z);
      } else if (dist>max) {
        this.acted = this.entity.movement.walkToward(x,y,z);
      } else {
        this.acted = this.entity.movement.walkRandom();
      }
    },
    // A wandering creature walks randomly...so far it won't scale slopes
    wander: function() {
      if (!this.entity.movement) {
        return false;
      }
      this.acted = this.entity.movement.walkRandom();
    }
  });

  // The Movement behavior allows the creature to move
  HTomb.Behavior.define({
    template: "Movement",
    name: "movement",
    // flags for different kinds of movement
    walks: true,
    climbs: true,
    // Walk in one of the eight random directions
    walkRandom: function() {
      var r = Math.floor(Math.random()*8);
      var dx = ROT.DIRS[8][r][0];
      var dy = ROT.DIRS[8][r][1];
      return this.tryStep(dx,dy);
    },
    // Walk along a path toward the target
    walkToward: function(x,y,z) {
      var x0 = this.entity._x;
      var y0 = this.entity._y;
      var z0 = this.entity._z;
      var path = HTomb.Path.aStar(x0,y0,z0,x,y,z,{useLast: false});
      if (path!==false) {
        var square = path[0];
        return this.tryStep(square[0]-x0,square[1]-y0,square[2]-z0);
      }
      return false;
    },
    // Walk straight away from the target
    walkAway: function(x,y) {
      var x0 = this.entity._x;
      var y0 = this.entity._y;
      var line = HTomb.Path.line(x0,y0,x,y);
      // need to handle errors somehow
      var dx = line[1][0] - x0;
      var dy = line[1][1] - y0;
      return this.tryStep(-dx,-dy);
    },
    // Try to step in a certain direction
    tryStep: function(dx, dy, dz) {
      var x = this.entity._x;
      var y = this.entity._y;
      var z = this.entity._z;
      // Move up or down
      if (dz) {
        if(this.climbs===undefined) {
          return false;
        }
        var p = HTomb.World.portals[x*LEVELW*LEVELH+y*LEVELH+z];
        if (p) {
          if (p[0]===x+dx && p[1]===y+dy && p[2]===z+dz) {
            this.entity.place(x+dx,y+dy,z+dz);
            return true;
          }
        }
      }
      var i0;
      var one;
      var two;
      var dirs = ROT.DIRS[8];
      // Try moving in the exact direction
      if (this.canPass(x+dx,y+dy,z) && this.canMove(x+dx, y+dy,z)) {
        this.entity.place(x+dx,y+dy,z);
        return true;
      } else for (var i=0; i<8; i++) {
        if (dx===dirs[i][0] && dy===dirs[i][1]) {
          i0 = i;
          break;
        }
      }
      // Then try moving in other nearby directions
      for (i=1; i<5; i++) {
        one = (i0+i)%8;
        two = (i0-i>=0) ? i0-i : 8+i0-i;
        if (Math.random>=0.5) {
          //perform XOR swap
          one = one^two;
          two = one^two;
          one = one^two;
        }
        dx = dirs[one][0];
        dy = dirs[one][1];
        if (this.canPass(x+dx,y+dy,z) && this.canMove(x+dx, y+dy,z)) {
          this.entity.place(x+dx,y+dy,z);
          return true;
        }
        dx = dirs[two][0];
        dy = dirs[two][1];
        if (this.canPass(x+dx,y+dy,z) && this.canMove(x+dx, y+dy,z)) {
          this.entity.place(x+dx,y+dy,z);
          return true;
        }
      }
      console.log("creature couldn't move.");
      return false;
    },
    moveTo: function(x,y,z) {
      // unimplemented...use action points?
    },
    // If the square is crossable and unoccupied
    canPass: function(x,y,z) {
      if (this.canMove(x,y,z)===false) {
        return false;
      }
      var square = HTomb.Tiles.getSquare(x,y,z);
      if (square.creature) {
        return false;
      }
      return true;
    },
    // If the square is crossable for this creature
    canMove: function(x,y,z) {
      if (x<0 || x>=LEVELW || y<0 || y>=LEVELH) {
        return false;
      }
      var square = HTomb.Tiles.getSquare(x,y,z);
      if (square.terrain.solid===true && this.phases===undefined) {
        return false;
      } else if (square.terrain.fallable===true && this.flies===undefined) {
        //if (square.feature!==undefined && square.feature.template==="DownSlope") {
        //  return true;
        //} else {
          return false;
        //}
      } else if (this.walks===true) {
        return true;
      } else {
        return false;
      }
    }
  });

  // The Worker behavior allows a creature to build, dig, and perform other tasks
  // This might get split into sub-behaviors
  HTomb.Behavior.define({
    template: "Worker",
    name: "worker",
    dig: function(x,y,z) {
      var coord = x*LEVELW*LEVELH + y*LEVELH + z;
      var feature = HTomb.World.features[coord];
      if (feature) {
        // If there is an incomplete pit, work on completing it
        if (feature.template==="IncompletePit") {
          feature.construction.stepsLeft-=1;
          if (feature.construction.stepsLeft<=0) {
            // If the pit is completed, remove the incomplete pit
            feature.remove();
            // If the pit was dug in the ground...
            if (HTomb.World.levels[z].grid[x][y]===HTomb.Tiles.FLOORTILE) {
              // ...then place a pit and drop one level...
              //HTomb.Entity.create("Pit").place(x,y,z);
              z-=1;
            }
            // ...otherwise just empty out the current square
            HTomb.Tiles.emptySquare(x,y,z);
            // Explore the bottom of the pit
            HTomb.Tiles.explore(x,y,z);
            // Clean up the DigZone if there was one...bad place to do this
            var zone = HTomb.World.zones[coord];
            if (zone && zone.template==="DigZone") {
              zone.remove();
            }
          }
        } else {
          // Clear out an existing feature to make room for digging
          console.log(this.entity.describe() + " removes " + feature.describe() + " to make room for digging.");
          feature.remove();
        }
      } else {
        // Begin digging by creating an incomplete pit
        HTomb.Entity.create("IncompletePit").place(x,y,z);
      }
      // Spend action
      this.entity.ai.acted = true;
    },
    build: function(x,y,z) {
      var coord = x*LEVELW*LEVELH + y*LEVELH + z;
      var feature = HTomb.World.features[coord];
      if (feature) {
        // If there is an incomplete wall here, work on completing it
        if (feature.template==="IncompleteWall") {
          feature.construction.stepsLeft-=1;
          if (feature.construction.stepsLeft<=0) {
            // If it is completed, remove the incomplete wall...
            feature.remove();
            // ...and fill in the square
            HTomb.Tiles.fillSquare(x,y,z);
            // Remove the BuildZone...bad place to do this
            var zone = HTomb.World.zones[coord];
            if (zone && zone.template==="BuildZone") {
              zone.remove();
            }
          }
        } else {
          // Remove another feature to make room for building
          console.log(this.entity.describe() + " removes " + feature.describe() + " to make room for building.");
          feature.remove();
        }
      } else {
        // Begin constructing a wall
        HTomb.Entity.create("IncompleteWall").place(x,y,z);
      }
      // Spend action
      this.entity.ai.acted = true;
    }
  });

  return HTomb;
})(HTomb);
