var HTomb = (function() {
"use strict";
  // Set a number of useful constants
  var Constants = {};
  // Dimensions of the playing area
  var LEVELW = Constants.LEVELW = 256;
  var LEVELH = Constants.LEVELH = 256;
  var NLEVELS = Constants.NLEVELS = 64;
  // Frequently-used colors and characters...not sure this should be here
  var UNIBLOCK = Constants.UNIBLOCK = '\u2588';

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
    var a = arr.randomize();
    for(var i=0; i<a.length;i++) {
      arr.push(a[i]);
    }
    return arr;
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
  function poisson(mean) {
    var L = Math.exp(-mean);
    var p = 1.0;
    var k = 0;
    do {
        k++;
        p *= Math.random();
    } while (p > L);
    return k-1;
  }

  // Begin the game
  var init = function() {
    // Initialize the world...could be generate()?
    GUI.domInit();
    GUI.splash(["Welcome to HellaTomb!"]);
    HTomb.GUI.render();
    console.time("worldInit");
    World.init();
    console.timeEnd("worldInit");
    HTomb.GUI.recenter();
    //Events.subscribe(World.dailyCycle,"TurnBegin");
  };

  var timePassing;
  var speed = 1000;
  function setSpeed(spd) {
    speed = Math.min(Math.max(100,spd),5000);
  }
  function getSpeed() {
    return speed;
  }
  function startTime() {
    timePassing = setInterval(passTime,speed);
  }
  function stopTime() {
    clearInterval(timePassing);
  }
  function passTime() {
    HTomb.turn();
  }

  // Process a turn of play
  var turn = function() {
    Events.publish({type: "TurnBegin"});
    stopTime();
    var Player = HTomb.Player;
    // Assign tasks to minions
    if (Player.master) {
      HTomb.shuffle(Player.master.taskList);
      Player.master.assignTasks();
    }
    // Run the AI for each creature...should I deal with action points here?
    var creatureDeck = [];
    for (var creature in World.creatures) {
      creatureDeck.push(World.creatures[creature]);
    }
    HTomb.shuffle(creatureDeck);
    for (var c=0; c<creatureDeck.length; c++) {
      if (creatureDeck[c].ai) {
        creatureDeck[c].ai.act();
      }
    }
    // Calculate visibility
    FOV.resetVisible();
    if (Player.sight) {
      FOV.findVisible(Player.x, Player.y, Player.z, Player.sight.range);
    }
    if (Player.master) {
      for (var i=0; i<Player.master.minions.length; i++) {
        var cr = Player.master.minions[i];
        if (cr.sight) {
          FOV.findVisible(cr.x,cr.y,cr.z, cr.sight.range);
        }
      }
    }
    // Recenter the GUI on the player
    GUI.recenter();
    // Render the GUI
    GUI.render();
    startTime();
    World.dailyCycle.onTurnBegin();
    Events.publish({type: "TurnEnd"});
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
    poisson: poisson,
    Controls: Controls,
    Commands: Commands,
    turn: turn,
    World: World,
    FOV: FOV,
    Path: Path,
    Events: Events,
    GUI: GUI,
    get Player () {return Player;},
    set Player (p) {Player = p;},
    Tiles: Tiles,
    Debug: Debug,
    Save: Save,
    Things: Things,
    stopTime: stopTime,
    startTime: startTime,
    getSpeed: getSpeed,
    setSpeed: setSpeed
  };
})();
// Start the game when the window loads
window.onload = HTomb.init;
