//require rot.js?
var HTomb = (function() {
"use strict";

  var Constants = {};
  var LEVELW = Constants.LEVELW = 100;
  var LEVELH = Constants.LEVELH = 100;
  var NLEVELS = Constants.NLEVELS = 50;
  var SCREENW = Constants.SCREENW = 80;
  var SCREENH = Constants.SCREENH = 25;
  var go = function() {};
  var World = {};
  var Player = {};
  var Display = {};
  var Controls = {};
  var Entity = {};


  return {
    Constants: Constants,
    Player: Player,
    go: go,
    Display: Display,
    World: World,
    Controls: Controls,
    Entity: Entity
  };
})();
