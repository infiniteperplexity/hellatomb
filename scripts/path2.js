HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var World = HTomb.World;
  var features = HTomb.World.features;

  var terrain = HTomb.World.terrain;
  var levels = HTomb.World.levels;
  var fastgrid;
  function fastGrid() {
    fastgrid = [];
    for (var k=0; k<NLEVELS; k++) {
      for (var i=0; i<LEVELW; i++) {
        portals.push([]);
        for (var j=0; j<LEVELH; j++) {
          fastGrid.push(levels[k].grid[i][j]);
        }
      }
    }
  }
  var portals;
  function portalMap() {
    portals = [];
    for (var i=0; i<LEVELW; i++) {
      for (var j=0; j<LEVELW; j++) {
        portals.push([]);
        for (var k=0; k<NLEVELS; k++) {
          if (features[i*LEVELW*LEVELH + j*LEVELH + k] && features[i*LEVELW*LEVELH + j*LEVELH + k].portalTo) {
            portals.push(features[i*LEVELW*LEVELH + j*LEVELH + k].portalTo);
          }
          else {
            portals.push(false);
          }
        }
      }
    }
  }
  // default passability function
  function defaultPassable(x,y,z) {
    return (terrain[fastgrid[x+y*NLEVELS+z*NLEVELS*LEVELH]].solid===undefined);
  }
  function aStar(x0,y0,z0,x1,y1,z1,canPass) {
    canPass = canPass || defaultPassable;
    var abs = Math.abs;
    //squares already checked
    var checked = {};
    //square that need to be checked
    //three-dimensional coordinate, and estimated distance
    var tocheck = [[x0,y0,z0,abs(x0-x1)+abs(y0-y1)+abs(z0-z1)]];
    var dirs = ROT.DIRS[8];
    // it costs zero to get to the starting square
    var scores = {};
    scores[x0*LEVELW*LEVELH+y0*LEVELH+z0] = 0;
    var retrace = {};
    var path = [];
    var current;
    var next;
    var this_score;
    var coord;
    while (tocheck.length>0) {
      // choose the highest-priority square
      current = tocheck.unshift();
      coord = current[0]*LEVELW*LEVELH+current[1]*LEVELH+current[2];
      // check if we have found the target square (or maybe distance==1?)
      if (current[6]===0) {
      // if (current[6]===1) {
        // start with the goal square
        path = [[current[0],current[1],current[2]]];
        // until we get back to the starting square...
        while (current[0]!==x0 || current[1]!==y0 || current[2]!==z0) {
          // retrace the path by one step
          current = retrace[coord];
          coord = current[0]*LEVELW*LEVELH+current[1]*LEVELH+current[2];
          path.unshift([current[0],current[1],current[2]]);
        }
        // return the complete path
        return path;
      }
      // we are now checking this square
      checked[coord] = true;
      // loop through neighboring cells
      for (var i=-1; i<8; i++) {
        if (i===-1) {
          // if there are any portals here, check them first
            // right now cannot handle multiple portals in one square
          if (portals[coord]) {
            next = portals.coord;
          } else {
            continue;
          }
        } else {
          next = [current[0]+dirs[i][0],current[1]+dirs[i][1],current[2]];
        }
        coord = checked[next[0]*LEVELW*LEVELH+next[1]*LEVELH+next[2]];
        // if this one has been checked already then skip it
        if (checked[coord]) {
          continue;
        }
        // if the move is not valid then skip it
        if (canPass(next[0],next[1],next[2])===false) {
          continue;
        }
        // otherwise set the score equal to the distance from the starting square
        this_score = scores[current[0]*LEVELW*LEVELH+current[1]*LEVELH+current[2]]+1;
        // now add it to the to-do list unless it already has a better score on there
        for (var j=0; j<tocheck.length; j++) {
          // if this score is better than the one being checked...
          if (this_score<tocheck[j][3]) {
            // insert it into the priority queue based on estimated distance
            tocheck.splice(j,0,[next[0],next[1],next[2],abs(next[0]-x1)+abs(next[1]-y1)+abs(next[2]-z1)]);
            retrace[key] = current[0]*LEVELW*LEVELH+current[1]*LEVELH+current[2];
            // flag it as inserted
            this_score = -1;
            break;
          }
        }
        // if it is worse than the worst score on the list, add to the end
        if (this_score>tocheck[tocheck.length-1][3]) {
          tocheck.push([next[0],next[1],next[2],this_score]);
        }
      }
    }
  }

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
