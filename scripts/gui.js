HTomb = (function(HTomb) {
  "use strict";
  var SCREENW = HTomb.Constants.SCREENW;
  var SCREENH = HTomb.Constants.SCREENH;
  var SCROLLH = HTomb.Constants.SCROLLH;
  var STATUSH = HTomb.Constants.STATUSH;
  var GUI = HTomb.GUI;
  GUI.main = {};
  GUI.current = GUI.main;
  GUI.previous = {};
  GUI.switch = function(newgui) {
    GUI.previous = GUI.current;
    GUI.current = newgui;
    if (newgui.init()) {
      newgui.init();
    }
    GUI.render();
  }

  var display = new ROT.Display({width: SCREENW, height: SCREENH+STATUSH+SCROLLH});
  document.body.appendChild(display.getContainer());
  GUI.drawAt = function(
    x,y,ch,fg,bg) {
    fg = fg || "white"  ;
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
    //for (var pad=0; pad<(SCREENW-strng.length); pad++) {
      //strng = strng.join(" ");
    //}
    scroll.unshift(strng);
    if (scroll.length>=SCROLLH-1) {
      scroll.pop();
    }
    if (GUI.current === GUI.main) {
      drawScroll();
    }
  };
  var Commands = HTomb.Commands;
  var keydown = function(key) {
    GUI.current.keydown(key);
  };
  var mousedown = function(click) {
    GUI.current.mousedown(click);
  }
  window.addEventListener("keydown",keydown);
  window.addEventListener("mousedown",mousedown);
  GUI.main.mousedown = function(click) {
    Commands.glance(click.clientX, click.clientY);
  }
  var bindKey = function(key, func) {
    GUI.current.boundKeys[ROT[key]] = func;
  };
  GUI.main.boundKeys = [];
  GUI.main.keydown = function(key) {
    GUI.main.boundKeys[key.keyCode]();
  };
  GUI.main.init = function() {
    // bind number pad movement
    bindKey("VK_NUMPAD1",Commands.tryMoveSouthWest);
    bindKey("VK_NUMPAD2",Commands.tryMoveSouth);
    bindKey("VK_NUMPAD3",Commands.tryMoveSouthEast);
    bindKey("VK_NUMPAD4",Commands.tryMoveWest);
    bindKey("VK_NUMPAD6",Commands.tryMoveEast);
    bindKey("VK_NUMPAD7",Commands.tryMoveNorthWest);
    bindKey("VK_NUMPAD8",Commands.tryMoveNorth);
    bindKey("VK_NUMPAD9",Commands.tryMoveNorthEast);
    // bind arrow movement
    bindKey("VK_LEFT",Commands.tryMoveWest);
    bindKey("VK_RIGHT",Commands.tryMoveEast);
    bindKey("VK_UP",Commands.tryMoveNorth);
    bindKey("VK_DOWN",Commands.tryMoveSouth);
    // bind keyboard movement
    bindKey("VK_Z",Commands.tryMoveSouthWest);
    bindKey("VK_S",Commands.tryMoveSouth);
    bindKey("VK_X",Commands.tryMoveSouth);
    bindKey("VK_C",Commands.tryMoveSouthEast);
    bindKey("VK_A",Commands.tryMoveWest);
    bindKey("VK_D",Commands.tryMoveEast);
    bindKey("VK_Q",Commands.tryMoveNorthWest);
    bindKey("VK_W",Commands.tryMoveNorth);
    bindKey("VK_E",Commands.tryMoveNorthEast);
  };

  GUI.main.state = {
    z: 1,
    xoffset: 0,
    yoffset: 0
  };
  GUI.main.render = function() {
    drawScreen();
    drawStatus();
    drawScroll();
  };
  var drawStatus = function() {
    display.drawText(1,SCREENH+1,"HP: " + 5 + "/" + 5);
    display.drawText(15,SCREENH+1,"Depth: " + HTomb.Player._z);
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
    var state = GUI.main.state;
    var Player = HTomb.Player;
    var z = Player._z;
    if (Player._x >=state.xoffset+SCREENW-2) {
      state.xoffset = Player._x-SCREENW+2;
    } else if (Player._x <= state.xoffset) {
      state.xoffset = Player._x-1;
    }
    if (Player._y >= state.yoffset+SCREENH-2) {
      state.yoffset = Player._y-SCREENH+2;
    } else if (Player._y <= state.yoffset) {
      state.yoffset = Player._y-1;
    }
    var level = HTomb.World.levels[z];
    var grid = level.grid;
    var xoffset = state.xoffset;
    var yoffset = state.yoffset;
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

  GUI.intro = {};
  GUI.intro.init = function() {};
  GUI.intro.render = function() {
    display.drawText(1,1, "Welcome to HellaTomb!");
  };
  GUI.intro.keydown = function() {
    GUI.switch(GUI.main);
  };
  GUI.intro.mousedown = function() {
    GUI.switch(GUI.main);
  };
  GUI.current = GUI.intro;

  GUI.render = function() {
    GUI.current.render();
  };
  return HTomb;
})(HTomb);
