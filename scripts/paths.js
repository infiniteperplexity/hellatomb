HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var levels = HTomb.World.levels;
  var grid0;
  var grid1;
  var tiles = HTomb.World.tiles;
  var path;
  var passable = function(x,y) {
    if (x<0 || x>=LEVELW || y<0 || y>=LEVELH) {
      return false;
    }
    return tiles[grid0[x][y]].solid === undefined;
  };
  var onpath = function(x,y) {
    path.push([x,y]);
  };
  //options may be able to hold different passability functions
  HTomb.Path.astar = function(x0,y0,z0,x1,y1,z1,options) {
    grid0 = levels[z0].grid;
    grid1 = levels[z1].grid;
    // eventually need to implement this hierarchically
    var astar = new ROT.Path.AStar(x1,y1,passable);
    path = [];
    astar.compute(x0,y0,onpath);
    return path;
  };
  HTomb.Path.test = function(x,y) {
    var mypath = HTomb.Path.astar( HTomb.World.Player.x,
          HTomb.World.Player.y,
          HTomb.World.Player.z,
          x, y,
          HTomb.World.Player.z
    );
    console.log(mypath);
    var coord;
    for (var i=0; i<mypath.length; i++) {
      coord = mypath[i];
      HTomb.Display.drawAt(coord[0],coord[1],"*","green","black");
    }
  };

  HTomb.Path.djikstra = function(x0,y0,z0,x1,y1,z1,options) {
    grid0 = levels[z0].grid;
    grid1 = levels[z1].grid;
    // eventually need to implement this hierarchically
    var dj = new ROT.Path.Djikstra(x1,y1,passable);
    path = [];
    dj.compute(x0,y0,onpath);
    return path;
  };

  return HTomb;
})(HTomb);

/*
ROT.Path = function(toX, toY, passableCallback, options) {
	this._toX = toX;
	this._toY = toY;
	this._fromX = null;
	this._fromY = null;
	this._passableCallback = passableCallback;
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

ROT.Path.Dijkstra = function(toX, toY, passableCallback, options) {
	ROT.Path.call(this, toX, toY, passableCallback, options);

	this._computed = {};
	this._todo = [];
	this._add(toX, toY, null);
}
ROT.Path.Dijkstra.extend(ROT.Path);

ROT.Path.Dijkstra.prototype.compute = function(fromX, fromY, callback) {
	var key = fromX+","+fromY;
	if (!(key in this._computed)) { this._compute(fromX, fromY); }
	if (!(key in this._computed)) { return; }

	var item = this._computed[key];
	while (item) {
		callback(item.x, item.y);
		item = item.prev;
	}
}

ROT.Path.Dijkstra.prototype._compute = function(fromX, fromY) {
	while (this._todo.length) {
		var item = this._todo.shift();
		if (item.x == fromX && item.y == fromY) { return; }

		var neighbors = this._getNeighbors(item.x, item.y);

		for (var i=0;i<neighbors.length;i++) {
			var neighbor = neighbors[i];
			var x = neighbor[0];
			var y = neighbor[1];
			var id = x+","+y;
			if (id in this._computed) { continue; }
			this._add(x, y, item);
		}
	}
}

ROT.Path.Dijkstra.prototype._add = function(x, y, prev) {
	var obj = {
		x: x,
		y: y,
		prev: prev
	}
	this._computed[x+","+y] = obj;
	this._todo.push(obj);
}

ROT.Path.AStar = function(toX, toY, passableCallback, options) {
	ROT.Path.call(this, toX, toY, passableCallback, options);

	this._todo = [];
	this._done = {};
	this._fromX = null;
	this._fromY = null;
}
ROT.Path.AStar.extend(ROT.Path);


ROT.Path.AStar.prototype.compute = function(fromX, fromY, callback) {
	this._todo = [];
	this._done = {};
	this._fromX = fromX;
	this._fromY = fromY;
	this._add(this._toX, this._toY, null);

	while (this._todo.length) {
		var item = this._todo.shift();
		if (item.x == fromX && item.y == fromY) { break; }
		var neighbors = this._getNeighbors(item.x, item.y);

		for (var i=0;i<neighbors.length;i++) {
			var neighbor = neighbors[i];
			var x = neighbor[0];
			var y = neighbor[1];
			var id = x+","+y;
			if (id in this._done) { continue; }
			this._add(x, y, item);
		}
	}

	var item = this._done[fromX+","+fromY];
	if (!item) { return; }

	while (item) {
		callback(item.x, item.y);
		item = item.prev;
	}
}

ROT.Path.AStar.prototype._add = function(x, y, prev) {
	var obj = {
		x: x,
		y: y,
		prev: prev,
		g: (prev ? prev.g+1 : 0),
		h: this._distance(x, y)
	}
	this._done[x+","+y] = obj;



	var f = obj.g + obj.h;
	for (var i=0;i<this._todo.length;i++) {
		var item = this._todo[i];
		if (f < item.g + item.h) {
			this._todo.splice(i, 0, obj);
			return;
		}
	}

	this._todo.push(obj);
}

ROT.Path.AStar.prototype._distance = function(x, y) {
	switch (this._options.topology) {
		case 4:
			return (Math.abs(x-this._fromX) + Math.abs(y-this._fromY));
		break;

		case 6:
			var dx = Math.abs(x - this._fromX);
			var dy = Math.abs(y - this._fromY);
			return dy + Math.max(0, (dx-dy)/2);
		break;

		case 8:
			return Math.max(Math.abs(x-this._fromX), Math.abs(y-this._fromY));
		break;
	}

        throw new Error("Illegal topology");
}
*/
