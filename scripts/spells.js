HTomb = (function(HTomb) {
  "use strict";

  var b = HTomb.Behavior;

  b.spells = {};
  b.spells.templates = {};

  var spell = {
    describe: function() {return this.name;}
  };
  b.spells.define = function(properties) {
    if (!properties || !properties.template) {
      console.log("invalid template definition");
      return;
    }
    var template = Object.create(spell);
    for (var prop in properties) {
      template[prop] = properties[prop];
    }
    b.spells.templates[properties.template] = template;
  };


  b.spells.define({
    template: "RaiseZombie",
    name: "raise zombie",
    cast: function() {
      var c = this.entity;
      HTomb.GUI.pushMessage(c.describe() + " raises a zombie.");
      var sq = HTomb.World.randomEmptyNeighbor(c._x,c._y,c._z);
      if (sq) {
        var z = HTomb.Entity.create("Zombie");
        z.place(sq[0],sq[1],sq[2]);
        if (!c.master) {
          c.addBehavior(HTomb.Behavior.Master());
        }
        z.addBehavior(HTomb.Behavior.Minion());
        z.minion.setMaster(c);
        c.master.addMinion(z);
      }
    }
  });

  b.spells.create = function(template) {
    if (!template) {
      console.log("invalid template definition");
      return;
    }
    var sp = b.spells.templates[template];
    for (var p in beh) {
      this[beh.name][p] = beh[p];
    }
  };

  return HTomb;
})(HTomb);
