//require rot.js?
var HTomb = (function() {
"use strict";

  var Constants = {};
  var LEVELW = Constants.LEVELW = 100;
  var LEVELH = Constants.LEVELH = 100;
  var NLEVELS = Constants.NLEVELS = 50;
  var SCREENW = Constants.SCREENW = 80;
  var SCREENH = Constants.SCREENH = 25;
  var init = function() {
    World.init();
    World.Player = HTomb.Entity.create(HTomb.Entity.Necromancer());
    var ground = World.groundLevel(1,1);
    World.Player.x = 1;
    World.Player.y = 1;
    World.Player.z = ground+1;
    World.levels[ground+1].critters[World.Player.x*LEVELW + World.Player.y] = World.Player;
    //World.Player.actor = PlayerActor;
    World.actors[0] = World.Player;
    Display.render();
  };
  var turn = function() {
    Display.render();
  };
  var World = {};
  var Display = {};
  var Controls = {};
  var Entity = {};


  return {
    Constants: Constants,
    init: init,
    turn: turn,
    Display: Display,
    World: World,
    Controls: Controls,
    Entity: Entity
  };
})();
window.onload = HTomb.init;
