//require rot.js?
var HTomb = (function() {
"use strict";

  var Constants = {};
  var LEVELW = Constants.LEVELW = 100;
  var LEVELH = Constants.LEVELH = 100;
  var NLEVELS = Constants.NLEVELS = 50;
  var SCREENW = Constants.SCREENW = 60;
  var SCREENH = Constants.SCREENH = 25;
  var MENUW = Constants.MENUW = 30;
  var STATUSH = Constants.STATUSH = 2;
  var SCROLLH = Constants.SCROLLH = 6;
  var FONTSIZE = Constants.FONTSIZE = 15;
  var CHARWIDTH = Constants.CHARWIDTH = 9;
  var CHARHEIGHT = Constants.CHARHEIGHT = 15;
  var UNIBLOCK = Constants.UNIBLOCK = '\u2588';
  var EARTHTONE = Constants.EARTHTONE = "#AAAAFF";
  var SHADOW = Constants.SHADOW = "#5555BB";
  var ABOVE = Constants.ABOVE = "#DDDDFF";
  var BELOW = Constants.BELOW = "#8888DD";

  //var EARTHTONE = Constants.EARTHTONE = "white";
  //var SHADOW = Constants.SHADOWS = "gray";

  var init = function() {
    World.init();
    var Player = HTomb.Player = Entity.create("Necromancer");
    //Entity.addBehavior(PlayerBehavior,Player);
    var ground = Tiles.groundLevel(1,1);
    Player.place(1,1,ground+1);
    if (Player.sight) {
      FOV.findVisible(Player._x, Player._y, Player._z, Player.sight.range);
    }
    GUI.splash("Welcome to HellaTomb!");
  };
  var turn = function() {
    var Player = HTomb.Player;
    Tasks.assignTasks();
    for (var creature in World.creatures) {
      if (World.creatures[creature].ai) {
          World.creatures[creature].ai.act();
      }
    }
    FOV.resetVisible();
    if (Player.sight) {
      FOV.findVisible(Player._x, Player._y, Player._z, Player.sight.range);
    }
    GUI.recenter();
    GUI.render();
  };
  var World = {};
  var Player = {};
  var Entity = {};
  var FOV = {};
  var Path = {};
  var Events = {};
  var Commands = {};
  var GUI = {};
  var Behavior = {};
  var Controls = {};
  var Tasks = {};
  var Tiles = {};

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
    Player: Player,
    Behavior: Behavior,
    Controls: Controls,
    Tasks: Tasks,
    Tiles: Tiles
  };
})();
window.onload = HTomb.init;
