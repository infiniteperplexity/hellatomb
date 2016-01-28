HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;

  HTomb.Behavior.define({
    template: "Sight",
    name: "sight",
    range: 10
  });
  HTomb.Behavior.define({
    template: "AI",
    name: "ai",
    target: null,
    mood: null,
    acted: false,
    init: function(){this.entity.path = [];},
    act: function() {
      this.acted = false;
      if (this.entity===HTomb.Player) {
        return false;
      }
      if (this.entity.minion) {
        this.patrol(this.entity.minion.master._x,this.entity.minion.master._y,this.entity.minion.master._z);
      }
      if (this.acted===false) {
        this.wander();
      }
      if (this.acted===false) {
        console.log("creature failed to act!");
      }
    },
    patrol: function(x,y,z,min,max) {
      min = min || 3;
      max = max || 6;
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
    template: "Inventory",
    name: "inventory",
    capacity: 10,
    init: function() {this.items = [];},
    add: function(item) {
      if (this.items.length>=this.capacity) {
        HTomb.GUI.pushMessage("Can't pick that up.");
      } else if (item.stack) {
        item.stack.stackInto(this.items);
      } else {
        this.items.push(item);
      }
    },
    remove: function(item) {
        var indx = this.items.indexOf(item);
        if (indx===-1) {
          HTomb.GUI.pushMessage("Can't remove that");
        } else {
          this.items.splice(indx,1);
        }
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
      if (path.length>0) {
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
      var square = HTomb.World.getSquare(x,y,z);
      if (square.creature) {
        return false;
      }
      return true;
    },
    canMove: function(x,y,z) {
      if (x<0 || x>=LEVELW || y<0 || y>=LEVELH) {
        return false;
      }
      var square = HTomb.World.getSquare(x,y,z);
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
    template: "Attacker",
    name: "attack"
  });

  HTomb.Behavior.define({
    template: "Defender",
    name: "defend",
    hp: 10,
    maxhp: 10
  });

  HTomb.Behavior.define({
    template: "Minion",
    name: "minion",
    master: null,
    setMaster: function(cr) {
      this.master = cr;
    }
  });

  HTomb.Behavior.define({
    template: "Master",
    name: "master",
    minions: null,
    init: function() {
      this.minions = [];
    },
    addMinion: function(cr) {
      this.minions.push(cr);
    },
    removeMinion: function(cr) {
      this.minions.splice(this.minions.indexOf(cr,1));
    }
  });

  HTomb.Behavior.define({
    template: "Stackable",
    name: "stack",
    maxn: 10,
    n: 1,
    stackInto: function(arr) {
      // this should divide it into successive stacks as needed
      var one;
      var two;
      for (var i=0; i<arr.length; i++) {
        if ((this.n>0) && (arr[i].template===this.entity.template) && (arr[i].stack.n<arr[i].stack.maxn)) {
          one = this.n;
          two = arr[i].stack.n;
          if ((one+two)>this.maxn) {
            arr[i].stack.n = this.maxn;
            this.n = one+two-this.maxn;
          } else {
            arr[i].stack.n = one+two;
            this.n = 0;
          }
        }
      }
      if (this.n>0) {
        if (this.n>1) {
        }
        arr.push(this.entity);
      }
    }
  });

  HTomb.Behavior.define({
    template: "SpellCaster",
    name: "caster",
    init: function(options) {
      options = options || {};
      options.spells = options.spells || [];
      this.spells = [];
      for (var i=0; i<options.spells.length; i++) {
        this.spells.push(options.spells[i]);
      }
    },
    cast: function(sp) {
      // is this a good way to do it?
      sp.cast.call(this);
    }
  });
  return HTomb;
})(HTomb);