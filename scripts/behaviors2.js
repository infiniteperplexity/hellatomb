// ****** This module implements Behaviors, which are the basic units of functionality for creatures, items, and features
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.Utils.coord;

  HTomb.Things.defineBehavior({
    template: "Player",
    name: "player",
    onAdd: function() {
      HTomb.Player = this.entity;
    }
  });

  HTomb.Things.defineBehavior({
    template: "PointLight",
    name: "pointlight",
    point: null,
    level: 255,
    range: 8,
    each: ["point","level","range"],
    onAdd: function() {
      this.point = this.entity;
    },
    onPlace: function() {
      if (HTomb.World.lights.indexOf(this)===-1) {
        HTomb.World.lights.push(this);
      }
      HTomb.World.validate.lighting();
    },
    onRemove: function() {
      if (HTomb.World.lights.indexOf(this)!==-1) {
        HTomb.World.lights.splice(HTomb.World.lights.indexOf(this),1);
        HTomb.World.validate.lighting();
      }
    }
  })

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

  // The Sight behavior allows a creature to see
  HTomb.Things.defineBehavior({
    template: "Sight",
    name: "sight",
    range: 10,
    onAdd: function(options) {
      options = options || {};
      if (options.range) {
        this.range = options.range;
      }
    },
    getSeen: function() {

    }
  });

  // The Inventory behavior allows a creature to carry things
  HTomb.Things.defineBehavior({
    template: "Inventory",
    name: "inventory",
    capacity: 10,
    onAdd: function() {this.items = HTomb.ItemContainer(); this.items.parent = this;},
    pickup: function(item) {
      var e = this.entity;
      item.item.owned = true;
      item.remove();
      HTomb.GUI.sensoryEvent(this.entity.describe() + " picks up " + item.describe(),e.x,e.y,e.z);
      this.add(item);
      this.entity.ai.acted = true;
    },
    pickupOne: function(i_or_t) {
      var e = this.entity;
      var items = HTomb.World.items[coord(e.x,e.y,e.z)];
      var item = items.takeOne(i_or_t);
      if (item) {
        this.pickup(item);
      }
    },
    pickupSome: function(i_or_t,n) {
      var e = this.entity;
      var items = HTomb.World.items[coord(e.x,e.y,e.z)];
      var item = items.take(i_or_t,n);
      if (item) {
        this.pickup(item);
      }
    },
    drop: function(item) {
      var e = this.entity;
      this.items.remove(item);
      item.place(e.x,e.y,e.z);
      HTomb.GUI.sensoryEvent(this.entity.describe() + " drops " + item.describe(),e.x,e.y,e.z);
      this.entity.ai.acted = true;
    },
    add: function(item) {
      if (this.items.length>=this.capacity) {
        HTomb.GUI.pushMessage("Can't pick that up.");
      } else {
        this.items.push(item);
      }
    }
  });

  // Not yet functional
  HTomb.Things.defineBehavior({
    template: "Attacker",
    name: "attack"
  });
  // The Minion behavior allows a creature to serve a master and take orders
  HTomb.Things.defineBehavior({
    template: "Minion",
    name: "minion",
    master: null,
    each: ["master"],
    setMaster: function(cr) {
      this.master = cr;
      HTomb.Events.subscribe(this,"Destroy");
    },
    onDestroy: function(event) {
      if (event.entity===this.master) {
        this.master = null;
        alert("My master died, haven't set how to handle this yet.");
      }
    }
  });

  HTomb.Things.defineBehavior({
    template: "Master",
    name: "master",
    minions: null,
    taskList: null,
    tasks: null,
    each: ["minions","tasks","taskList"],
    onCreate: function(options) {
      options = options || {};
      this.tasks = options.tasks || [];
      this.minions = [];
      this.taskList = [];
      HTomb.Events.subscribe(this, "Destroy");
    },
    onDestroy: function(event) {
      if (this.minions.indexOf(event.entity)>-1) {
        HTomb.GUI.sensoryEvent(this.entity.describe() + " mourns the death of " + event.entity.describe()+".",this.entity.x,this.entity.y,this.entity.z);
        this.minions.splice(this.minions.indexOf(event.entity),1);
      }
    },
    addMinion: function(cr) {
      this.minions.push(cr);
    },
    removeMinion: function(cr) {
      this.minions.splice(this.minions.indexOf(cr,1));
    },
    designate: function(tsk) {
      tsk.designate(this.entity);
    },
    assignTasks: function() {
      for(var i=0; i<this.taskList.length; i++) {
        var tsk = this.taskList[i];
        if (tsk.assignee!==null) {
          if (tsk.assignee.reference!==undefined && tsk.assignee.reference!==null) {
            tsk.assignee = tsk.assignee.reference;
          } else {
            continue;
          }
        }
        var master = this.entity;
        var minions = this.minions;
        for (var j=0; j<minions.length; j++) {
          if (minions[j].worker===undefined) {
            continue;
          }
          if (minions[j].worker.task!==null) {
            continue;
          }
          if (minions[j].worker===undefined) {
            continue;
          }
          if (minions[j].worker.allowedTasks.indexOf(tsk.template)===-1 && minions[j].worker.allowedTasks.indexOf(tsk.fakeAs)===-1) {
            continue;
          }
          var assigned = tsk.tryAssign(minions[j]);
          if (assigned) {
            break;
          }
        }
      }
    },
    listTasks: function() {
      var tasks = [];
      for (var i=0; i<this.tasks.length; i++) {
        tasks.push(HTomb.Things.templates[this.tasks[i]]);
      }
      return tasks;
    }
  });


  // The SpellCaster behavior maintains a list of castable spells
  HTomb.Things.defineBehavior({
    template: "SpellCaster",
    name: "caster",
    onCreate: function(options) {
      options = options || {};
      options.spells = options.spells || [];
      this.spells = options.spells;
    },
    cast: function(sp) {
      sp.cast(this);
    },
    listSpells: function() {
      var spells = [];
      for (var i=0; i<this.spells.length; i++) {
        spells.push(HTomb.Things.templates[this.spells[i]]);
      }
      return spells;
    }
  });

  // The Movement behavior allows the creature to move
  HTomb.Things.defineBehavior({
    template: "Movement",
    name: "movement",
    // flags for different kinds of movement
    walks: true,
    climbs: true,
    //each: ["walks","climbs","flies","swims"],
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



  return HTomb;
})(HTomb);
