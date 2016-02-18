// Features are large, typically immobile objects
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.coord;

  HTomb.Things.defineEntity({
    template: "Tombstone",
    name: "tombstone",
    isFeature: true,
    symbol: "\u271F",
    fg: "#AAAAAA",
    randomColor: 5,
    onPlace: function(x,y,z) {
      // Bury a corpse beneath the tombstone
      HTomb.Things.create("Corpse").place(x,y,z-1);
    }
  });

  HTomb.Things.defineEntity({
    template: "Tree",
    name: "tree",
    isFeature: true,
    //symbol: "\u2663",
    symbol: ["\u2663","\u2660"],
    fg: "#559900",
    randomColor: 20
  });

  HTomb.Things.defineEntity({
    template: "Shrub",
    name: "shrub",
    isFeature: true,
    symbol: "\u262B",
    fg: "#779922",
    randomColor: 20
  });

  HTomb.Things.defineEntity({
    template: "Puddle",
    name: "puddle",
    isFeature: true,
    symbol: "~",
    fg: "#0088DD",
    randomColor: 20
  });

  // An excavation is a special, dynamic entity that digs out a square and then removes itself
  HTomb.Things.defineEntity({
    template: "Excavation",
    name: "excavation",
    isFeature: true,
    constructionSymbol: "\u2022",
    onPlace: function(x,y,z) {
      HTomb.World.emptySquare(x,y,z);
      this.remove();
    }
  });

  HTomb.Things.defineEntity({
  	template: "Construction",
    name: "construction",
  	isFeature: true,
    target: null,
    steps: 10,
    placement: [],
    task: null,
    each: ["steps","target","placement","symbol","task"],
    onCreate: function(args) {
      args = args || {};
      args.target = args.target || null;
      args.steps = args.steps || this.steps;
      args.task = args.task || null;
      this.placement = args.placement || [0,0,0];
      this.steps = args.steps;
      this.target = args.target;
      this.task = args.task;
      this.symbol = target.constructSymbol || "X";
      HTomb.Things.templates.Entity.onCreate.call(this, args);
    },
    describe: function() {
      var desc = HTomb.Thigns.templates.Entity.describe.call(this);
      desc += " (" + target.describe() + ")";
      return desc;
    },
    doWork: function() {
      this.steps-=1;
      if (this.steps<=0) {
        this.complete();
      }
    },
  	complete: function() {
      var x = this.x + this.placement[0];
      var y = this.y + this.placement[1];
      var z = this.z + this.placement[2];
      if (target.isFeature) {
        this.remove();
        var feature = HTomb.Things.create(target.template);
        feature.place(x,y,z);
      } else if (target.parent==="Terrain") {
        HTomb.World.tiles[z][x][y] = target;
        this.remove();
      }
      this.task.complete();
    }
  });

  return HTomb;
})(HTomb);
