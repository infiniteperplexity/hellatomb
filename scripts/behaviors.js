HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;

  HTomb.Behavior.define({
    template: "AI",
    name: "ai",
    target: null,
    mood: null,
    init: function(){this.entity.path = [];},
    go: function() {console.log(this.entity.name + " is thinking...");}
  });

  HTomb.Behavior.define({
    template: "Movement",
    name: "movement",
    walks: true,
    canPass: function(x,y,z) {
      if (x<0 || x>=LEVELW || y<0 || y>=LEVELH) {
        return false;
      }
      var square = HTomb.World.getSquare(x,y,z);
      if (square.terrain.solid===true && this.phases===undefined) {
        return false;
      } else if (square.terrain.fallable===true && this.flies===undefined) {
        if (square.feature!==undefined && square.feature.template==="DownSlope") {
          return true;
        } else {
          return false;
        }
      } else if (this.walks===true) {
        return true;
      } else {
        return false;
      }
    }
  });

  HTomb.Behavior.define({
    template: "Stackable",
    name: "stack",
    maxn: 10,
    n: 1
  });

  return HTomb;
})(HTomb);
