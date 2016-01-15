//require rot.js?
var HTomb = (function() {
"use strict";

  var Constants = {};
  var LEVELW = Constants.LEVELW = 100;
  var LEVELH = Constants.LEVELH = 100;
  var NLEVELS = Constants.NLEVELS = 50;
  var SCREENW = Constants.SCREENW = 80;
  var SCREENH = Constants.SCREENH = 25;
  var STATUSH = Constants.STATUSH = 2;
  var SCROLLH = Constants.SCROLLH = 6;
  var init = function() {
    World.init();
    World.Player = HTomb.Entity.create("Necromancer");
    var ground = World.groundLevel(1,1);
    World.Player.place(1,1,ground+1);
    FOV.findVisible(World.Player._x, World.Player._y, World.Player._z, 10);
    Display.render();
  };
  var turn = function() {
    Display.render();
    FOV.resetVisible();
    FOV.findVisible(World.Player._x, World.Player._y, World.Player._z, 10);
    World.Player.ai.go();
  };
  var World = {};
  var Display = {};
  var Controls = {};
  var Entity = {};
  var FOV = {};
  var Path = {};
  var Events = {};


  return {
    Constants: Constants,
    init: init,
    turn: turn,
    Display: Display,
    World: World,
    Controls: Controls,
    Entity: Entity,
    FOV: FOV,
    Path: Path,
    Events: Events
  };
})();
window.onload = HTomb.init;
