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
    var Player = HTomb.Player = Entity.create("Necromancer");
    //Entity.addBehavior(PlayerBehavior,Player);
    var ground = World.groundLevel(1,1);
    Player.place(1,1,ground+1);
    FOV.findVisible(Player._x, Player._y, Player._z, 10);
    GUI.init();
  };
  var turn = function() {
    var Player = HTomb.Player;
    GUI.render();
    FOV.resetVisible();
    FOV.findVisible(Player._x, Player._y, Player._z, 10);
    for (var creature in World.creatures) {}
      if (World.creatures[creature].ai) {
        World.creatures[creature].ai.go();
      }
  };
  var World = {};
  var Player = {};
  var Entity = {};
  var FOV = {};
  var Path = {};
  var Events = {};
  var Commands = {};
  var GUI = {};

  return {
    Constants: Constants,
    init: init,
    turn: turn,
    World: World,
    Entity: Entity,
    FOV: FOV,
    Path: Path,
    Events: Events,
    Commands: Commands,
    GUI: GUI,
    Player: Player
  };
})();
window.onload = HTomb.init;
