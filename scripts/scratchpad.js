function graveyards(n) {
	n = n || 15;
	const PAD = 10;
	for (let i=0; i<n; i++) {
		let x = Math.floor(Math.random()*(LEVELW-PAD))+PAD/2;
		let y = Math.floor(Math.random()*(LEVELH-PAD))+PAD/2;
		placeGraveyard(x,y);
	}
}

function buildGraveyard(x,y) {
	let units = HTomb.Utils.dice(2,4)-1;
	let vertices = [];
	let weights = [rectangleGraves];
	function _recurse(x,y) {
		if (units<=0) {
			return;
		}
		let r = Math.floor(Math.random()*weights.length);
		let v = weights[r](x,y);
		vertices = vertices.concat(v);
		HTomb.Utils.shuffle(vertices);
		let p = vertices.unshift();
		let wh = Math.floor(HTomb.Utils.dice(2,4))/2)
		_recurse(p[0],p[1],HTomb.Utils.dice(2,4)+3,HTomb.Utils.dice(2,4)+3);
	}
	units-=1;
	_recurse(x,y);
}
/*
more possibilities...
	- diamond shape
	- rows of graves
	- columns of graves
	- checkerboard graves
	- rectangular spiral (what function?  not either or...we could do it the similar way)
	- we'll just stick with these two for now
*/

function rectangleGraves(x0, y0, w, h) {
	for (let x=0; x<w; x++) {
		for (let y=0; y<h; y++) {
			let x1 = x-w/2;
			let y1 = y-h/2;
			let z = HTomb.Tiles.groundLevel(x1,y1);
			if (x1%2===0 || y1%2===0) {
				if (x1>0 && x1<LEVELW-1 && y1>0 && y1<LEVELH-1) {
					// should be a placegrave function....
					HTomb.Things.Tombstone().place(x1,y1,z);
				}
			}
		}
	}
	let vertices = [];
	if (x0+w/2<LEVELW-1) {
		if (y0+h/2<LEVELH-1) {
			vertices.push([x0+w/2,y0+h/2]);
		}
		if (y0-h/2>0) {
			vertices.push([x0+w/2,y0-h/2]);
		}
	}
	if (x0-w/2>0) {
		if (y0+h/2<LEVELH-1) {
			vertices.push([x0-w/2,y0+h/2]);
		}
		if (y0-h/2>0) {
			vertices.push([x0-w/2,y0-h/2]);
		}
	}
}

function circularGraves(x0, y0, r) {
	for (let i=0; i<r; i++) {
		let ring = HTomb.Path.concentric[i];
		for (let j=0; j<ring.length; j++) {
			let x = ring[j][0]+x0;
			let y = ring[j][1]+y0;
			let z = HTomb.Tiles.groundLevel(x,y);
			if (i%2===0) {
				if (x>0 && x<LEVELW-1 && y>0 && y<LEVELH-1) {
					HTomb.Things.Tombstone.place(x,y,z);
				}
			}
		}
	}
}

/*
so...placegrave could be a grave, or a statue, or an empty space,
or a shrub...but let's not do that for now...or a pool, or a crypt.

*/
