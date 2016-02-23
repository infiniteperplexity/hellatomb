// ****** This module implements Behaviors, which are the basic units of functionality for creatures, items, and features
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.coord;

  HTomb.Things.defineBehavior({
    template: "Player",
    name: "player",
    init: function() {
      HTomb.Player = this.entity;
    }
  });
  // The Sight behavior allows a creature to see
  HTomb.Things.defineBehavior({
    template: "Sight",
    name: "sight",
    range: 10,
    init: function(options) {
      options = options || {};
      if (options.range) {
        this.range = options.range;
      }
    }
  });

  // The Movement behavior allows the creature to move
  HTomb.Things.defineBehavior({
    template: "Movement",
    name: "movement",
    // flags for different kinds of movement
    walks: true,
    climbs: true,
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
        var t = HTomb.World.tiles[z+dir[2]][x+dir[0]][y+dir[1]];
        var cr = HTomb.World.creatures[coord(x+dir[0],y+dir[1],z+dir[2])];
        // modify this to allow non-player creatures to displace
        if (this.canMove(x+dir[0],y+dir[1],z+dir[2])===false) {
          continue;
        } else if (dir[2]===+1 && (this.flies===true || (t.zmove===+1 && this.climbs===true && dir[0]===0 && dir[1]===0))) {
          if (cr) {
            if (cr.ai && cr.ai.isFriendly()) {
              this.displaceCreature(cr);
              return true;
            } else {
              continue;
            }
          } else {
            this.stepTo(x+dir[0],y+dir[1],z+dir[2]);
            return true;
          }
        } else if (  dir[2]===-1 && (this.flies===true || (t.zmove===-1 && this.climbs===true && dir[0]===0 && dir[1]===0))) {
          if (cr) {
            if (cr.ai && cr.ai.isFriendly()) {
              this.displaceCreature(cr);
              return true;
            } else {
              continue;
            }
          } else {
            this.stepTo(x+dir[0],y+dir[1],z+dir[2]);
            return true;
          }
        } else if (this.walks===true) {
          if (cr) {
            if (cr.ai && cr.ai.isFriendly()) {
              this.displaceCreature(cr);
              return true;
            } else {
              continue;
            }
          } else {
            this.stepTo(x+dir[0],y+dir[1],z+dir[2]);
            return true;
          }
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
      HTomb.GUI.pushMessage(this.entity.describe() + " displaces " + cr.describe() + ".");
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


  // The Inventory behavior allows a creature to carry things
  HTomb.Things.defineBehavior({
    template: "Inventory",
    name: "inventory",
    capacity: 10,
    init: function() {this.items = [];},
    pickup: function(item) {
      item.remove();
      this.add(item);
      HTomb.GUI.pushMessage(this.entity.describe() + " picks up " + item.describe());
      this.entity.ai.acted = true;
    },
    drop: function(item) {
      var e = this.entity;
      this.remove(item);
      item.place(e.x,e.y,e.z);
      HTomb.GUI.pushMessage(this.entity.describe() + " drops " + item.describe());
      this.entity.ai.acted = true;
    },
    add: function(item) {
      if (this.items.length>=this.capacity) {
        HTomb.GUI.pushMessage("Can't pick that up.");
      } else if (item.stack) {
        item.stack.stackInto(this.items);
      } else {
        this.items.push(item);
      }
    },
    remove: function(item) {
        var indx = this.items.indexOf(item);
        if (indx===-1) {
          HTomb.GUI.pushMessage("Can't remove that");
        } else {
          this.items.splice(indx,1);
        }
    }
  });

  // Not yet functional
  HTomb.Things.defineBehavior({
    template: "Attacker",
    name: "attack"
  });
  HTomb.Things.defineBehavior({
    template: "Defender",
    name: "defend",
    hp: 10,
    maxhp: 10,
    each: ["hp","maxhp"]
  });

  // The Minion behavior allows a creature to serve a master and take orders
  HTomb.Things.defineBehavior({
    template: "Minion",
    name: "minion",
    master: null,
    task: null,
    each: ["master","task"],
    setMaster: function(cr) {
      this.master = cr;
    },
    onAssign: function(tsk) {
      this.task = tsk;
      HTomb.Debug.pushMessage(this.entity.describe() + " was assigned " + tsk.describe());
    },
    unassign: function() {
      HTomb.Debug.pushMessage(this.entity.describe() + " was unassigned from " + this.task.describe());
      this.task = null;
    }
  });

  // The Master behavior maintains a list of minions and assignable tasks
  HTomb.Things.defineBehavior({
    template: "Master",
    name: "master",
    minions: null,
    taskList: null,
    each: ["minions","tasks","taskList"],
    onCreate: function(options) {
      options = options || {};
      options.tasks = options.tasks || [];
      this.tasks = options.tasks;
      this.minions = [];
      this.taskList = [];
    },
    addMinion: function(cr) {
      this.minions.push(cr);
    },
    removeMinion: function(cr) {
      this.minions.splice(this.minions.indexOf(cr,1));
    },
    designate: function(tsk) {
      tsk.designate(this);
    },
    assignTasks: function() {
      for(var i=0; i<this.taskList.length; i++) {
        var tsk = this.taskList[i];
        if (tsk.assignee!==null) {
          continue;
        }
        var master = this.entity;
        var minions = this.minions;
        // maybe should shuffle this only once per turn?
        //minions = minions.randomize(); //this randomization function erases the original
        for (var j=0; j<minions.length; j++) {
          if (minions[j].minion.task!==null) {
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

  // The Stackable behavior allows items to be stacked into piles
  HTomb.Things.defineBehavior({
    template: "Stackable",
    name: "stack",
    maxn: 10,
    n: 1,
    each: ["n","maxn"],
    stackInto: function(arr) {
      var one;
      var two;
      for (var i=0; i<arr.length; i++) {
        if ((this.n>0) && (arr[i].template===this.entity.template) && (arr[i].stack.n<arr[i].stack.maxn)) {
          one = this.n;
          two = arr[i].stack.n;
          if ((one+two)>this.maxn) {
            arr[i].stack.n = this.maxn;
            this.n = one+two-this.maxn;
          } else {
            arr[i].stack.n = one+two;
            this.n = 0;
          }
        }
      }
      if (this.n>0) {
        if (this.n>1) {
        }
        arr.push(this.entity);
      }
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

  // The Construction behavior keeps track of steps until completion
  HTomb.Things.defineBehavior({
    template: "Durability",
    name: "Durability",
    durability: 10,
    each: ["durability"]
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
    init: function(){this.entity.path = [];},
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
