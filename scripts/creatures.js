// This submodule defines the templates for creature Entities
HTomb = (function(HTomb) {
  "use strict";

  var b = HTomb.Things;

  HTomb.Things.defineCreature({
      template: "Necromancer",
      name: "necromancer",
      symbol: "@",
      fg: "#D888FF",
      behaviors: {
        Movement: {},
        Inventory: {},
        Sight: {},
        // Issue...those these be template names?  or reference to actual templates?
        Master: {tasks: ["FullDig","FullBuild","HalfDig","HalfBuild","BuildDoor","PatrolTask","Undesignate"]},
        SpellCaster: {spells: ["RaiseZombie"]}
      }
  });

  HTomb.Things.defineCreature({
    template: "Zombie",
    name: "zombie",
    symbol: "z",
    fg: "#99FF66",
    behaviors: {
      AI: {},
      Movement: {}
    }
  });

  HTomb.Things.defineCreature({
    template: "Bat",
    name: "bat",
    symbol: "b",
    fg: "#999999",
    behaviors: {
      AI: {},
      Movement: {}
    }
  });

  HTomb.Things.defineCreature({
    template: "Spider",
    name: "spider",
    symbol: "s",
    fg: "#BBBBBB",
    behaviors: {
      AI: {},
      Movement: {}
    }
  });

  return HTomb;
})(HTomb);
