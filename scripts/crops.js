HTomb = (function(HTomb) {
  "use strict";

  HTomb.Things.defineItem({
    template: "Seed",
    name: "seed",
    symbol: "\u2026",
    base: null,
    stackable: true,
    maxn: 10
  });
  HTomb.Things.defineItem({
    template: "Herb",
    name: "herb",
    symbol: "\u273F",
    base: null,
    stackable: true,
    maxn: 10
  });
  HTomb.Things.defineFeature({
    template: "Sprout",
    name: "sprout",
    symbol: "\u0662",
    incompleteSymbol: "\u2692",
    base: null,
    yields: null,
    growTurns: 256,
    each: ["growTurns"],
    onPlace: function() {
      HTomb.Events.subscribe(this,"TurnBegin");
    },
    onTurnBegin: function() {
      this.growTurns-=1;
      if (this.growTurns<=0) {
        var plant = HTomb.Things[this.base+"Plant"]();
        var x = this.x;
        var y = this.y;
        var z = this.z;
        this.remove();
        plant.place(x,y,z);
      }
    }
  });
  HTomb.Things.defineFeature({
    template: "Plant",
    name: "plant",
    base: null,
    symbol: "\u2698",
    yields: null
  });


HTomb.Types.define({
  template: "Crop",
  name: "crop",
  onDefine: function(args) {
    if (args===undefined || args.template===undefined || args.name===undefined) {
      HTomb.Debug.pushMessage("invalid template definition");
      return;
    }
    var stages = ["Seed","Sprout","Herb","Plant"];
    var specials = ["parent","base","template","name"];
    for (var i=0; i<4; i++) {
      args[stages[i]] = args[stages[i]] || {};
      var parent = HTomb.Things.templates[stages[i]];
      args[stages[i]].parent = parent.template;
      args[stages[i]].base = args.template;
      args[stages[i]].template = args.template+stages[i];
      args[stages[i]].name = args[stages[i]].name || args.name+" "+parent.name;
      if (stages[i]==="Sprout") {
        var seed = {};
        seed[args.Seed.template] = {n: 1, nonzero: true};
        args[stages[i]].yields = args[stages[i]].yields || seed;
        args[stages[i]].incompleteFg = args[stages[i]].incompleteFg || args.fg;
      } else if (stages[i]==="Plant") {
        var harvest = {};
        harvest[args.Seed.template] = {n: 2, nozero: true};
        harvest[args.Herb.template] = {n: 3, nozero: true};
        args[stages[i]].yields = args[stages[i]].yields || harvest;
      }
      for (var arg in args) {
        if (stages.indexOf(arg)===-1 && specials.indexOf(arg)===-1) {
          args[stages[i]][arg] = args[stages[i]][arg] || args[arg];
        }
      }
    }
    HTomb.Things.defineItem(args.Seed);
    HTomb.Things.defineFeature(args.Sprout);
    HTomb.Things.defineFeature(args.Plant);
    HTomb.Things.defineItem(args.Herb);
  }
});


HTomb.Types.defineCrop({
  template: "Wolfsbane",
  name: "wolfsbane",
  fg: "#AA55DD",
  randomColor: 10
});

HTomb.Types.defineCrop({
  template: "Mandrake",
  name: "mandrake",
  fg: "#DDAA66",
  Herb: {
    name: "mandrake root",
    symbol: "\u2767"
  },
  randomColor: 10
});

HTomb.Types.defineCrop({
  template: "Wormwood",
  name: "wormwood",
  fg: "#55DDBB",
  Herb: {
    name: "wormwood leaf",
    symbol: "\u2766"
  },
  randomColor: 10
});

HTomb.Types.defineCrop({
  template: "Amanita",
  name: "amanita",
  fg: "#DD5566",
  Plant: {
    symbol: "\u2763"
  },
  Herb: {
    symbol: "\u2763",
    name: "amanita cap"
  },
  Seed: {
    name: "amanita spore"
  },
  randomColor: 10
});

HTomb.Types.defineCrop({
  template: "Bloodwort",
  name: "bloodwort",
  fg: "#BBAAAA",
  Herb: {
    name: "bloodwort root",
    symbol: "\u2767"
  },
  randomColor: 10
});

return HTomb;
})(HTomb);
