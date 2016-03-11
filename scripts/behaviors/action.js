// ****** This module implements Behaviors, which are the basic units of functionality for creatures, items, and features
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.coord;

  // The Movement behavior allows the creature to move
  HTomb.Things.defineBehavior({
    template: "Movement",
    name: "movement",
    // flags for different kinds of movement
    walks: true,
    climbs: true,
    //each: ["walks","climbs","flies","swims"],
    // Walk in one of the eight random directions
    walkRandom: function() {
      //var r = Math.floor(Math.random()*8);
      //var dx = ROT.DIRS[8][r][0];
      //var dy = ROT.DIRS[8][r][1];
      //return this.tryStep(dx,dy);
      var r = Math.floor(Math.random()*26);
      var dx = HTomb.dirs[26][r][0];
      var dy = HTomb.dirs[26][r][1];
      var dz = HTomb.dirs[26][r][2];
      return this.tryStep(dx,dy,dz);
    },
    // Walk along a path toward the target
    walkToward: function(x,y,z) {
      var x0 = this.entity.x;
      var y0 = this.entity.y;
      var z0 = this.entity.z;
      var path = HTomb.Path.aStar(x0,y0,z0,x,y,z,{useLast: false});
      if (path!==false) {
        var square = path[0];
        if (path.length===0) {
          square = [x,y,z];
        }
        return this.tryStep(square[0]-x0,square[1]-y0,square[2]-z0);
      }
      return false;
    },
    // Walk straight away from the target
    walkAway: function(x,y) {
      var x0 = this.entity.x;
      var y0 = this.entity.y;
      var line = HTomb.Path.line(x0,y0,x,y);
      if (line.length<=1) {
        return this.walkRandom();
      }
      var dx = line[1][0] - x0;
      var dy = line[1][1] - y0;
      return this.tryStep(-dx,-dy,0);
    },
    // Try to step in a certain direction
    tryStep: function(dx, dy, dz) {
      var backoffs = HTomb.dirs.getBackoffs(dx, dy, dz);
      var x = this.entity.x;
      var y = this.entity.y;
      var z = this.entity.z;
      for (var i=0; i<backoffs.length; i++) {
        var dir = backoffs[i];
        //var t = HTomb.World.tiles[z][x][y];
        //var tu = HTomb.World.tiles[z+1][x][y];
        //var td = HTomb.World.tiles[z-1][x][y];
        var cr = HTomb.World.creatures[coord(x+dir[0],y+dir[1],z+dir[2])];
        //var f = HTomb.World.features[coord(x+dir[0],y+dir[1],z+dir[2])];
        // modify this to allow non-player creatures to displace
        if (this.canMove(x+dir[0],y+dir[1],z+dir[2])===false) {
          continue;
        } else if (cr) {
          if (cr.ai && cr.ai.isFriendly && cr.player===undefined && cr.movement) {
            // try displacing only half the time?
            if (Math.random()<=0.5) {
              this.displaceCreature(cr);
            } else {
              continue;
            }
          } else {
            continue;
          }
        } else {
          this.stepTo(x+dir[0],y+dir[1],z+dir[2]);
          return true;
        }
      }
      console.log("creature couldn't move.");
      return false;
    },
    displaceCreature: function(cr) {
      var x0 = this.entity.x;
      var y0 = this.entity.y;
      var z0 = this.entity.z;
      var x = cr.x;
      var y = cr.y;
      var z = cr.z;
      cr.remove();
      this.entity.place(x,y,z);
      cr.place(x0,y0,z0);
      HTomb.GUI.sensoryEvent(this.entity.describe() + " displaces " + cr.describe() + ".",x,y,z);
      if (this.entity.ai) {
        this.entity.ai.acted = true;
      }
      if (cr.ai) {
        cr.ai.acted = true;
      }
    },
    stepTo: function(x,y,z) {
      this.entity.place(x,y,z);
      if (this.entity.ai) {
        this.entity.ai.acted = true;
      }
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
      var dx = x-this.entity.x;
      var dy = y-this.entity.y;
      var dz = z-this.entity.z;
      var c = coord(x,y,z);
      var zone = HTomb.World.zones[c];
      if (zone && zone.template==="ForbiddenZone" && this.entity.minion && zone.task.assigner===this.entity.minion.master) {
        return false;
      }
      // can't go through solid feature
      var feature = HTomb.World.features[c];
      if (feature && feature.solid===true && this.phases!==true) {
        return false;
      }
      // can't go through solid terrain
      var terrain = HTomb.World.tiles[z][x][y];
      if (terrain.solid===true && this.phases!==true) {
        return false;
      }
      // can't walk over a pit
      if (terrain.fallable===true && this.flies!==true) {
        return false;
      }
      var turf = HTomb.World.turfs[c];
      if (turf && turf.liquid && this.swims!==true) {
        return false;
      }
      // non-flyers can't climb diagonally
      if (this.flies!==true && dz!==0 && (dx!==0 || dy!==0)) {
        return false;
      // non-flyers need a slope in order to go up
      }
      var t = HTomb.World.tiles[z-dz][x-dx][y-dy];
      if (dz===+1 && this.flies!==true && t.zmove!==+1) {
        return false;
      }
      var tu = HTomb.World.tiles[z+1-dz][x-dx][y-dy];
      // non-phasers can't go through a ceiling
      if (dz===+1 && this.phases!==true && tu.fallable!==true && tu.zmove!==-1) {
        return false;
      }
      // non-phasers can't go down through a floor
      if (dz===-1 && t.fallable!==true && t.zmove!==-1 && this.phases!==true) {
        return false;
      }
      if (this.walks===true) {
        return true;
      }
      if (this.flies===true) {
        return true;
      }
      if (this.swims===true && turf && turf.liquid) {
        return true;
      }
      return false;
    }
  });

  HTomb.Things.defineBehavior({
    template: "AI",
    name: "ai",
    // unimplemented
    target: null,
    // unimplemented
    mood: null,
    acted: false,
    each: ["target","mood","acted"],
    // We may want to save a path for the entity
    onAdd: function(){this.entity.path = [];},
    isFriendly: function() {return true;},
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
          this.patrol(this.entity.minion.master.x,this.entity.minion.master.y,this.entity.minion.master.z);
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
      var dist = HTomb.Path.distance(this.entity.x,this.entity.y,x,y);
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

  return HTomb;
})(HTomb);
