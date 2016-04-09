Tomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var World = HTomb.World;
  var features = World.features;
  var coord = HTomb.Utils.coord;
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
    //perhaps run a quick check to make sure neither end of the path is enclosed?
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
          HTomb.Utils.arrayInArray([x1,y1,z1],HTomb.Tiles.touchableFrom(current[0],current[1],current[2]))>-1)) {
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
          if (tiles[current[2]][current[0]][current[1]].zmove!==undefined) {
            next = [current[0],current[1],current[2]+tiles[current[2]][current[0]][current[1]].zmove];
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
          console.log(this_score);
          console.log(next);
          console.log([x1,y1,z1]);
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

  HTomb.Path.quickDistance = function(x0,y0,z0,x1,y1,z1) {
    return Math.sqrt((x1-x0)*(x1-x0)+(y1-y0)*(y1-y0)+(z1-z0)+(z1-z0));
  };

  HTomb.Path.closest = function(e,arr) {
    arr.sort(function(a,b) {
      return HTomb.Path.quickDistance(e.x,e.y,e.z,a.x,a.y,a.z) - HTomb.Path.quickDistance(e.x,e.y,e.z,b.x,b.y,b.z);
    });
    return arr;
  };
  HTomb.Path.closestCallback = function(e) {
    return function(a,b) {
      return HTomb.Path.quickDistance(e.x,e.y,e.z,a.x,a.y,a.z) - HTomb.Path.quickDistance(e.x,e.y,e.z,b.x,b.y,b.z);
    };
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

  HTomb.Path.vonNeumann = function(x,y,n,hollow) {
    n = n || 1;
    let coords = [];
    let dirs = ROT.DIRS[4];
    let j1 = 1;
    if (hollow) {
      j1 = n;
    }
    for (let i=0; i<dirs.length; i++) {
      for (let j=j1; j<=n; j++) {
        let x1 = x+j*dirs[i][0]
        let y1 = y+j*dirs[i][1];
        if (x1>0 && x1<LEVELW-1 && y1>0 && y1<LEVELH-1) {
          coords.push([x1,y1]);
        }
      }
    }
    return coords;
  }
  HTomb.Path.moore = function(x,y,n,hollow) {
    n = n || 1;
    let coords = [];
    let k0 = 1;
    if (hollow) {
      k0 = n;
    }
    for (let k=k0; k<=n; k++) {
      for (let i=x-k; i<=x+k; i++) {
        coords.push([i,y+k]);
        coords.push([i,y-k]);
        console.log("pushed via x");
      }
      for (let j=y-k+1; j<=y+k-1; j++) {
        coords.push([x+k,j]);
        coords.push([x-k,j]);
        console.log("pushed via y");
      }
    }
    return coords;
  }


  HTomb.Path.bruteVoronoi = function(points) {
    // for testing purposes
    if (points===undefined) {
      points = [];
      for (let i=1; i<LEVELW-1; i++) {
        for (let j=1; j<LEVELH-1; j++) {
          if (Math.random()<0.001) {
            points.push([i,j]);
          }
        }
      }
    }
    HTomb.Utils.shuffle(points);
    let v = {};
    v.edges = [];
    v.vertices = [];
    v.regions = [];
    for (let p=0; p<points.length; p++) {
      v.edges.push([]);
      v.vertices.push([]);
      v.regions.push([]);
      v.points.push([]);
    }
    for (let x=1; x<LEVELW-1; x++) {
      for (let y=1; y<LEVELW-1; y++) {
        let distances = [];
        for (let p=0; p<points.length; p++) {
          let i = points[p][0];
          let j = points[p][1];
          let d = Math.floor(Math.sqrt((x-i)*(x-i)+(y-j)*(y-j)));
          distances.push([d,p]);
        }
        distances.sort(function(a,b) {
          if (a[0]<b[0]) {
            return -1
          } else if (a[0]>b[0]) {
            return 1;
          } else {
            return 0;
          }
        });
        if (distances[0][0]!==distances[1][0]) {
          // it's a region...which region is it?
          v.regions[distances[0][1]].push([x,y]);
        } else if (distances[0][0]!==distances[2][0]) {
          // it's an edge...which edge is it?
          v.edges[distances[0][1]].push([x,y]);
          v.edges[distances[1][1]].push([x,y]);
        } else {
          // it's a vertex...which vertex is it?
          for (let k=0; k<distances.length; k++) {
            if (distances[k][0]===distances[0][0]) {
              v.vertices[distances[k][1]].push([x,y]);
            }
          }
        }
      }
    }
    v.points
    return v;
  };
  function initRings() {
    let circles = [];
    for (let i=0; i<LEVELW; i++) {
      let ring = [];
      for (let x=-i; x<=i; x++) {
        for (let y=-i; y<=i; y++) {
          if (Math.round(Math.sqrt(x*x+y*y))===i) {
            ring.push([x,y]);
          }
        }
      }
      circles.push(ring);
    }
    return circles;
  }
  HTomb.Path.concentric = initRings();
  HTomb.Path.voronoi = function(points,thickness) {
    let grid = [];
    for (let x=0; x<LEVELW-1; x++) {
      grid.push([]);
      for (let y=0; y<LEVELH-1; y++) {
        grid[x].push(null);
      }
    }
    let visited = 0;
    points = HTomb.Utils.shuffle(points);
    // until all squares have been visited
    let n = 0;
    while (visited<(LEVELW-2)*(LEVELH-2)) {
      let ring = HTomb.Path.concentric[n];
      for (let i=0; i<points.length; i++) {
        for (let j=0; j<ring.length; j++) {
          let c = ring[j];
          let x = points[i][0];
          let y = points[i][1];
          if (x+c[0]>=LEVELW-1 || x+c[0]<=0 || y+c[1]>=LEVELH-1 || y+c[1]<=0) {
            continue;
          } else if (grid[x+c[0]][y+c[1]]===null) {
            grid[x+c[0]][y+c[1]] = i;
            visited+=1;
          }
        }
      }
      n+=1;
    }
    let v = {};
    v.edges = [];
    v.regions = [];
    v.vertices = [];
    v.boundaries = [];
    let boundaries = [];
    for (let i=1; i<LEVELW-1; i++) {
      for (let j=1; j<LEVELH-1; j++) {
        let boundary = false;
        let regions = [grid[i][j]];
        let coords = HTomb.Path.vonNeumann(i,j,thickness);
        for (let k=0; k<coords.length; k++) {
          let c = coords[k];
          if (grid[c[0]][c[1]]<grid[i][j]) {
            boundary = true;
          }
        }
        if (boundary===true) {
          v.boundaries.push([i,j]);
        } else {
          v.regions.push([i,j]);
        }
        coords = HTomb.Path.vonNeumann(i,j,1);
        for (let k=0; k<coords.length; k++) {
          let c = coords[k];
          if (regions.indexOf(grid[c[0]][c[1]])===-1) {
            regions.push(grid[c[0]][c[1]]);
          }
        }
        if (regions.length>2) {
          v.vertices.push([i,j]);
        }
      }
    }
    for (let p=0; p<points.length; p++) {
      v.points[p] = {
        regions: Array.from(v.regions[p]),
        edges: Array.from(v.edges[p]),
        vertices: Array.from(v.vertices[p])
      };
    }
    return v;
  };


  HTomb.Path.DjikstraMap = function() {
    this.grid = [];
    for (let x=0; x<LEVELW-1; x++) {
      this.grid.push([]);
      for (let y=0; y<LEVELH-1; y++) {
        this.grid.push(LEVELH*LEVELW);
      }
    }
  }
return HTomb;
})(HTomb);
