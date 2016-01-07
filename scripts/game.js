var Game = {};
Game.Constants = {
  screenw: 80,
  screenh: 25,
  nlevels: 50,
  levelw: 100,
  levelh: 100
};
Game.Player = {};
Game.World = {};
Game.turn = function() {
  var actors = Game.World.actors;
  //skip the player
  for(var i=1; i<actors.length; i++) {
    actors[i].act();
  }
  Game.render();
};
Game.init = function() {
  Game.Player.entity = Entity(Necromancer());
  Game.Player.entity.x = 1;
  Game.Player.entity.y = 1;
  Game.Player.entity.z = 1;
  Game.Player.entity.actor = PlayerActor;
  Game.World.actors[0] = Game.Player.entity;
  Game.render();
};
window.onload = Game.init;
