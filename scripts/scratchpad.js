
var promise = new Promise(function(resolve,reject)) {
  //do a thing, possibly asynch
  if (/**/) {
    resolve("stuff worked");
  } else {
    reject(Error("It broke!"));
  }
});

var promise = new Promise(function(resolve, reject) {
  resolve(1);
});

promise.then(function(val) {
  console.log(val);
  return val+2;
}).then(function(val) {
  console.log(val);
});



HTomb.Save.testing = function() {
  var list = ['"['];
  for (var i=0; i<HTomb.World.things.length; i++) {
      console.log(i);
      if (i>0) {
        list.push(",");
      }
      list.push(HTomb.Save.stringify(HTomb.World.things[i],true));
      //if (i>1000) {
      //  break;
      //}
    }
  list.push(']"');
  var json = list.join('');
  return json;
};

var fewer = HTomb.World.things.splice(0,10);
HTomb.Save.promises = function() {
  var list = [];
  var sequence = Promise.resolve();
  fewer.forEach(function(e,i,a) {
    sequence = sequence.then(function() {
      console.log(i);
      list.push(HTomb.Save.stringify(e));
    });
  });
};

var i=0;
(function () {
    for (; i < 6000000; i++) {
        /*
            Normal processing here
        */

        // Every 100,000 iterations, take a break
        if ( i > 0 && i % 100000 == 0) {
            // Manually increment `i` because we break
            i++;
            console.log(i);
            // Set a timer for the next iteration
            window.setTimeout(arguments.callee);
            break;
        }
    }
})();




var i=0;
list = [];

var i=0;
list = [];
function save () {
  for (; i<HTomb.World.things.length; i++) {
    list.push(HTomb.Save.stringify(HTomb.World.things[i]));
    if (i>0 && i%1000===0) {
      var bg = ROT.Colconsole.log(i);
      i++;
      setTimeout(save);
  ;
    }
  }
}

function splitter(prep, fun) {

}

HTomb.Types.define({
  template: "Cover",
  name: "cover",
  plural: true,
  liquid: false,
  shimmer: function() {
    var bg = ROT.Color.fromString(this.bg);
    bg = ROT.Color.randomize(bg,[bg[0]/16, bg[1]/16, bg[2]/16]);
    bg = ROT.Color.toHex(bg);
    return bg;
  },
  darken: function() {
    var bg = ROT.Color.fromString(this.bg);
    bg = ROT.Color.multiply(bg,[72,128,192]);
    bg = ROT.Color.toHex(bg);
    return bg;
  },
  flood: function(x,y,z) {
    var t = HTomb.World.covers[coord(x,y,z-1)];
    var water;
    if (HTomb.World.tiles[z-1][x][y].solid!==true && t.liquid===undefined) {
      HTomb.World.covers[coord(x,y,z)] = this;
      this.flood(x,y,z);
      // if we flood below, don't flood to the sides...should this happen each turn?
      return;
    }
    var neighbors = HTomb.Tiles.neighbors(x,y,4);
    for (var i=0; i<neighbors.length; i++) {
      x = neighbors[i][0];
      y = neighbors[i][1];
      t = HTomb.World.covers[coord(x,y,z)];
      if (HTomb.World.tiles[z][x][y].solid===true || (t && t.liquid)) {
        continue;
      }
      HTomb.World.covers = this;
      this.flood(x,y,z);
    }
  }
});

/*
So...as of right now, serializing the "cover" objects is a horrendous waste.  Every grass tile is
the same as every other grass tile.  And every water tile is the same as every other water tile,
and same with lava.  In addition, the water tiles, of which there are thousands, have long "each"
properties, and store two references to each of their two behaviors.

The ideal solution here would be to...well...it would be nice if we could have polymorphous
stuff going on...be able to have two different kinds of "cover" or "fill": Types and Things.

But let's say we wanted to do just Type.  What would we lose?
- We'd need at least six different kinds of water, one for each direction of flow or lack thereof.  And there won't be any speed of flow...
- We would lose the flexibility to change water depth in the future, or add other similar properties.
- No cover could have behaviors; for example, lava could not have PointLightBehavior.

So...let's talk about polymorphism.  The main obvious problem is that Types might have a hard time
implementing the Entity methods.
x, y, and z are bad for that.
place works.
remove doesn't work, without additional arguments.  Same with "destroy".
So that's not very promising.

Some options:
- Presume that Type, rather than Entity, is the interface we're shooting for.
- Build a lightweight entity that wraps around a Type but doesn't get serialized.
- Build temporary Entities on the fly when you access the Type.
- Just go with the simpler option and support only Types.
- Yet another option: pair the values, so we have a Type *and* an optional Thing in each square.

Ugh...that's actually starting to seem like an attractive option...convert UpSlope and DownSlope back
into features?  Although...I think I do allow features on slopes, actually.  Yup, and making those
into features would lead to a proliferation of feature instances.  So yeah, walking back from *that*
ledge.

- Hmmm...I could make water into another type of tile.  But bear in mind, that still implies,
for each liquid, multiple tile types.

- What other kinds of "cover" might we someday have?  Fire?  Mud?  Soil?  Very few of these have
any properties that would require instances.  What about traps...are those features?  Spiderwebs?

- So...honestly I don't see liquids being all that important.  Like, nothing compared to Dwarf Fortress.  So maybe
let's just make them a Type.

- Okay, but just one second first...so...I can totally do this...ThingWrapper?

- Ugh...so..."infinite" is another potentially instanced thing.  Should we create yet another type for it?
- There are two kinds of liquid in minecraft...infinite and flowing.
*/


HTomb.Things.defineCover({
  template: "Water",
  name: "water",
  symbol: "~",
  flowSymbol: "\u2248",
  liquid: true,
  fg: HTomb.Constants.WATERFG || "#3388FF",
  bg: HTomb.Constants.WATERBG || "#1144BB"
});
HTomb.Things.defineCover({
  template: "Lava",
  name: "lava",
  symbol: "~",
  flowSymbol: "\u2248",
  liquid: true,
  fg: "#FF8833",
  bg: "#DD4411"
});

HTomb.Things.defineTerrain({
  template: "Grass",
  name: "grass",
  symbol: '"',
  fg: HTomb.Constants.GRASSFG ||"#668844",
  bg: HTomb.Constants.GRASSBG || "#334422"
});

})();
