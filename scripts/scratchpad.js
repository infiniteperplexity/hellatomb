

okay...so there are four cell types...immutable/mutable yes/no.

also, "born" and "survive"...but those should be callbacks.

var fix0;
var fix1;
var var0;
var var1;


HTomb.Cells(options) {
  options = options || {};
  this.width = options.width || HTomb.Constants.LEVELW;
  this.height = options.height || HTomb.Constants.LEVELH;
  this.born = options.born || [0,0,0,0,0,1,1,1,1];
  this.survive = options.survive || [0,0,0,1,1,1,1,1];
  this.borders = options.borders || 0;
  this.neighborhood = ROT.DIRS[8] || options.neighborhood;
  this.map = [];
  this.mask = [];
  for (var x=0; x<this.width; x++) {
    this.map.push([]);
    this.mask.push([]);
    this.next.push([]);
    for (var y=0; y<this.height; y++) {
      if (x===0 || y===0 || x===this.width-1 || y===this.height-1) {
        this.mask[x][y] = this.borders;
      } else {
        this.mask[x][y] = null;
      }
    }
  }
}
HTomb.Cells.prototype.randomize = function(p) {
  p = p || 0.5;
  for (var x=0; x<this.width; x++) {
    for (var y=0; y<this.height; y++) {
      this.map[x][y] = (this.mask[x][y]===null) ? (Math.random()<p) || this.mask[x][y];
    }
  }
}
HTomb.Cells.prototype.initialize = function(callb) {
  for (var x=0; x<this.width; x++) {
    for (var y=0; y<this.height; y++) {
      this.map[x][y] = (this.mask[x][y]===null) ? callb(x,y) || this.mask[x][y];
    }
  }
};
HTomb.Cells.prototype.setMask = function(callb) {
  for (var x=0; x<this.width; x++) {
    for (var y=0; y<this.height; y++) {
      this.mask[x][y] = callb(x,y);
    }
  }
}
HTomb.Cells.prototype.iterate = function(n) {
  n = n || 1;
  var x, y;
  for (var i=0; i<n; i++) {
    var next = [];
    for (x=0; x<this.width; x++) {
      next.push([]);
      for (y=0; y<this.height; y++) {
        var tally = 0;
        for (var j=0; j<this.neighborhood.length; j++) {
          var dx = x+this.neighborhood[j][0];
          var dy = y+this.neighborhood[j][1];
          if (this.map[dx][dy]===1) {
            tally+=1;
          }
        }
        if (this.map[x][y]===1) {
          next[x][y] = (this.mask[x][y]===null) ? (Math.random()<this.survive[tally]) : this.mask[x][y];
        } else {
          next[x][y] = (this.mask[x][y]===null) ? (Math.random()<this.born[tally]) : this.mask[x][y];
        }
      }
    }
    for (x=0; x<this.width; x++) {
      for (y=0; y<this.height; y++) {
        this.map[x][y] = next[x][y];
      }
    }
  }
}
HTomb.Cells.apply = function(callb) {
  for (var x=0; x<this.width; x++) {
    for (var y=0; y<this.height; y++) {
      if (this.mask[x][y]===null) {
        callb(x, y, this.map[x][y]);
      }
    }
  }
}

function growPlants() {
  var template = "WolfsbanePlant";
  var cells = HTomb.Cells();
  cells.initialize(function(x,y) {
    var z = HTomb.groundLevel(x,y);
    var f = HTomb.World.features[coord(x,y,z)];
    if (f && f.template===template) {
      return 1;
    } else {
      return 0;
    }
  });
  cells.iterate(4);
  cells.apply(function(x,y,val) {
    if (val) {
      var z = HTomb.groundLevel(x,y);
      HTomb.Things[template]().place(x,y,z);
    }
  });
}


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
