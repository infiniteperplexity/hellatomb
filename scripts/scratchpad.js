// make it so wandering monsters cross slopes
// The Movement behavior allows the creature to move
HTomb.Things.defineBehavior({
  template: "Movement",
  name: "movement",
  // flags for different kinds of movement
  walks: true,
  climbs: true,
  // Walk in one of the eight random directions
  walkRandom: function() {
    var r = Math.floor(Math.random()*8);
    var dx = ROT.DIRS[8][r][0];
    var dy = ROT.DIRS[8][r][1];
    return this.tryStep(dx,dy);
  },
  // Walk along a path toward the target
  walkToward: function(x,y,z) {
    var x0 = this.entity.x;
    var y0 = this.entity.y;
    var z0 = this.entity.z;
    var path = HTomb.Path.aStar(x0,y0,z0,x,y,z,{useLast: false});
    if (path!==false) {
      var square = path[0];
      if (path.length===0) {
        square = [x,y,z];
      }
      return this.tryStep(square[0]-x0,square[1]-y0,square[2]-z0);
    }
    return false;
  },
  // Walk straight away from the target
  walkAway: function(x,y) {
    var x0 = this.entity.x;
    var y0 = this.entity.y;
    var line = HTomb.Path.line(x0,y0,x,y);
    if (line.length<=1) {
      return this.walkRandom();
    }
    var dx = line[1][0] - x0;
    var dy = line[1][1] - y0;
    return this.tryStep(-dx,-dy);
  },
  // Try to step in a certain direction
  tryStep: function(dx, dy, dz) {
    var x = this.entity.x;
    var y = this.entity.y;
    var z = this.entity.z;
    // Move up or down
    if (dz) {
      if(this.climbs===undefined) {
        return false;
      }
      var p = HTomb.World.portals[coord(x,y,z)];
      if (p) {
        if (p[0]===x+dx && p[1]===y+dy && p[2]===z+dz && this.canPass(x+dx,y+dy,z+dz) && this.canMove(x+dx, y+dy,z+dz)) {
          this.entity.place(x+dx,y+dy,z+dz);
          return true;
        }
      }
    }
    var i0;
    var one;
    var two;
    var dirs = ROT.DIRS[8];
    // Try moving in the exact direction
    if (this.canPass(x+dx,y+dy,z) && this.canMove(x+dx, y+dy,z)) {
      this.entity.place(x+dx,y+dy,z);
      return true;
    } else for (var i=0; i<8; i++) {
      if (dx===dirs[i][0] && dy===dirs[i][1]) {
        i0 = i;
        break;
      }
    }
    // i0 ends up undefined if dx and dy are both zero
    // that causes an error

    // Then try moving in other nearby directions
    for (i=1; i<5; i++) {
      one = (i0+i)%8;
      two = (i0-i>=0) ? i0-i : 8+i0-i;
      if (Math.random>=0.5) {
        //perform XOR swap
        one = one^two;
        two = one^two;
        one = one^two;
      }
      if (dirs[one]===undefined) {
        console.log([i,i0]);
        console.log([x,y,z]);
        console.log([dx,dy,dz]);
      }
      dx = dirs[one][0];
      dy = dirs[one][1];
      if (this.canPass(x+dx,y+dy,z) && this.canMove(x+dx, y+dy,z)) {
        this.entity.place(x+dx,y+dy,z);
        return true;
      }
      dx = dirs[two][0];
      dy = dirs[two][1];
      if (this.canPass(x+dx,y+dy,z) && this.canMove(x+dx, y+dy,z)) {
        this.entity.place(x+dx,y+dy,z);
        return true;
      }
    }
    console.log("creature couldn't move.");
    return false;
  },
  displaceCreature: function(x,y,z) {
    var x0 = this.entity.x;
    var y0 = this.entity.y;
    var z0 = this.entity.z;
    var cr = HTomb.World.creatures[coord(x,y,z)];
    cr.remove();
    this.entity.place(x,y,z);
    cr.place(x0,y0,z0);
    HTomb.GUI.pushMessage(this.entity.describe() + " displaces " + cr.describe() + ".");
  },
  moveTo: function(x,y,z) {
    // unimplemented...use action points?
  },
  // If the square is crossable and unoccupied
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
  // If the square is crossable for this creature
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
