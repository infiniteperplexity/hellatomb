HTomb = (function(HTomb) {
  "use strict";

  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;

  HTomb.Utils.coord = function(x,y,z) {
    return (x*LEVELW*LEVELH+y*LEVELH+z);
  };

return HTomb;
})(HTomb);
