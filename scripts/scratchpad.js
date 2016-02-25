// make it so wandering monsters cross slopes
// The Movement behavior allows the creature to move


HTomb.Things.defineBehavior({
  template: "CropBehavior",
  name: "crop",
  maxHerbs: 2,
  maxSeeds: 4,
  growTurns: 1440
});

HTomb.Things.defineCrop = function(args) {
  if (args===undefined || args.template===undefined || args.name===undefined) {
    HTomb.Debug.pushMessage("invalid template definition");
    return;
  }
  var plant = args.plant || {};
  var herb = args.herb || {};
  var seed = args.seed || {};
  var behavior = args.behavior || {};
  plant.template = args.template + "Plant";
  plant.name = plant.name || args.name + " plant";
  plant.symbol = plant.symbol || "\u2698";
  plant.fg = plant.fg || args.fg || "white";
  plant.behaviors = {CropBehavior: behavior;
  herb.template = args.template + "Herb";
  herb.name = herb.name || args.name + " herb";
  herb.symbol = herb.symbol || "\u273F";
  herb.fg = herb.fg || args.fg || "white";
  herb.behaviors = {CropBehavior: behavior;
  seed.template = args.template + "Seed";
  seed.name = seed.name || args.name + " seed";
  seed.symbol = seeds.symbol || "\u2026";
  seed.fg = seed.fg || args.fg || "white";
  seed.behaviors = {CropBehavior: behavior};
  seed.behaviors.Stackable = {};
  HTomb.Things.defineFeature(plant);
  HTomb.Things.defineItem(herb);
  HTomb.Things.defineItem(seed);
};

HTomb.Things.defineCrop({
  template: "Wolfsbane",
  name: "wolfsbane",
  fg: "purple"
});
