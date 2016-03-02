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
    // should this be able to handle doors?
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
    if (x0+y0+z0+x1+y1+z1===undefined || x1===null || y1===null || z1===null) {
      alert("bad path arguments!");
    }
    //_fastgrid = HTomb.World._fastgrid;
    options = options || {};
    var useFirst = options.useFirst || false;
    var useLast = (options.useLast===false) ? false : true;
    var canPass = options.canPass || defaultPassable;
    var usePortals = (options.usePortals===false) ? false : true;

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
      if ((current[0]===x1 && current[1]===y1 && current[2]===z1) || (useLast===false &&
          HTomb.coordInArray([x1,y1,z1],HTomb.Tiles.touchableFrom(current[0],current[1],current[2]))>-1)) {
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
        //if (path.length>0 && useLast===false) {
        //  path.pop();
        //}
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


  //bresenham's line drawing algorithm
  HTomb.Path.line = function(x0, y0, x1, y1){
    var path = [];
    var dx = Math.abs(x1-x0);
    var dy = Math.abs(y1-y0);
    var sx = (x0 < x1) ? 1 : -1;
    var sy = (y0 < y1) ? 1 : -1;
    var err = dx-dy;
    while(true){
      path.push([x0,y0]);
      if ((x0==x1) && (y0==y1)) break;
      var e2 = 2*err;
      if (e2 >-dy){ err -= dy; x0  += sx; }
      if (e2 < dx){ err += dx; y0  += sy; }
    }
    return path;
  };

  HTomb.Path.distance = function(x0, y0, x1, y1) {
    var line = HTomb.Path.line(x0,y0,x1,y1);
    // should be length-1?
    return line.length-1;
  };

  HTomb.Path.FloodFill = function(callb) {
    this._callback = callb;
    this.filled = {};
    this.compute = function(x,y) {
      if (this._callback(x,y) === true && this.filled[x+","+y] === undefined) {
        this.filled[x+","+y] = true;
        this.compute(x+1,y);
        this.compute(x-1,y);
        this.compute(x,y+1);
        this.compute(x,y-1);
      }
    };
  };

  HTomb.Path.flood = function(x,y,z) {
    grid0 = levels[z].grid;
    var f = new HTomb.Path.FloodFill(passable);
    f.compute(x,y);
    return f.grid;
  };
return HTomb;
})(HTomb);
