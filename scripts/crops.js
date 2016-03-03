// make it so wandering monsters cross slopes
// The Movement behavior allows the creature to move


HTomb.Things.defineBehavior({
  template: "CropBehavior",
  name: "crop",
  maxHerbs: 2,
  maxSeeds: 4,
  growTurns: 512,
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
  //plant.symbol = plant.symbol || '"';
  //plant.symbol = plant.symbol || '\u03B3';
  //plant.symbol = plant.symbol || '\u0662';
  //plant.symbol = plant.symbol || '\u0667';
  plant.symbol = plant.symbol || '\u26B6';
  plant.symbol = plant.symbol || '^';
  plant.symbol = plant.symbol || '\u26BA';
  plant.matureSymbol = plant.matureSymbol || "\u2698";
  plant.symbol = plant.symbol || '\u26B5';
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
  if (args.randomColor) {
    plant.randomColor = plant.randomColor || args.randomColor;
    herb.randomColor = herb.randomColor || args.randomColor;
    seed.randomColor = seed.randomColor || args.randomColor;
  }
  HTomb.Things.defineFeature(plant);
  HTomb.Things.defineItem(herb);
  HTomb.Things.defineItem(seed);
};

HTomb.Things.defineCrop({
  template: "Wolfsbane",
  name: "wolfsbane",
  fg: "#AA55DD",
  randomColor: 10
});

HTomb.Things.defineCrop({
  template: "Mandrake",
  name: "mandrake",
  fg: "#DDAA66",
  herb: {
    name: "mandrake root",
    symbol: "\u2767"
  },
  randomColor: 10
});

HTomb.Things.defineCrop({
  template: "Wormwood",
  name: "wormwood",
  fg: "#55DDBB",
  herb: {
    name: "wormwood leaf",
    symbol: "\u2766"
  },
  randomColor: 10
});

HTomb.Things.defineCrop({
  template: "Amanita",
  name: "amanita",
  fg: "#DD5566",
  plant: {
    matureSymbol: "\u2763"
  },
  herb: {
    symbol: "\u25C9",
    name: "amanita cap"
  },
  seed: {
    name: "amanita spore"
  },
  randomColor: 10
});

HTomb.Things.defineCrop({
  template: "Bloodwort",
  name: "bloodwort",
  fg: "#BBAAAA",
  herb: {
    name: "bloodwort root",
    symbol: "\u2767"
  },
  randomColor: 10
});
