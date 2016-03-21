// ****** This module implements Behaviors, which are the basic units of functionality for creatures, items, and features
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.Utils.coord;

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

  HTomb.Things.defineBehavior({
  	template: "Combat",
  	name: "combat",
    accuracy: 0,
    evasion: 0,
    armor: 0,
    damage: null,
    onCreate: function(options) {
      //options = options || {};
      // is this even necessary?
      //for (var d in options.damage) {
      //  this.damage[d] = options.damage[d];
      //}
    },
  	// worry about multiple attacks later
  	attack: function(thing) {
      // if it's a combatant, you might miss
      HTomb.GUI.sensoryEvent(this.entity.describe() + " attacks " + thing.describe()+".",this.entity.x,this.entity.y,this.entity.z);
      var evade = (thing.combat) ? thing.combat.evasion : 0;
      // basic hit roll
      var roll = Math.random()+(this.accuracy-evade)/10;
      console.log(this.entity.describe() + " rolled " + roll + " to hit.");
      if (roll >= (1/3)) {
        //apply armor in some way?
        thing.body.endure(this);
      }
  	},
  	//should be on the damage packet..//hit: function() {},
  	defend: function() {
      // do nothing for now
  	}
  });

  HTomb.Things.defineBehavior({
  	template: "Body",
  	name: "body",
  	materials: null,
  	endure: function(attack) {
      var damage = attack.damage;
      for (var d in damage) {
        for (var m in this.materials) {
          var n = damage[d];
          n = Math.max(ROT.RNG.getNormal(n,n/2),0);
          var adjusted = Math.round(n*HTomb.Types.templates.Damage.table[d][m]);
          console.log(attack.entity.describe() + " deals " + adjusted + " " + d + " damage to " + this.entity.describe() +"'s " + m);
          this.materials[m].has-=adjusted;
          console.log(this.entity.describe() + " has " + this.materials[m].has + " points left of " + m);
          //chance of death?
          //need to deal damage to every material, based on some kind of cress-reference table...
        }
        for (var m in this.materials) {
          //how do we decide how to die first?  just do it in order I guess...
          if (this.materials[m].has < this.materials[m].needs) {
            this.entity.creature.die();
          }
        }
      }
    },
    onCreate: function(options) {
      this.materials = {};
      options = options || {};
      for (var m in options.materials) {
        this.materials[m] = {};
        // if there's just one number, fall back on a default
        if (typeof(options.materials[m])==="number") {
          this.materials[m].max = options.materials[m];
          this.materials[m].has = options.materials[m];
          this.materials[m].needs = Math.floor(options.materials[m]/2);
        } else {
        // otherwise expect maximum and minimum
          this.materials[m].max = options.materials[m].max;
          this.materials[m].has = options.materials[m].max;
          this.materials[m].needs = options.materials[m].needs;
        }
      }
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
