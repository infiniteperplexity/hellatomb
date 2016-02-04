// ****** This module implements Behaviors, which are the basic units of functionality for creatures, items, and features
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;

  // The Sight behavior allows a creature to see
  HTomb.Behavior.define({
    template: "Sight",
    name: "sight",
    range: 10
  });

  // The Inventory behavior allows a creature to carry things
  HTomb.Behavior.define({
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
      item.place(e._x,e._y,e._z);
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
  HTomb.Behavior.define({
    template: "Attacker",
    name: "attack"
  });
  HTomb.Behavior.define({
    template: "Defender",
    name: "defend",
    hp: 10,
    maxhp: 10
  });

  // The Minion behavior allows a creature to serve a master and take orders
  HTomb.Behavior.define({
    template: "Minion",
    name: "minion",
    master: null,
    setMaster: function(cr) {
      this.master = cr;
    },
    task: null,
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
  HTomb.Behavior.define({
    template: "Master",
    name: "master",
    minions: null,
    init: function(options) {
      this.minions = [];
      options = options || {};
      options.tasks = options.tasks || [];
      this.tasks = [];
      for (var i=0; i<options.tasks.length; i++) {
        this.tasks.push(options.tasks[i]);
      }
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
  });

  // The Stackable behavior allows items to be stacked into piles
  HTomb.Behavior.define({
    template: "Stackable",
    name: "stack",
    maxn: 10,
    n: 1,
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
  HTomb.Behavior.define({
    template: "SpellCaster",
    name: "caster",
    init: function(options) {
      options = options || {};
      options.spells = options.spells || [];
      this.spells = [];
      for (var i=0; i<options.spells.length; i++) {
        this.spells.push(options.spells[i]);
      }
    },
    cast: function(sp) {
      // Eventually change how this works
      sp.cast.call(this);
      //sp.cast(this);
    }
  });

  // The Construction behavior keeps track of steps until completion
  HTomb.Behavior.define({
    template: "Construction",
    name: "construction",
    stepsLeft: 10
  });
  return HTomb;
})(HTomb);
