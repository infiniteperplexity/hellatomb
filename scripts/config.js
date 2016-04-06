// This module provides optional debugging functionality
HTomb = (function(HTomb) {
  "use strict";
  var Debug = HTomb.Debug;

  //Debug.explored = true;
  //Debug.visible = true;
  //Debug.mobility = true;
  //Debug.showpaths = true; //not yet implemented
  //Debug.messages = true;
  //Debug.faster = true;
  //Debug.paused = true;
  //Debug.peaceful = true;

  HTomb.World.init = function() {
    HTomb.World.fillTiles();
    HTomb.World.generators.bestSoFar();
  };
  return HTomb;
})(HTomb);
