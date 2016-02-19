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
        Master: {tasks: ["DigTask","BuildTask","DigSlope","BuildSlope","BuildDoor","PatrolTask","Undesignate"]},
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

  HTomb.Things.defineEntity({
    template: "Bat",
    name: "bat",
    isCreature: true,
    symbol: "b",
    fg: "#999999",
    behaviors: {
      AI: {},
      Movement: {}
    }
  });

  HTomb.Things.defineEntity({
    template: "Spider",
    name: "spider",
    isCreature: true,
    symbol: "s",
    fg: "#BBBBBB",
    behaviors: {
      AI: {},
      Movement: {}
    }
  });

  return HTomb;
})(HTomb);
