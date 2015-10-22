function Entity(props) {
	props = props || {};
	for (var p in props if p ) {
		this[p] = props[p];
	}
	Object.defineProperties(this,"x",{
		get: function() {
			return this._x;
		},
		set: function(_x) {
			this._x = _x;
		}	
	});
	Object.defineProperty(this,"y",{
		get: function() {
			return this._y;
		},
		set: function(_x) {
			this._y = _y;
		}	
	});
	Object.defineProperty(this,"z",{
		get: function() {
			return this._z;
		},
		set: function(_z) {
			this._z = _z;
		}	
	});
	Object.defineProperty(this,"name",{
		get: function() {
			return this._name;
		},
		set: function(_name) {
			this._name = _name;
		}	
	});
	Object.defineProperty(this,"name",{
		get: function() {
			return this._name;
		},
		set: function(_name) {
			this._name = _name;
		}	
	});
}

function Component() {
	init: function(entity) {
	}
}

var Mobility = {
	init: function(props) {
		this.mobility = {};
		for (var p in props) {
			this.mobility[p] = props[p];
		}
		this.mobility.tryMove = function() {
		};
		this.mobility.move = function() {
		};
	}
}
var Tile = {
	init: function(props) {
		this.tile = {};
		for (var p in props) {
			this.tile[p] = props[p];
		}
	}
}
function Tile(x,y,z) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.tileType = FloorTile;
}
Object.defineProperties(Tile.prototype,"tileType",{
	get: function() {
		return this.tileType;
	},
	set: function(ttype) {
		this.tileType = ttype;
		this.opaque = ttype.opaque;
		this.solid = ttype.solid;
		this.unwalkable = tttype.fallable || this.solid;		
	}	
});
Object.defineProperties(Tile.prototype,"fallable",{
	get: function() {
		return this.ttype.fallable;
	}	
});
Object.defineProperties(Tile.prototype,"symbol",{
	get: function() {
		return this.ttype.symbol;
	}
});
Object.defineProperties(Tile.prototype,"lightLevel",{
	get: function() {
		return this.lightLevel || 0;
	},
	set: function(n) {
		this.lightLevel = n;
	}
});
//here's where we can go for crazy optimization
//problem: balance memory and speed.
	//solution: prioritize memory for serialization, and speed in play.
	// pathfinding and fov are the pain points/
	// fov wants direct access to opacity.
	// pathfinding wants direct access to...well...not 
FloorTile = {symbol: "."};
WallTile = {symbol: "#", opaque: true, solid: true};
PitTile = {symbol: "_",fallable: true};
WaterTile = {symbol: "~",fallable: true};