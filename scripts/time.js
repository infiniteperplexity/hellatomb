HTomb = (function(HTomb) {
  "use strict";

  var Time = HTomb.Time;

  var timePassing = null;
  var speed = 1000;
  HTomb.Time.setSpeed = function(spd) {
    speed = Math.min(Math.max(100,spd),5000);
  };
  HTomb.Time.getSpeed = function() {
    return speed;
  };
  HTomb.Time.startTime = function() {
    timePassing = setInterval(HTomb.Time.passTime,speed);
    HTomb.GUI.renderStatus();
  };
  HTomb.Time.stopTime = function() {
    clearInterval(timePassing);
    timePassing = null;
    HTomb.GUI.renderStatus();
  };
  HTomb.Time.toggleTime = function() {
    if (timePassing===null) {
      HTomb.Time.startTime();
    } else {
      HTomb.Time.stopTime();
    }
  };
  HTomb.Time.passTime = function() {
    HTomb.Time.turn();
  };
  var particleTime;
  var particleSpeed = 50;
  HTomb.Time.startParticles = function() {
    if (particleTime===undefined) {
      particleTime = setInterval(function() {
        //console.log("updating particles");
        HTomb.Particles.update(particleSpeed);
        HTomb.GUI.renderParticles();
      },particleSpeed);
    }
  };
  HTomb.Time.isPaused = function() {
    return (timePassing===null);
  };
  HTomb.Time.stopParticles = function() {
    clearInterval(particleTime);
    particleTime = undefined;
  };

  // Process a turn of play
  HTomb.Time.turn = function() {
    HTomb.Time.startParticles();
    HTomb.Events.publish({type: "TurnBegin"});
    HTomb.Time.stopTime();
    var Player = HTomb.Player;
    // Assign tasks to minions
    if (Player.master) {
      HTomb.Utils.shuffle(Player.master.taskList);
      Player.master.assignTasks();
    }
    // Run the AI for each creature...should I deal with action points here?
    var creatureDeck = [];
    for (var creature in HTomb.World.creatures) {
      creatureDeck.push(HTomb.World.creatures[creature]);
    }
    HTomb.Utils.shuffle(creatureDeck);
    for (var c=0; c<creatureDeck.length; c++) {
      if (creatureDeck[c].ai) {
        creatureDeck[c].ai.act();
      }
    }
    // Calculate visibility
    HTomb.FOV.resetVisible();
    if (Player.sight) {
      HTomb.FOV.findVisible(Player.x, Player.y, Player.z, Player.sight.range);
    }
    if (Player.master) {
      for (var i=0; i<Player.master.minions.length; i++) {
        var cr = Player.master.minions[i];
        if (cr.sight) {
          HTomb.FOV.findVisible(cr.x,cr.y,cr.z, cr.sight.range);
        }
      }
    }
    // Recenter the GUI on the player
    HTomb.GUI.recenter();
    // Render the GUI
    HTomb.GUI.render();
    if (HTomb.Debug.paused!==true) {
      HTomb.Time.startTime();
    }
    if (HTomb.World.dailyCycle.turn===1) {
        HTomb.Encounters.roll();
    }
    HTomb.World.dailyCycle.onTurnBegin();
    HTomb.Events.publish({type: "TurnEnd"});
  };

  return HTomb;
})(HTomb);
