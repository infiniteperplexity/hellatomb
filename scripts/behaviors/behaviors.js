// ****** This module implements Behaviors, which are the basic units of functionality for creatures, items, and features
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.coord;

  HTomb.Things.defineBehavior({
    template: "Player",
    name: "player",
    onAdd: function() {
      HTomb.Player = this.entity;
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
    }
  });

  // The Inventory behavior allows a creature to carry things
  HTomb.Things.defineBehavior({
    template: "Inventory",
    name: "inventory",
    capacity: 10,
    onAdd: function() {this.items = [];},
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
          if (minions[j].worker===undefined) {
            continue;
          }
          if (minions[j].worker.allowedTasks.indexOf(tsk.template)===-1 && minions[j].worker.allowedTasks.indexOf(tsk.fakeAs)===-1) {
            console.log(tsk.template);
            continue;
          }
          console.log("trying at least");
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
    template: "Worker",
    name: "worker",
    allowedTasks: ["DigTask","BuildTask","PatrolTask","BuildDoor"]
  });

  return HTomb;
})(HTomb);
