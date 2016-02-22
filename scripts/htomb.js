
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
  //HTomb.Constants.FLOORBELOW = "\u25E6";
  Constants.FLOORBELOW = "\u2024";
  Constants.ROOFABOVE = "'";
  var EARTHTONE = Constants.EARTHTONE = "#AAAAEE";
  var SHADOW = Constants.SHADOW = "#444455";
  var ABOVE = Constants.ABOVE = "#BBBBFF";
  var BELOW = Constants.BELOW = "#8888DD";
  Constants.WALLBG = "#333355";
  Constants.FLOORBG = "#111133";
  Constants.BELOWBG = "#000022";
  Constants.TWOBELOW = "#444499";


  // Used throughout the project
  function coord(x,y,z) {
    return z*LEVELH*LEVELW + x*LEVELH + y;
  }
  //useful for parsing
  function decoord(c) {
    var x=0, y=0, z=0;
    while(c-LEVELH*LEVELW>=0) {
      c-=LEVELH*LEVELW;
      z+=1;
    }
    while(c-LEVELH>=0) {
      c-=LEVELH;
      x+=1;
    }
    y = c;
    return [x,y,z];
  }
  // the shuffle function in ROT.js empties the original array
  function shuffle(arr) {
    var a = arr.shuffle();
    for(var i=0; i<a.length;i++) {
      arr.push(a[i]);
    }
  }
  function coordInArray(c, a) {
    var match;
    var mis;
    for (var i=0; i<a.length; i++) {
      match = true;
      for (var j=0; j<c.length; j++) {
        if (c[j]!==a[i][j]) {
          match = false;
        }
      }
      if (match===true) {
        return i;
      }
    }
    return -1;
  }

  // Begin the game
  var init = function() {
    // Initialize the world...could be generate()?
    World.init();
    var p = Things.Necromancer();
    HTomb.Things.Player().addToEntity(p);
    p.place(1,1,Tiles.groundLevel(1,1));
    // Begin visibility
    if (p.sight) {
      FOV.findVisible(p.x, p.y, p.z, p.sight.range);
    }
    // Throw up a welcome splash screen
    //GUI.splash("Welcome to HellaTomb!");
    //Events.subscribe(World.dailyCycle,"TurnBegin");
  };
  // Process a turn of play
  var turn = function() {
  //  Events.publish({type: "TurnBegin"});
    var Player = HTomb.Player;
    // Assign tasks to minions
    if (Player.master) {
      Player.master.assignTasks();
    }
    // Run the AI for each creature...should I deal with action points here?
    for (var creature in World.creatures) {
      if (World.creatures[creature].ai) {
          World.creatures[creature].ai.act();
      }
    }
    // Calculate visibility
    FOV.resetVisible();
    if (Player.sight) {
      FOV.findVisible(Player.x, Player.y, Player.z, Player.sight.range);
    }
    // Recenter the GUI on the player
    GUI.recenter();
    // Render the GUI
    GUI.render();
//    Events.publish({type: "TurnEnd"});
  };

  // Set up the various submodules that will be used
  var World = {};
  var Player = {};
  var FOV = {};
  var Path = {};
  var Events = {};
  var GUI = {};
  var Controls = {};
  var Commands = {};
  var Tasks = {};
  var Tiles = {};
  var Debug = {};
  var Save = {};
  var Things = {};
  // Allow public access to the submodules
  return {
    Constants: Constants,
    init: init,
    coord: coord,
    decoord: decoord,
    shuffle: shuffle,
    coordInArray: coordInArray,
    Controls: Controls,
    Commands: Commands,
    turn: turn,
    World: World,
    FOV: FOV,
    Path: Path,
    Events: Events,
    GUI: GUI,
    get Player () {return Player;},
    set Player (p) {Player = p; GUI.splash("Welcome to HellaTomb!");},
    Tiles: Tiles,
    Debug: Debug,
    Save: Save,
    Things: Things
  };
})();
// Start the game when the window loads
window.onload = HTomb.init;
