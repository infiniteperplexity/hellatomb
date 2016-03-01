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
        AI: {},
        //Master: {tasks: ["UnearthingSigil","EarthenSigil","CraftingSigil","DismantlingSigil","HoardingSigil","MurderousSigil","WardingSigil","RevokingSigil"]},
        Master: {tasks: ["UnearthingSigil","EarthenSigil","DismantlingSigil","CraftingSigil","WardingSigil","RevokingSigil"]},
        SpellCaster: {spells: ["RaiseZombie","SummonBat"]}
      }
  });

  HTomb.Things.defineCreature({
    template: "Zombie",
    name: "zombie",
    symbol: "z",
    fg: "#99FF66",
    behaviors: {
      AI: {},
      Movement: {},
      Sight: {},
      Worker: {},
      Inventory: {capacity: 2}
    }
  });

  HTomb.Things.defineCreature({
    template: "Bat",
    name: "bat",
    symbol: "b",
    fg: "#999999",
    behaviors: {
      AI: {},
      Movement: {flies: true},
      Sight: {}
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
