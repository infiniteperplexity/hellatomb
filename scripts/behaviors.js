HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;

  HTomb.Behavior.define({
    template: "Sight",
    name: "sight",
    range: 10
  });

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
      console.log(this.entity.describe() + " was assigned " + tsk.describe());
    },
    unassign: function() {
      console.log(this.entity.describe() + " was unassigned from " + this.task.describe());
      this.task = null;
    }
  });

  // Is it actually a good idea to have task assignment in this behavior?
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
      //tsk.designate.call(tsk,this);
    },
  });

  HTomb.Behavior.define({
    template: "Stackable",
    name: "stack",
    maxn: 10,
    n: 1,
    stackInto: function(arr) {
      // this should divide it into successive stacks as needed
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
      // is this a good way to do it?
      sp.cast.call(this);
    }
  });

  // should this take a callback for completion?
  HTomb.Behavior.define({
    template: "Construction",
    name: "construction",
    stepsLeft: 10
  });
  return HTomb;
})(HTomb);
