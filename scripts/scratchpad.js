//so...how do we handle the AI for ghouls?
// what happens is that if there's no wandering or anything to do, it acquires a target...
// so what we need is several "hooks" in the AI script, where we check for methods...
// also, scripts...

// a small chunk of AI logic
// should it be a type or a thing?  if it's a type it's static...
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


// The Sight behavior allows a creature to see
HTomb.Things.defineBehavior({
  template: "Senses",
  name: "senses",
  sightRange: 10,
  audioRange: 10,
  smellRange: 10,
  darkSight: false,
  onAdd: function(options) {
    options = options || {};
    this.sightRange = options.sightRange || this.sightRange;
    this.audioRange = options.audioRange || this.audioRange;
    this.smellRange = options.smellRange || this.smellRange;
    this.darkSight = options.darkSight || this.darkSight;
  },
  canSee: function(x,y,z) {
    return true;
  },
  getSeen: function() {
    var squares = [];
    return squares;
  },
  canSmell: function(x,y,z) {
    return true;
  },
  getSmelled: function() {
    var squares = [];
    return squares;
  },
  canHear: function(x,y,z) {
    return true;
  },
  getHeard: function() {
    var squares = [];
    return squares;
  }
});

//some ideas...flood find until...flood search...
//...could "sight" become "sense"
