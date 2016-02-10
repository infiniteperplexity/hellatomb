//require rot.js?
var HTomb = (function() {
"use strict";

  // Set a number of useful constants
  var Constants = {};
  // Dimensions of the playing area
  var LEVELW = Constants.LEVELW = 100;
  var LEVELH = Constants.LEVELH = 100;
  var NLEVELS = Constants.NLEVELS = 50;
  // Dimensions of the display panels
  var SCREENW = Constants.SCREENW = 60;
  var SCREENH = Constants.SCREENH = 25;
  var MENUW = Constants.MENUW = 30;
  var STATUSH = Constants.STATUSH = 2;
  var SCROLLH = Constants.SCROLLH = 6;
  var FONTSIZE = Constants.FONTSIZE = 15;
  var CHARWIDTH = Constants.CHARWIDTH = 9;
  var CHARHEIGHT = Constants.CHARHEIGHT = 15;
  // Frequently-used colors and characters...not sure this should be here
  var UNIBLOCK = Constants.UNIBLOCK = '\u2588';
  var EARTHTONE = Constants.EARTHTONE = "#AAAAEE";
  var SHADOW = Constants.SHADOW = "#5555BB";
  var ABOVE = Constants.ABOVE = "#BBBBFF";
  var BELOW = Constants.BELOW = "#8888DD";

  // Begin the game
  var init = function() {
    // Initialize the world...could be generate()?
    World.init();
    // Place the player on the ground at 1,1
    var Player = HTomb.Player = Entity.create("Necromancer");
    var ground = Tiles.groundLevel(1,1);
    Player.place(1,1,ground+1);
    // Begin visibility
    if (Player.sight) {
      FOV.findVisible(Player._x, Player._y, Player._z, Player.sight.range);
    }
    // Throw up a welcome splash screen
    GUI.splash("Welcome to HellaTomb!");
    Events.subscribe(World.dailyCycle,"TurnBegin");
  };
  // Process a turn of play
  var turn = function() {
    Events.publish({type: "TurnBegin"});
    var Player = HTomb.Player;
    // Assign tasks to minions
    Tasks.assignTasks();

    // Run the AI for each creature...should I deal with action points here?
    for (var creature in World.creatures) {
      if (World.creatures[creature].ai) {
          World.creatures[creature].ai.act();
      }
    }
    // Calculate visibility
    FOV.resetVisible();
    if (Player.sight) {
      FOV.findVisible(Player._x, Player._y, Player._z, Player.sight.range);
    }
    // Recenter the GUI on the player
    GUI.recenter();
    // Render the GUI
    GUI.render();
    Events.publish({type: "TurnEnd"});
  };
  // Set up the various submodules that will be used
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
  var Debug = {};
  var Save = {};
  // Allow public access to the submodules
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
    Tiles: Tiles,
    Debug: Debug,
    Save: Save
  };
})();
// Start the game when the window loads
window.onload = HTomb.init;
