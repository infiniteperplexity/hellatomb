HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var World = HTomb.World;
  var features = World.features;

  var terrain = World.terrain;
  var levels = World.levels;
  var portals =World.portals;

  // default passability function
  var t;
  function defaultPassable(x,y,z) {
    if (x<0 || x>=LEVELW || y<0 || y>=LEVELH || z<0 || z>=NLEVELS) {
      return false;
    }
    t = terrain[levels[z].grid[x][y]];
    //t = terrain[_fastgrid[y+x*LEVELH+z*LEVELH*LEVELW]];
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
    var current, next, this_score, h_score, coord;
    var checked = {}, scores = {}, retrace = {}, path = [];
    // it costs zero to get to the starting square
    scores[x0*LEVELW*LEVELH+y0*LEVELH+z0] = 0;
    //square that need to be checked
    //three-dimensional coordinate, and estimated (heuristic) distance
    var tocheck = [[x0,y0,z0,this_score+h(x0,y0,z0,x1,y1,z1)]];
    // keep checking until the algorithm finishes
    while (tocheck.length>0) {
      // choose the highest-priority square
      current = tocheck.shift();
      // calculate the fast lookup
      coord = current[0]*LEVELW*LEVELH+current[1]*LEVELH+current[2];
      // check if we have found the target square (or maybe distance==1?)
      if (current[0]===x1 && current[1]===y1 && current[2]===z1) {
      // if (current[6]===1) {
        // start with the goal square
        path = [[current[0],current[1],current[2]]];
        // until we get back to the starting square...
        while (current[0]!==x0 || current[1]!==y0 || current[2]!==z0) {
          // retrace the path by one step
          current = retrace[coord];
          // calculate the fast coordinate
          coord = current[0]*LEVELW*LEVELH+current[1]*LEVELH+current[2];
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
      checked[coord] = true;
      // loop through neighboring cells
      for (var i=-1; i<8; i++) {
        // -1 is the place where we check for portals
        if (i===-1) {
          if (usePortals===false) {
            continue;
          }
          // right now cannot handle multiple portals in one square
          if (portals[coord]) {
            next = portals[coord];
          } else {
            continue;
          }
        } else {
          // grab a neighboring square
          next = [current[0]+dirs[i][0],current[1]+dirs[i][1],current[2]];
        }
        coord = next[0]*LEVELW*LEVELH+next[1]*LEVELH+next[2];
        // if this one has been checked already then skip it
        if (checked[coord]) {
          //HTomb.GUI.drawAt(next[0],next[1],"X","purple","black");
          continue;
        }
        // otherwise set the score equal to the distance from the starting square
          // this assumes a uniform edge cost of 1
        this_score = scores[current[0]*LEVELW*LEVELH+current[1]*LEVELH+current[2]]+1;
        // if there is already a better score for this square then skip it
        if (scores[coord]!==undefined && scores[coord]<=this_score) {
          //HTomb.GUI.drawAt(next[0],next[1],"X","yellow","black");
          continue;
        }
        // if the move is not valid then skip it
        if (canPass(next[0],next[1],next[2])===false) {
          //HTomb.GUI.drawAt(next[0],next[1],"X","red","black");
          continue;
        }
        h_score = this_score + h(next[0],next[1],next[2],x1,y1,z1);
        if (isNan(h_score)) {
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
        retrace[coord] = [current[0],current[1],current[2]];
        // save the new best score for this square
        scores[coord] = this_score;
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

/*
def a_star(start, goal):
	start_square = start.square
	goal_square = goal.square
	#already checked
	checked = set()
	#need to check
	check = []
	check.append(start_square)
	#exact distance from start
	g_scores = {}
	#estimated distance to goal
	f_scores = {}
	g_scores[start_square] = 0
	f_scores[start_square] = start.distance(goal)
	#best path
	came_from = {}
	while check:
		check = sorted(check, coord=lambda square: -f_scores[square])
		current = check.pop()
		if current == goal_square:
			path = [goal_square]
			while current in came_from:
				current = came_from[current]
				path.insert(0,current)
			return path
		#if the goal square is blocked, accept an adjacent square
		elif not goal_square.passable and goal_square in current.edges():
			path = [current]
			while current in came_from:
				current = came_from[current]
				path.insert(0,current)
			return path

		checked.add(current)
		for neighbor in current.neighbors():
			if neighbor in checked:
				continue

			#I don't think this ever gets hit
			#this is totally wonky...you only want this added if the neighbor is literally impassable
			if not start.can_pass(current, neighbor) and neighbor != goal_square:
				checked.add(neighbor)
				continue

			try_g = g_scores[current] + 1
			if neighbor not in check or (g_scores[neighbor] and try_g < g_scores[neighbor]):
				came_from[neighbor] = current
				g_scores[neighbor] = try_g
				f_scores[neighbor] = g_scores[neighbor] + neighbor.distance(goal)
				if neighbor not in check:
					check.append(neighbor)

	print("path failed")
	return False


def djikstra_find(start, thing, min=0, max=12):
	start_square = start.square
	from .items import Item
	from .creatures import Creature
	checked = set()
	#need to check
	check = []
	check.append(start_square)
	while check:
		current = check.pop(0)
		if current.distance(start_square) > max:
			return False

		if current in checked:
			continue

		if issubclass(thing,Item):
			for item in current.items:
				if isinstance(item,thing) and current.distance(start_square) >= min:
					return current
		elif issubclass(thing,Creature):
			if isinstance(current.creature,thing) and current.distance(start_square) >= min:
				return current

		checked.add(current)
		for neighbor in current.neighbors():
			if neighbor in checked:
				continue
			elif start.can_pass(current,neighbor):
				check.append(neighbor)

	return False




  /*
  ROT.Path = function(toX, toY, passableCallback, options) {
  	this._toX = toX;
  	this._toY = toY;
  	this._fromX = null;
  	this._fromY = null;
  	this._passableCallback = passableC
    var err = dx-dy;
    allback;
  	this._options = {
  		topology: 8
  	}
  	for (var p in options) { this._options[p] = options[p]; }

  	this._dirs = ROT.DIRS[this._options.topology];
  	if (this._options.topology == 8) {
  		this._dirs = [
  			this._dirs[0],
  			this._dirs[2],
  			this._dirs[4],
  			this._dirs[6],
  			this._dirs[1],
  			this._dirs[3],
  			this._dirs[5],
  			this._dirs[7]
  		]
  	}
  }


  ROT.Path.prototype.compute = function(fromX, fromY, callback) {
  }

  ROT.Path.prototype._getNeighbors = function(cx, cy) {
  	var result = [];
  	for (var i=0;i<this._dirs.length;i++) {
  		var dir = this._dirs[i];
  		var x = cx + dir[0];
  		var y = cy + dir[1];

  		if (!this._passableCallback(x, y)) { continue; }
  		result.push([x, y]);
  	}

  	return result;
  }
*/
