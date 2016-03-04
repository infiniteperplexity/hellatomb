
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
