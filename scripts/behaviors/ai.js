// ****** This module implements Behaviors, which are the basic units of functionality for creatures, items, and features
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.coord;

/*

So...right now we have somewhat AI-like behavior split among Movement and
AI...so...what does Movement contain?
- It has walkTowards, walkAway, and walkRandom.  One could possibly justify those there.
- tryStep is a weird one...like probably properly an AI thing.  I'm thinking Movement
shouldn't be all composit, whereas AI should.  So wait...can anything every Move without AI?
Eh.
So...

*/
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
        var cr = HTomb.World.creatures[coord(x+dir[0],y+dir[1],z+dir[2])];
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
      console.log(this.entity);
      console.log("creature couldn't move.");
      return false;
    },
  });

  HTomb.Things.defineBehavior({
    template: "AI",
    name: "ai",
    // unimplemented
    target: null,
    HTomb.Types.define({
      template: "Routine",
      name: "routine",
      act: function(ai) {
        if (false) {
          ai.acted = true;
        }
      }
    });

    HTomb.Types.defineRoutine({
      template: "ServeMaster",
      name: "serve master",
      act: function(ai) {
        if (ai.entity.minion.task) {
          ai.entity.minion.task.ai();
        } else {
          // Otherwise, patrol around the creature's master
          // or maybe check for tasks now?
          ai.patrol(ai.entity.minion.master.x,ai.entity.minion.master.y,ai.entity.minion.master.z);
        }
      }
    });
    HTomb.Types.defineRoutine({
      template: "WanderAimlessly",
      name: "wander aimlessly",
      act: function(ai) {
        ai.wander();
      }
    });

    HTomb.Types.defineRoutine({
      template: "HuntDeadThings",
      name: "hunt dead things",
      act: function(ai) {
          // should this hunt in sight range first?
          if (ai.target===null) {
            var zombies = [];
            for (var c in HTomb.World.creatures) {
              var cr = HTomb.World.creatures[c];
              if (c.template==="Zombie") {

              }
            }
          }
        }
      }
    });

    // unimplemented
    team: null,
    //allegiance: null,
    acted: false,
    each: ["target","mood","acted"],
    // We may want to save a path for the entity
    onAdd: function(){this.entity.path = [];},
    setTeam: function(team) {
      //feeling ambivalent about tracking teams...
      this.team = team;
    },
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
      // Temporary: If the creature is hostile...
      if (this.acted===false && this.hostile===true) {
        this.target = HTomb.Player;
        if (HTomb.Tiles.isTouchableFrom(this.target.x, this.target.y,this.target.z, this.entity.x, this.entity.y, this.entity.z)) {
          this.entity.combat.attack(this.target);
          this.acted = true;
        } else {
          this.entity.movement.walkToward(this.target.x,this.target.y,this.target.z);
        }
      }
      // If the creature is a minion...
      if (this.acted===false && this.entity.minion) {
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
        console.log(this.entity);
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


  HTomb.Types.define({
    template: "Team",
    name: "team",
    members: null,
    enemies: null,
    allies: null,
    onDefine: function() {
      this.members = this.members || [];
      this.enemies = this.enemies || [];
      this.allies = this.allies || [];
    }
  });


  HTomb.Things.defineBehavior({
    template: "AI",
    name: "ai",
    // unimplemented
    target: null,
    // unimplemented
    team: null,
    //allegiance: null,
    acted: false,
    each: ["target","mood","acted"],
    // We may want to save a path for the entity
    onAdd: function(){
      this.entity.path = [];
      this.entity.routine = [];
      routines.push(HTomb.Routines.CheckForHostile);
      routines.push(HTomb.Routines.ServeMaster);
      routines.push(HTomb.Routines.WanderAimlessly);
    },
    setTeam: function(team) {
      //feeling ambivalent about tracking teams...
      this.team = team;
    },
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
      // Temporary: If the creature is hostile...
      if (this.acted===false && this.hostile===true) {
        this.target = HTomb.Player;
        if (HTomb.Tiles.isTouchableFrom(this.target.x, this.target.y,this.target.z, this.entity.x, this.entity.y, this.entity.z)) {
          this.entity.combat.attack(this.target);
          this.acted = true;
        } else {
          this.entity.movement.walkToward(this.target.x,this.target.y,this.target.z);
        }
      }
      // If the creature is a minion...
      if (this.acted===false && this.entity.minion) {
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
        console.log(this.entity);
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

  // the player and affiliated minions
  HTomb.Types.defineTeam({
    template: "PlayerTeam",
    name: "player"
  });

  HTomb.Types.defineTeam({
    template: "DefaultTeam",
    name: "default"
  });

  // non-aggressive animals
  HTomb.Types.defineTeam({
    template: "AnimalTeam",
    name: "animals"
  });

  HTomb.Types.defineTeam({
    template: "GhoulTeam",
    name: "ghouls",
    hates: ["PlayerTeam"]
  });


  return HTomb;
})(HTomb);
