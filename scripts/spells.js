HTomb = (function(HTomb) {
  "use strict";

  HTomb.Things.define({
    template: "Spell",
    name: "spell",
    parent: "Thing"
  });

  HTomb.Things.defineSpell({
    template: "RaiseZombie",
    name: "raise zombie",
    cast: function(caster) {
      var c = caster.entity;
      HTomb.GUI.pushMessage(c.describe() + " raises a zombie.");
      var sq = HTomb.Tiles.randomEmptyNeighbor(c.x,c.y,c.z);
      if (sq) {
        var z = HTomb.Things.Zombie();
        z.place(sq[0],sq[1],sq[2]);
        if (!c.master) {
		      HTomb.Things.Master().addToEntity(c);
        }
		    HTomb.Things.Minion().addToEntity(z);
        z.minion.setMaster(c);
        c.master.addMinion(z);
        z.ai.acted = true;
      }
    }
  });


  return HTomb;
})(HTomb);
