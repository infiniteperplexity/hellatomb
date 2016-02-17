Tomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var World = HTomb.World;
  var features = World.features;
var coord = HTomb.coord;

  var tiles = World.tiles;
  var levels = World.levels;
  var portals = World.portals;

  // default passability function
  var t;
  function defaultPassable(x,y,z) {
    if (x<0 || x>=LEVELW || y<0 || y>=LEVELH || z<0 || z>=NLEVELS) {
      return false;
    }
    t = tiles[z][x][y];
// t = _fastgrid[z*LEVELH*NLEVELS+y*LEVELH+x];
    return (t.solid===undefined && t.fallable===undefined);
  }

  // choose between absolute grid distance or euclidean diagonal distance
  var abs = Math.abs;
  function h1(x0,y0,z0,x1,y1,z1) {
    return abs(x1-x0)+abs(y1-y0)+abs(z1-z0);
  }
  function h2(x0,y0,z0,x1,y1,z1) {
    return Math.sqrt((x1-x0)*(x1-x0)+(y1-y0)*(y1-y0)+(z1-z0)*(z1-z0));
  }
  var h = h1;

  var _fastgrid;
  //function aStar(x0,y0,z0,x1,y1,z1,canPass) {
  HTomb.Path.aStar = function(x0,y0,z0,x1,y1,z1,options) {
    if (x0+y0+z0+x1+y1+z1===undefined) {
      alert("bad path arguments!");
    }
    console.log("finding path...");
    //_fastgrid = HTomb.World._fastgrid;
    options = options || {};
    var useFirst = options.useFirst || false;
    var useLast = options.useLast || true;
    var canPass = options.canPass || defaultPassable;
    var usePortals = options.usePortals || true;

    // fastest possible lookup
    // random bias should be okay
    var dirs = [
      [ 0, -1],
      [ 1, -1],
      [ 1,  0],
      [ 1,  1],
      [ 0,  1],
      [-1,  1],
      [-1,  0],
      [-1, -1]
    ].randomize();
    var current, next, this_score, h_score, crd;
    var checked = {}, scores = {}, retrace = {}, path = [];
    // it costs zero to get to the starting square
    scores[coord(x0,y0,z0)] = 0;
    //square that need to be checked
    //three-dimensional coordinate, and estimated (heuristic) distance
    var tocheck = [[x0,y0,z0,this_score+h(x0,y0,z0,x1,y1,z1)]];
    // keep checking until the algorithm finishes
    while (tocheck.length>0) {
      // choose the highest-priority square
      current = tocheck.shift();
      // calculate the fast lookup
      crd = coord(current[0],current[1],current[2]);
      // check if we have found the target square (or maybe distance==1?)
      if (current[0]===x1 && current[1]===y1 && current[2]===z1) {
      // if (current[6]===1) {
        // start with the goal square
        path = [[current[0],current[1],current[2]]];
        // until we get back to the starting square...
        while (current[0]!==x0 || current[1]!==y0 || current[2]!==z0) {
          // retrace the path by one step
          current = retrace[crd];
          // calculate the fast coordinate
          crd = coord(current[0],current[1],current[2]);
          // add the next square to the returnable path
          path.unshift([current[0],current[1],current[2]]);
        }
        // return the complete path
        if (path.length>0 && useFirst===false) {
          path.shift();
        }
        if (path.length>0 && useLast===false) {
          path.pop();
        }
        return path;
      }
      // we are now checking this square
      checked[crd] = true;
      // loop through neighboring cells
      for (var i=-1; i<8; i++) {
        // -1 is the place where we check for portals
        if (i===-1) {
          if (usePortals===false) {
            continue;
          }
          // right now cannot handle multiple portals in one square
          if (portals[crd]) {
            next = portals[crd];
          } else {
            continue;
          }
        } else {
          // grab a neighboring square
          next = [current[0]+dirs[i][0],current[1]+dirs[i][1],current[2]];
        }
        crd = coord(next[0],next[1],next[2]);
        // if this one has been checked already then skip it
        if (checked[crd]) {
          //HTomb.GUI.drawAt(next[0],next[1],"X","purple","black");
          continue;
        }
        // otherwise set the score equal to the distance from the starting square
          // this assumes a uniform edge cost of 1
        this_score = scores[coord(current[0],current[1],current[2])]+1;
        // if there is already a better score for this square then skip it
        if (scores[crd]!==undefined && scores[crd]<=this_score) {
          //HTomb.GUI.drawAt(next[0],next[1],"X","yellow","black");
          continue;
        }
        // if the move is not valid then skip it
        if (canPass(next[0],next[1],next[2])===false) {
          //HTomb.GUI.drawAt(next[0],next[1],"X","red","black");
          continue;
        }
        h_score = this_score + h(next[0],next[1],next[2],x1,y1,z1);
        if (isNaN(h_score)) {
          alert("scoring failed!");
        }
        //HTomb.GUI.drawAt(next[0],next[1],"X","green","black");
        // now add it to the to-do list unless it already has a better score on there
        for (var j=0; j<tocheck.length; j++) {
          // if this score is better than the one being checked...
          if (h_score<=tocheck[j][3]) {
            // insert it into the priority queue based on estimated distance
            tocheck.splice(j,0,[next[0],next[1],next[2],h_score]);
            // use this as a flag
            h_score = -1;
            break;
          }
        }
        // if it is worse than the worst score on the list, add to the end
        if (h_score>-1) {
          //tocheck.push([next[0],next[1],next[2],this_score+abs(next[0]-x1)+abs(next[1]-y1)+abs(next[2]-z1)]);
          tocheck.push([next[0],next[1],next[2],h_score]);
        }
        // set the parent square in the potential path
        retrace[crd] = [current[0],current[1],current[2]];
        // save the new best score for this square
        scores[crd] = this_score;
      }
    }

    console.log("path failed");
    return false;
  };

  // The FOV submodule contains vision algorithms, which should be highly optimized
  HTomb = (function(HTomb) {
    "use strict";
    var LEVELW = HTomb.Constants.LEVELW;
    var LEVELH = HTomb.Constants.LEVELH;
    var tiles = HTomb.World.tiles;
  var visible = HTomb.World.visible;
  var explored = HTomb.World.explored;
  var grid;
    var x0,y0,z0;


    var passlight = function(x,y) {
        //constrain to the grid
        if (x<=0 || x>=LEVELW-1 || y<=0 || y>=LEVELH-1) {
          return false;
        }
        //curve the edges
        if (Math.sqrt((x-x0)*(x-x0)+(y-y0)*(y-y0)) > r0) {
          return false;
        }
        //only opaque tiles block light
        //if this ever changes use a different FOV
        return (grid[x][y]].opaque === undefined);
    };

    var show = function(x,y,r,v) {
      visible[z0][x][y] = true;
      explored[z0][x][y] = true;
      if (gridx][y].zview===+1) {
        explored[z0+1][x][y] = true;
      } else if (grid[x][y].zview===-1) {
        explored[z0-1][x][y] = true;
      }
    };

    var caster = new ROT.FOV.PreciseShadowcasting(passlight);

    HTomb.FOV.resetVisible = function() {
      for (var x=0; x<LEVELW; x++) {
        for (var y=0; y<LEVELH; y++) {
          visible[z0][x][y] = false;
        }
      }
    };
    HTomb.FOV.findVisible = function(x,y,z,r) {
      //test code
      x0 = x;
      y0 = y;
      r0 = r;
      //end test
  z0 = z;
      grid = tiles[z];
      caster.compute(x,y,r,show);
    };

    return HTomb;
  })(HTomb);

  // The FOV submodule contains vision algorithms, which should be highly optimized
  HTomb = (function(HTomb) {
    "use strict";
    var LEVELW = HTomb.Constants.LEVELW;
    var LEVELH = HTomb.Constants.LEVELH;
    var tiles = HTomb.World.tiles;
  var visible = HTomb.World.visible;
  var explored = HTomb.World.explored;
  var grid;
    var x0,y0,z0;


    var passlight = function(x,y) {
        //constrain to the grid
        if (x<=0 || x>=LEVELW-1 || y<=0 || y>=LEVELH-1) {
          return false;
        }
        //curve the edges
        if (Math.sqrt((x-x0)*(x-x0)+(y-y0)*(y-y0)) > r0) {
          return false;
        }
        //only opaque tiles block light
        //if this ever changes use a different FOV
        return (grid[x][y]].opaque === undefined);
    };

    var show = function(x,y,r,v) {
      visible[z0][x][y] = true;
      explored[z0][x][y] = true;
      if (gridx][y].zview===+1) {
        explored[z0+1][x][y] = true;
      } else if (grid[x][y].zview===-1) {
        explored[z0-1][x][y] = true;
      }
    };

    var caster = new ROT.FOV.PreciseShadowcasting(passlight);

    HTomb.FOV.resetVisible = function() {
      for (var x=0; x<LEVELW; x++) {
        for (var y=0; y<LEVELH; y++) {
          visible[z0][x][y] = false;
        }
      }
    };
    HTomb.FOV.findVisible = function(x,y,z,r) {
      //test code
      x0 = x;
      y0 = y;
      r0 = r;
      //end test
  z0 = z;
      grid = tiles[z];
      caster.compute(x,y,r,show);
    };

    return HTomb;
  })(HTomb);


  HTomb.Save.saveGame = function() {
var saveGame = {};
saveGame.things = HTomb.World.things;
saveGame.tiles = HTomb.World.tiles;
saveGame.explored = HTomb.World.explored;
saveGame.creatures = HTomb.World.creatures;
saveGame.items = HTomb.World.items;
saveGame.features = HTomb.World.features;
saveGame.zones = HTomb.World.zones;
saveGame.tasks = HTomb.World.tasks;
var json = stringify(saveGame);
return json;
}
function stringify(obj) {
var json = JSON.stringify(obj, function(key, val) {
// if it has special instructions, use those to stringify
if (val.stringify) {
return val.stringify();
// if it's from the global things table, stringify it normally
} else if (this===HTomb.World.things) {
return val;
// if it's on the global things table, stringify its ID
} else if (val.thingId) {
if (val.thingId==="static") {
return {staticThing: val.template};
} else {
return {thingId: val.thingId};
}
} else {
// otherwise stringify it normally
return val;
}
}
}

function fillListFrom(fromList, toList) {
if (Array.isArray(fromList) && Array.isArray(toList)) {
while(toList.length>0) {
toList.pop();
}
for (var i=0; i<fromList.length; i++) {
toList.push(fromList[i]);
}
} else {
for (var t in toList) {
delete toList[t];
}
for (var f in fromList) {
toList[f] = fromList[f];
}
}
}
function fillGrid3dFrom(fromGrid, toGrid, callb) {
// default callback is to return self
callb = callb || function(x) {return x;};
// pull all elements from old grid
for (var z=0; z<NLEVELS; z++) {
for (var x=0; x<LEVELW; x++) {
for (var y=0; y<LEVELH; y++) {
toGrid[z][x][y] = callb(fromGrid[z][x][y]);
}
}
}
}
HTomb.Save.restoreGame(saveGame) {
var thingParse = JSON.parse(saveGame);
var restParse = JSON.parse(saveGame, function(key, val) {
if (key==="thingId") {
return thingParse.things[val];
} else if (key==="staticThing") {
return HTomb.Things.template[val]();
} else {
return val;
}
};
fillListFrom(thingParse.things, HTomb.World.things);
fillGridFrom(restParse.tiles, HTomb.World.tiles, HTomb.Things.templates.Terrain.parse);
fillGridFrom(restParse.explored, HTomb.World.explored);
fillListFrom(restParse.creatures, HTomb.World.creatures);
fillListFrom(restParse.items, HTomb.World.items);

    fillListFrom(restParse.features, HTomb.World.features);
    fillListFrom(restParse.zones, HTomb.World.zones);
    fillListFrom(restParse.tasks, HTomb.World.tasks);

}
