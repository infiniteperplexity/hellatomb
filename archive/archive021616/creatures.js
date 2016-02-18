// This submodule defines the templates for creature Entities
HTomb = (function(HTomb) {
  "use strict";

  var b = HTomb.Behavior;
  var s = HTomb.Behavior.spells.templates;
  var t = HTomb.Tasks;

  HTomb.Entity.define({
      template: "Necromancer",
      name: "necromancer",
      isCreature: true,
      symbol: "@" /*"\u00D1"*/,
      fg: "#D888FF",
      behaviors: [b.AI(), b.Movement(), b.Inventory(), b.Sight(),
        b.Master({tasks: [
          t.DigTask(),
          t.BuildTask(),
          t.PatrolTask(),
          t.Undesignate()
        ]}),
        b.SpellCaster({spells: [
          s.RaiseZombie
        ]})
      ]
  });

  HTomb.Entity.define({
    template: "Zombie",
    name: "zombie",
    isCreature: true,
    symbol: "z",
    fg: "#99FF66",
    behaviors: [b.AI(), b.Movement(), b.Worker()]
  });

  return HTomb;
})(HTomb);