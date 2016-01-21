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
      if (this.acted===false) {
        this.wander();
      }
    },
    wander: function() {
      if (!this.entity.movement) {
        return false;
      }
      var r = Math.floor(Math.random()*8);
      var dx = ROT.DIRS[8][r][0];
      var dy = ROT.DIRS[8][r][1];
      this.acted = this.entity.movement.tryStep(dx,dy);
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
    tryStep: function(dx, dy) {
      var x = this.entity._x;
      var y = this.entity._y;
      var z = this.entity._z;
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
        if (square.feature!==undefined && square.feature.template==="DownSlope") {
          return true;
        } else {
          return false;
        }
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

  return HTomb;
})(HTomb);
