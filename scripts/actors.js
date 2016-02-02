HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;

  HTomb.Behavior.define({
    template: "AI",
    name: "ai",
    target: null,
    mood: null,
    acted: false,
    init: function(){this.entity.path = [];},
    act: function() {
      if (this.entity===HTomb.Player) {
        return false;
      }
      if (this.acted===true) {
        this.acted = false;
        return false;
      }
      if (this.entity.minion) {
        if (this.entity.minion.task) {
          this.entity.minion.task.ai();
        } else {
          this.patrol(this.entity.minion.master._x,this.entity.minion.master._y,this.entity.minion.master._z);
        }
      }
      if (this.acted===false) {
        this.wander();
      }
      if (this.acted===false) {
        console.log("creature failed to act!");
      }
      this.acted = false;
    },
    patrol: function(x,y,z,min,max) {
      min = min || 2;
      max = max || 5;
      if (!this.entity.movement) {
        return false;
      }
      var dist = HTomb.Path.distance(this.entity._x,this.entity._y,x,y);
      if (dist<min) {
        this.acted = this.entity.movement.walkAway(x,y,z);
      } else if (dist>max) {
        this.acted = this.entity.movement.walkToward(x,y,z);
      } else {
        this.acted = this.entity.movement.walkRandom();
      }
    },
    wander: function() {
      if (!this.entity.movement) {
        return false;
      }
      this.acted = this.entity.movement.walkRandom();
    }
  });

  HTomb.Behavior.define({
    template: "Movement",
    name: "movement",
    walks: true,
    climbs: true,
    walkRandom: function() {
      var r = Math.floor(Math.random()*8);
      var dx = ROT.DIRS[8][r][0];
      var dy = ROT.DIRS[8][r][1];
      return this.tryStep(dx,dy);
    },
    walkToward: function(x,y,z) {
      // for now, assume a straight line...later do pathfinding
      var x0 = this.entity._x;
      var y0 = this.entity._y;
      var z0 = this.entity._z;
      //var line = HTomb.Path.line(x0,y0,x,y);
      // need to handle errors somehow
      //var dx = line[1][0] - x0;
      //var dy = line[1][1] - y0;
      var path = HTomb.Path.aStar(x0,y0,z0,x,y,z,{useLast: false});
      if (path!==false) {
        var square = path[0];
        return this.tryStep(square[0]-x0,square[1]-y0,square[2]-z0);
      }
      return false;
      //return this.tryStep(dx,dy);
    },
    walkAway: function(x,y) {
      var x0 = this.entity._x;
      var y0 = this.entity._y;
      var line = HTomb.Path.line(x0,y0,x,y);
      // need to handle errors somehow
      var dx = line[1][0] - x0;
      var dy = line[1][1] - y0;
      return this.tryStep(-dx,-dy);
    },
    tryStep: function(dx, dy, dz) {
      // this should deal with slopes eventually
      var x = this.entity._x;
      var y = this.entity._y;
      var z = this.entity._z;
      if (dz) {
        if(this.climbs===undefined) {
          return false;
        }
        var p = HTomb.World.portals[x*LEVELW*LEVELH+y*LEVELH+z];
        if (p) {
          if (p[0]===x+dx && p[1]===y+dy && p[2]===z+dz) {
            this.entity.place(x+dx,y+dy,z+dz);
            return true;
          }
        }
      }
      var i0;
      var one;
      var two;
      var dirs = ROT.DIRS[8];
      if (this.canPass(x+dx,y+dy,z) && this.canMove(x+dx, y+dy,z)) {
        this.entity.place(x+dx,y+dy,z);
        //should subtract actionpoints;
        return true;
      } else for (var i=0; i<8; i++) {
        if (dx===dirs[i][0] && dy===dirs[i][1]) {
          i0 = i;
          break;
        }
      }
      for (i=1; i<5; i++) {
        one = (i0+i)%8;
        two = (i0-i>=0) ? i0-i : 8+i0-i;
        if (Math.random>=0.5) {
          //perform XOR swap
          one = one^two;
          two = one^two;
          one = one^two;
        }
        dx = dirs[one][0];
        dy = dirs[one][1];
        if (this.canPass(x+dx,y+dy,z) && this.canMove(x+dx, y+dy,z)) {
          this.entity.place(x+dx,y+dy,z);
          //should subtract actionpoints;
          return true;
        }
        dx = dirs[two][0];
        dy = dirs[two][1];
        if (this.canPass(x+dx,y+dy,z) && this.canMove(x+dx, y+dy,z)) {
          this.entity.place(x+dx,y+dy,z);
          //should subtract actionpoints;
          return true;
        }
      }
      console.log("creature couldn't move.");
      return false;
    },
    canPass: function(x,y,z) {
      if (this.canMove(x,y,z)===false) {
        return false;
      }
      var square = HTomb.Tiles.getSquare(x,y,z);
      if (square.creature) {
        return false;
      }
      return true;
    },
    canMove: function(x,y,z) {
      if (x<0 || x>=LEVELW || y<0 || y>=LEVELH) {
        return false;
      }
      var square = HTomb.Tiles.getSquare(x,y,z);
      if (square.terrain.solid===true && this.phases===undefined) {
        return false;
      } else if (square.terrain.fallable===true && this.flies===undefined) {
        //if (square.feature!==undefined && square.feature.template==="DownSlope") {
        //  return true;
        //} else {
          return false;
        //}
      } else if (this.walks===true) {
        return true;
      } else {
        return false;
      }
    }
  });

  HTomb.Behavior.define({
    template: "Worker",
    name: "worker",
    dig: function(x,y,z) {
      var coord = x*LEVELW*LEVELH + y*LEVELH + z;
      var feature = HTomb.World.features[coord];
      if (feature) {
        if (feature.template==="IncompletePit") {
          feature.construction.stepsLeft-=1;
          if (feature.construction.stepsLeft<=0) {
            feature.remove();
            if (HTomb.World.levels[z].grid[x][y]===HTomb.Tiles.FLOORTILE) {
              z-=1;
            }
            HTomb.Tiles.emptySquare(x,y,z);
            var zone = HTomb.World.zones[coord];
            if (zone && zone.template==="DigZone") {
              zone.remove();
            }
          }
        } else {
          console.log(this.entity.describe() + " removes " + feature.describe() + " to make room for digging.");
          feature.remove();
        }
      } else {
        console.log("no feature");
        HTomb.Entity.create("IncompletePit").place(x,y,z);
      }
      this.entity.ai.acted = true;
    },
    build: function(x,y,z) {
      //options = options || {};
      //if (options.below===true) {}
      var coord = x*LEVELW*LEVELH + y*LEVELH + z;
      var feature = HTomb.World.features[coord];
      if (feature) {
        if (feature.template==="IncompleteWall") {
          feature.construction.stepsLeft-=1;
          if (feature.construction.stepsLeft<=0) {
            feature.remove();
            HTomb.Tiles.fillSquare(x,y,z);
            var zone = HTomb.World.zones[coord];
            if (zone && zone.template==="BuildZone") {
              zone.remove();
            }
          }
        } else {
          console.log(this.entity.describe() + " removes " + feature.describe() + " to make room for building.");
          feature.remove();
        }
      } else {
        HTomb.Entity.create("IncompleteWall").place(x,y,z);
      }
      this.entity.ai.acted = true;
    }
  });

  return HTomb;
})(HTomb);
