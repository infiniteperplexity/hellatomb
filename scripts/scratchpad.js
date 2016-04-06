function Instance(template) {
  let handler = {
    set: function(target, property, value, receiver) {
      if (this.instance===undefined) {
        this.instance = Object.create(target);
        this.instance[property] = value;
      }
    },
    get: function(target, property, receiver) {
      if (property==="instance") {
        return this.instance;
      } else if (property==="template") {
        return target;
      } else {
        return this.instance[property];
      }
    }
  };
  return new Proxy(t, handler);
}

function SparseGrid() {
  let LEVELH = 100;
  let LEVELW = 100;
  let arr = {};
  let zHandler = {
    set: function() {},
    get: function(ztarget, z) {
      let xHandler = {
        get: function(xtarget, x) {
          let yHandler = {
            set: function(target, y, value) {
              arr[z*LEVELH*LEVELW + x*LEVELH + y] = value;
            },
            get: function(target, y) {
              return arr[z*LEVELH*LEVELW + x*LEVELH + y];
            }
          };
          return new Proxy({}, yHandler);
        }
      };
      return new Proxy({}, xHandler);
    }
  };
  return new Proxy(arr, zHandler);
}

HTomb.World.creatures = SparseGrid();

function FastGrid() {
  let LEVELH = 100;
  let LEVELW = 100;
  let NLEVELS = 50;
  let arr = [];
  for (let z=0; z<NLEVELS; z++) {
    arr.push([]);
    for (let x=0; x<LEVELW; x++) {
      arr[z].push([]);
      for (let y=0; y<LEVELH; y++) {
        arr[z][x] = null;
      }
    }
  }
  let zHandler = {
    set: function() {},
    get: function(ztarget, z) {
      let xHandler = {
        get: function(xtarget, x) {
          let yHandler = {
            set: function(target, y, value) {
              arr[z*LEVELH*LEVELW + x*LEVELH + y] = value;
            },
            get: function(target, y) {
              return arr[z*LEVELH*LEVELW + x*LEVELH + y];
            }
          };
          return new Proxy({}, yHandler);
        }
      };
      return new Proxy({}, xHandler);
    }
  };
  return new Proxy(arr, zHandler);
}


class AnimalES6 {
    constructor(name) {
      console.log("making ")
        this.name = name;
    }

    doSomething() {
        console.log("I'm a " + this.name);
    }
}

let lionES6 = new AnimalES6("Lion");
lionES6.doSomething();


class Foo {
  constructor() {
    console.log("making a Foo");
  }
}
class Bar extends Foo {
  constructor() {
    console.log("making a Bar");
  }
}
let baz = new Bar();


function BowyerWatson (pointList)
     // pointList is a set of coordinates defining the points to be triangulated
     triangulation := empty triangle mesh data structure
     add super-triangle to triangulation // must be large enough to completely contain all the points in pointList
     for each point in pointList do // add all the points one at a time to the triangulation
        badTriangles := empty set
        for each triangle in triangulation do // first find all the triangles that are no longer valid due to the insertion
           if point is inside circumcircle of triangle
              add triangle to badTriangles
        polygon := empty set
        for each triangle in badTriangles do // find the boundary of the polygonal hole
           for each edge in triangle do
              if edge is not shared by any other triangles in badTriangles
                 add edge to polygon
        for each triangle in badTriangles do // remove them from the data structure
           remove triangle from triangulation
        for each edge in polygon do // re-triangulate the polygonal hole
           newTri := form a triangle from edge to point
           add newTri to triangulation
     for each triangle in triangulation // done inserting points, now clean up
        if triangle contains a vertex from original super-triangle
           remove triangle from triangulation
     return triangulation
