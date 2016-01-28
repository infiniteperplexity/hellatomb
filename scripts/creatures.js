HTomb = (function(HTomb) {
  "use strict";

  var b = HTomb.Behavior;
  var s = HTomb.Behavior.spells.templates;

  HTomb.Entity.define({
      template: "Necromancer",
      name: "necromancer",
      isCreature: true,
      symbol: "@",
      fg: "#D888FF",
      behaviors: [b.AI(), b.Movement(), b.Inventory(), b.Sight(), b.Master(), b.SpellCaster({spells: [s.RaiseZombie]})]
  });

  HTomb.Entity.define({
    template: "Zombie",
    name: "zombie",
    isCreature: true,
    symbol: "z",
    fg: "#99FF66",
    behaviors: [b.AI(), b.Movement()]
  });

  return HTomb;
})(HTomb);
