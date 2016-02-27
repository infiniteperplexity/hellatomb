// make it so wandering monsters cross slopes
// The Movement behavior allows the creature to move


HTomb.Things.defineBehavior({
  template: "CropBehavior",
  name: "crop",
  maxHerbs: 2,
  maxSeeds: 4,
  growTurns: 1440,
  each: ["growTurns"],
  onTurnBegin: function() {
    if (this.growTurns>0) {
      this.growTurns-=1;
    } else {
      this.mature();
    }
  },
  plantAt: function(x,y,z) {
    this.entity.remove();
    var plant = HTomb.Things[this.entity.baseTemplate+"Plant"]().place(x,y,z);
    HTomb.Events.subscribe(plant.crop,"TurnBegin");
  },
  mature: function() {
    this.growTurns = 0;
    this.entity.symbol = this.entity.matureSymbol || this.entity.symbol;
    this.entity.fg = this.entity.matureFg || this.entity.fg;
    HTomb.Events.unsubscribe(this,"TurnBegin");
  },
  plow: function() {
    var x = this.entity.x;
    var y = this.entity.y;
    var z = this.entity.z;
    this.entity.remove();
    // 50% chance of yielding a seed
    if (Math.random<=0.5) {
      var seed = HTomb.Things[this.entity.baseTemplate+"Seed"]().place(x,y,z);
    }
  },
  harvestBy: function(cr) {
    var x = this.entity.x;
    var y = this.entity.y;
    var z = this.entity.z;
    this.entity.remove();
    var herbs = Math.floor(Math.random()*(this.maxHerbs-1))+1;
    var seeds = Math.floor(Math.random()*(this.maxSeeds+1));
    var t = HTomb.Things.templates[this.entity.baseTemplate+"Seed"];
    var f = HTomb.Things[this.entity.baseTemplate+"Seed"];
    if (seeds>0) {
      if (t.stackable) {
        item = f();
        item.item.n = seeds;
        item.place(x,y,z);
      } else {
        for (i=0; i<seeds; i++) {
          item = f();
          item.place(x,y,z);
        }
      }
    }
    t = HTomb.Things.templates[this.entity.baseTemplate+"Herb"];
    f = HTomb.Things[this.entity.baseTemplate+"Herb"];
    var item, i;
    if (t.stackable) {
      item = f();
      item.item.n = herbs;
      item.place(x,y,z);
    } else {
      for (i=0; i<herbs; i++) {
        item = f();
        item.place(x,y,z);
      }
    }
  }
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
  plant.baseTemplate = args.template;
  plant.name = plant.name || args.name + " plant";
  plant.symbol = plant.symbol || '"';
  plant.matureSymbol = plant.matureSymbol || "\u2698";
  plant.fg = plant.fg || args.fg || "white";
  plant.behaviors = {CropBehavior: behavior};
  plant.behaviors.CropBehavior.stage = "plant";
  plant.activate = function() {
    if (this.crop.growTurns<=0) {
      this.crop.harvestBy();
    } else {
      this.crop.plow();
    }
  };
  herb.template = args.template + "Herb";
  herb.baseTemplate = args.template;
  herb.name = herb.name || args.name + " herb";
  herb.symbol = herb.symbol || "\u273F";
  herb.fg = herb.fg || args.fg || "white";
  herb.behaviors = {CropBehavior: behavior};
  herb.behaviors.CropBehavior.stage = "herb";
  herb.stackable = true;
  seed.template = args.template + "Seed";
  seed.baseTemplate = args.template;
  seed.name = seed.name || args.name + " seed";
  seed.symbol = seed.symbol || "\u2026";
  seed.fg = seed.fg || args.fg || "white";
  seed.behaviors = {CropBehavior: behavior};
  seed.behaviors.CropBehavior.stage = "seed";
  seed.stackable = true;
  HTomb.Things.defineFeature(plant);
  HTomb.Things.defineItem(herb);
  HTomb.Things.defineItem(seed);
};

HTomb.Things.defineCrop({
  template: "Wolfsbane",
  name: "wolfsbane",
  fg: "#BB55FF"
});

HTomb.Things.defineCrop({
  template: "Mandrake",
  name: "mandrake",
  fg: "#FFAA55"
});

HTomb.Things.defineCrop({
  template: "Wormwood",
  name: "wormwood",
  fg: "#55FFCC"
});

HTomb.Things.defineCrop({
  template: "Amanita",
  name: "amanita",
  fg: "#FF2288"
});

HTomb.Things.defineCrop({
  template: "Bloodwort",
  name: "bloodwort",
  fg: "#CCCCCC"
});
