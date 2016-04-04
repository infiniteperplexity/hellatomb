function Instance(template) {
  var handler = {
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
  var LEVELH = 100;
  var LEVELW = 100;
  var arr = {};
  var zHandler = {
    set: function() {},
    get: function(ztarget, z) {
      var xHandler = {
        get: function(xtarget, x) {
          var yHandler = {
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
  var LEVELH = 100;
  var LEVELW = 100;
  var NLEVELS = 50;
  var arr = [];
  for (var z=0; z<NLEVELS; z++) {
    arr.push([]);
    for (var x=0; x<LEVELW; x++) {
      arr[z].push([]);
      for (var y=0; y<LEVELH; y++) {
        arr[z][x] = null;
      }
    }
  }
  var zHandler = {
    set: function() {},
    get: function(ztarget, z) {
      var xHandler = {
        get: function(xtarget, x) {
          var yHandler = {
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

var lionES6 = new AnimalES6("Lion");
lionES6.doSomething();


class Foo {
  constructor() {
    console.log("making a Foo");
    this.arr = [];
  }
  bar(thing) {
    this.arr.push(thing);
  }
}
class Bar extends Foo {
  constructor() {
    console.log("making a Bar");
  }
}
var baz = new Bar();
