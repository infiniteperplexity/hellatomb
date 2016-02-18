// This submodule defines the templates for creature Entities
HTomb = (function(HTomb) {
  "use strict";

  var b = HTomb.Things;

  HTomb.Things.defineEntity({
      template: "Necromancer",
      name: "necromancer",
      isCreature: true,
      symbol: "@",
      fg: "#D888FF",
      behaviors: {
        Movement: {},
        Inventory: {},
        Sight: {},
        // Issue...those these be template names?  or reference to actual templates?
        Master: {tasks: ["DigTask","BuildTask","PatrolTask","Undesignate"]},
        SpellCaster: {spells: ["RaiseZombie"]}
      }
  });

  HTomb.Things.defineEntity({
    template: "Zombie",
    name: "zombie",
    isCreature: true,
    symbol: "z",
    fg: "#99FF66",
    behaviors: {
      AI: {},
      Movement: {}
    }
  });

  return HTomb;
})(HTomb);
