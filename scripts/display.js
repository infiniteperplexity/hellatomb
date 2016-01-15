HTomb = (function(HTomb) {
  "use strict";
  var SCREENW = HTomb.Constants.SCREENW;
  var SCREENH = HTomb.Constants.SCREENH;
  var SCROLLH = HTomb.Constants.SCROLLH;
  var STATUSH = HTomb.Constants.STATUSH;
  var display = new ROT.Display({width: SCREENW, height: SCREENH+STATUSH+SCROLLH});
  document.body.appendChild(display.getContainer());

  var screen = {
    z: 1,
    xoffset: 0,
    yoffset: 0
  };

  var drawAt = function(x,y,ch,fg,bg) {
    fg = fg || "white";
    bg = bg || "black";
    display.draw(
      x-screen.xoffset,
      y-screen.yoffset,
      ch,
      fg,
      bg
    );
  };

  var scroll = [];
  HTomb.Display.pushMessage = function(strng) {
    scroll.unshift(strng);
    if (scroll.length>=SCROLLH-1) {
      scroll.pop();
    }
    drawScroll();
  };
  var render = function() {
    drawScreen();
    drawStatus();
    drawScroll();
  };
  var drawStatus = function() {
    display.drawText(1,SCREENH+1,"HP: " + 5 + "/" + 5);
    display.drawText(15,SCREENH+1,"Depth: " + HTomb.World.Player._z);
  };
  var drawScroll = function() {
    //display.draw(1,SCREENH+STATUSH+STATUSH,"\u2554","white","black");
    //display.draw(SCREENW-2,SCREENH+STATUSH,"\u2557","white","black");
    //display.draw(1,SCREENH+STATUSH+STATUSH+SCROLLH-1,"\u255A","white","black");
    //display.draw(SCREENW-2+STATUSH,SCREENH+STATUSH+SCROLLH-1,"\u255D","white","black");
    //for (var x=2; x<SCREENW-2;x++) {
      //display.draw(x,SCREENH+STATUSH,"\u2550","white","black"+STATUSH);
      //display.draw(x,SCREENH+STATUSH+SCROLLH-1,"\u2550","white","black");
    //}
    //for (var y=SCREENH+STATUSH+1; y<SCREENH+STATUSH+SCROLLH-1; y++) {
      //display.draw(1,y,"\u2551","white","black");
      //display.draw(SCREENW-2,y,"\u2551","white","black");
    //}
    for (var s=0; s<scroll.length; s++) {
      display.drawText(1,SCREENH+STATUSH+s+1,scroll[s]);
    }
  };
  var drawScreen = function() {
    var Player = HTomb.World.Player;
    var z = Player._z;
    if (Player._x >=screen.xoffset+SCREENW-2) {
      screen.xoffset = Player._x-SCREENW+2;
    } else if (Player._x <= screen.xoffset) {
      screen.xoffset = Player._x-1;
    }
    if (Player._y >= screen.yoffset+SCREENH-2) {
      screen.yoffset = Player._y-SCREENH+2;
    } else if (Player._y <= screen.yoffset) {
      screen.yoffset = Player._y-1;
    }
    var level = HTomb.World.levels[z];
    var grid = level.grid;
    var xoffset = screen.xoffset;
    var yoffset = screen.yoffset;
    var tiles = HTomb.World.tiles;
    var vis = HTomb.FOV.visible;
    var explored = level.explored;
    for (var x = xoffset; x < xoffset+SCREENW; x++) {
      for (var y = yoffset; y < yoffset+SCREENH; y++) {
        display.draw(
          x-xoffset,
          y-yoffset,
          tiles[grid[x][y]].symbol,
          (explored[x][y]===false) ? "black" : (vis[x][y]===true) ? "white" : "gray",
          "black"
        );
      }
    }
    var creatures = HTomb.World.creatures;
    for (var key in creatures) {
      if (creatures[key]._z === z) {
        var creature = creatures[key];
        display.draw(
          creature._x-xoffset,
          creature._y-yoffset,
          creature.symbol,
          creature.fg || "white",
          creature.bg || "black"
        );
      }
    }
  };
  HTomb.Display.display = display;
  HTomb.Display.render = render;
  HTomb.Display.drawAt = drawAt;
  return HTomb;
})(HTomb);
