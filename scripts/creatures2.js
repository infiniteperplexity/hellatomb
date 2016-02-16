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
      behaviors: [b.Movement(), b.Inventory()]
  });

  return HTomb;
})(HTomb);
