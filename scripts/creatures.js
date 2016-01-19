HTomb = (function(HTomb) {
  "use strict";

  var b = HTomb.Behavior;

  HTomb.Entity.define({
      template: "Necromancer",
      name: "the player",
      isCreature: true,
      symbol: "@",
      fg: "#D888FF",
      behaviors: [b.AI(), b.Movement()]
  });

  HTomb.Entity.define({
    template: "Zombie",
    name: "zombie",
    isCreature: true,
    symbol: "z",
    fg: "green",
    behaviors: [b.AI(), b.Movement()]
  });

  return HTomb;
})(HTomb);
