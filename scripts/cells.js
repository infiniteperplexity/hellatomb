

okay...so there are four cell types...immutable/mutable yes/no.

also, "born" and "survive"...but those should be callbacks.

var fix0;
var fix1;
var var0;
var var1;

function vonNeumann(x,y) {

}
function extendedVonNeumann(x,y) {

}
function moore(x,y) {

}
function mooreVonNeumann(x,y) {

}
function extendedMoore(x,y) {

}

...or maybe just slap a "cellular" method on plant behavior?



function CellularAutomaton(options) {
  options = options || {};
  this.width = options.width || HTomb.Constants.LEVELW;
  this.height = options.height || HTomb.Constants.LEVELH;
  this.neighbors = options.neighbors;
  // don't make it 3d?
}
