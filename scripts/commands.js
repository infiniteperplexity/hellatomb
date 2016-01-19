HTomb = (function(HTomb) {
  "use strict";
  var Commands = HTomb.Commands;
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  Commands.tryMoveWest = function() {Commands.tryMove('W');};
  Commands.tryMoveNorth = function() {Commands.tryMove('N');};
  Commands.tryMoveEast = function() {Commands.tryMove('E');};
  Commands.tryMoveSouth = function() {Commands.tryMove('S');};
  Commands.tryMoveNorthWest = function() {Commands.tryMove('NW');};
  Commands.tryMoveNorthEast = function() {Commands.tryMove('NE');};
  Commands.tryMoveSouthWest = function() {Commands.tryMove('SW');};
  Commands.tryMoveSouthEast = function() {Commands.tryMove('SE');};
  Commands.tryMove = function(dir) {
    var x = HTomb.Player._x;
    var y = HTomb.Player._y;
    var z = HTomb.Player._z;
    var newx = x;
    var newy = y;
    if (dir==='N') {
      newy-=1;
    } else if (dir==='NW') {
      newx-=1;
      newy-=1;
    } else if (dir==='NE') {
      newx+=1;
      newy-=1;
    } else if (dir==='S') {
      newy+=1;
    } else if (dir==='SW') {
      newx-=1;
      newy+=1;
    } else if (dir==='SE') {
      newx+=1;
      newy+=1;
    } else if (dir==='W') {
      newx-=1;
    } else if (dir==='E') {
      newx+=1;
    }
    if (HTomb.Player.movement===undefined || HTomb.Player.movement.canPass(newx,newy,z)===false) {
      var square0 = HTomb.World.getSquare(x,y,z);
      var square1 = HTomb.World.getSquare(newx,newy,z);
      if (square0.feature!==undefined && square0.feature.template==="UpSlope" && square1.terrain.solid===true) {
        Commands.tryMoveUp();
      } else if (square0.feature!==undefined && square0.feature.template==="DownSlope" && square1.terrain.fallable===true) {
        Commands.tryMoveDown();
      }
      HTomb.GUI.pushMessage("Can't go that way.");
    } else {
      HTomb.Player.place(newx,newy,z);
      HTomb.turn();
    }
  };
  Commands.tryMoveUp = function() {
    var x = HTomb.Player._x;
    var y = HTomb.Player._y;
    var z = HTomb.Player._z;
    var square = HTomb.World.getSquare(x,y,z);
    if (square.feature!==undefined && square.feature.template==="UpSlope") {
      HTomb.Player.place(x,y,z+1);
      HTomb.turn();
    } else {
      HTomb.GUI.pushMessage("Can't go up here.");
    }
  };
  Commands.tryMoveDown = function() {
    var x = HTomb.Player._x;
    var y = HTomb.Player._y;
    var z = HTomb.Player._z;
    var square = HTomb.World.getSquare(x,y,z);
    if (square.feature!==undefined && square.feature.template==="DownSlope") {
      HTomb.Player.place(x,y,z-1);
      HTomb.turn();
    } else {
      HTomb.GUI.pushMessage("Can't go down here.");
    }
  };
  Commands.glance = function(x,y) {
    HTomb.GUI.pushMessage("Clicked at " + x +", " + y +".");
  };
  return HTomb;
})(HTomb);
