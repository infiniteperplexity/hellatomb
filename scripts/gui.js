HTomb = (function(HTomb) {
  "use strict";
  // break out constants
  var SCREENW = HTomb.Constants.SCREENW;
  var SCREENH = HTomb.Constants.SCREENH;
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var SCROLLH = HTomb.Constants.SCROLLH;
  var MENUW = HTomb.Constants.MENUW;
  var STATUSH = HTomb.Constants.STATUSH;
  var FONTSIZE = HTomb.Constants.FONTSIZE;
  var UNIBLOCK = HTomb.Constants.UNIBLOCK;

  // *************properties of the base GUI object*************
  var GUI = HTomb.GUI;
  var display = new ROT.Display({width: SCREENW+MENUW, height: SCREENH+STATUSH+SCROLLH, fontsize: FONTSIZE});
  document.body.appendChild(display.getContainer());
  GUI.init = function() {
    GUI.current = intro;
    intro.init();
    intro.render();
  };
  GUI.switch = function(newgui) {
    GUI.previous = GUI.current;
    GUI.current = newgui;
    if (newgui.init()) {
      newgui.init();
    }
    GUI.render();
  };
  // events and commmands
  var Commands = HTomb.Commands;
  var keydown = function(key) {
    GUI.current.keydown(key);
  };
  var mousedown = function(click) {
    var xskew = +1;
    var yskew = +4;
    var x = Math.floor((click.clientX+xskew)/HTomb.Constants.CHARWIDTH-1);
    var y = Math.floor((click.clientY+yskew)/HTomb.Constants.CHARHEIGHT-1);
    GUI.current.mousedown(x,y);
  };
  var bindKey = function(key, func) {
    GUI.current.boundKeys[ROT[key]] = func;
  };
  window.addEventListener("keydown",keydown);
  //window.addEventListener("mousedown",mousedown);
  display.getContainer().addEventListener("mousedown",mousedown);
  // message buffer
  var scroll = [];
  GUI.pushMessage = function(strng) {
    //for (var pad=0; pad<(SCREENW-strng.length); pad++) {
      //strng = strng.join(" ");
    //
    scroll.push(strng);
    if (scroll.length>=SCROLLH-1) {
      scroll.shift();
    }
    if (GUI.current === main) {
      drawScroll();
    }
  };
  // rendering
  GUI.render = function() {
    GUI.current.render();
  };
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



  // ************intro GUI************************

  var intro = {};
  intro.init = function() {};
  intro.render = function() {
    display.drawText(1,1, "Welcome to HellaTomb!");
  };
  intro.keydown = function() {
    GUI.switch(main);
  };
  intro.mousedown = function(x,y) {
    GUI.switch(main);
  };

  // ************main GUI************************
  var z = 1;
  var xoffset = 0;
  var yoffset = 0;
  var main = {};
  main.mousedown = function(x,y) {
    var square = HTomb.World.getSquare(x+xoffset,y+yoffset,z);
    Commands.look(square);
  };
  main.boundKeys = [];
  main.keydown = function(key) {
    if (  main.boundKeys[key.keyCode]===undefined) {
      console.log("No binding for " + key.keyCode);
    } else {
      main.boundKeys[key.keyCode]();
    }
  };
  main.init = function() {
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
    bindKey("VK_PERIOD",Commands.tryMoveDown);
    bindKey("VK_COMMA",Commands.tryMoveUp);
    bindKey("VK_G",Commands.pickup);
    bindKey("VK_F",Commands.drop);
  };
  main.render = function() {
    drawScreen();
    drawStatus();
    //drawScrollBorder();
    drawScroll();
    //drawMenu();
  };
  var drawStatus = function() {
    display.drawText(1,SCREENH+1,"HP: " + 5 + "/" + 5);
    display.drawText(15,SCREENH+1,"Depth: " + HTomb.Player._z);
  };
  var drawScrollBorder = function() {
    display.draw(1,SCREENH+STATUSH+STATUSH,"\u2554","white","black");
    display.draw(SCREENW-2,SCREENH+STATUSH,"\u2557","white","black");
    display.draw(1,SCREENH+STATUSH+STATUSH+SCROLLH-1,"\u255A","white","black");
    display.draw(SCREENW-2+STATUSH,SCREENH+STATUSH+SCROLLH-1,"\u255D","white","black");
    for (var x=2; x<SCREENW-2;x++) {
      display.draw(x,SCREENH+STATUSH,"\u2550","white","black"+STATUSH);
      display.draw(x,SCREENH+STATUSH+SCROLLH-1,"\u2550","white","black");
    }
    for (var y=SCREENH+STATUSH+1; y<SCREENH+STATUSH+SCROLLH-1; y++) {
      display.draw(1,y,"\u2551","white","black");
      display.draw(SCREENW-2,y,"\u2551","white","black");
    }
  };
  var drawScroll = function() {
    for (var s=0; s<scroll.length; s++) {
      //black out the entire line with solid blocks
      display.drawText(1,SCREENH+STATUSH+s+1,"%c{black}"+(UNIBLOCK.repeat(SCREENW-2)));
      display.drawText(1,SCREENH+STATUSH+s+1,scroll[s]);
    }
  };
  var menu = [];
  var drawMenu = function() {
    menu = [];
    var inv = HTomb.Player.inventory;
    if (inv) {
      for (var item=0; item<inv.items.length; item++) {
        menu.push(inv.items[item].name);
      }
    }
    for (var i=0; i<(SCREENH+SCROLLH); i++) {
      display.drawText(SCREENW+1, i+1,"%c{black}"+(UNIBLOCK.repeat(MENUW-2)));
      display.drawText(SCREENW+1, i+1,menu[i]);
    }
  };
  var drawScreen = function() {
    var Player = HTomb.Player;
    z = Player._z;
    if (Player._x >=xoffset+SCREENW-2) {
      xoffset = Player._x-SCREENW+2;
    } else if (Player._x <= xoffset) {
      xoffset = Player._x-1;
    }
    if (Player._y >= yoffset+SCREENH-2) {
      yoffset = Player._y-SCREENH+2;
    } else if (Player._y <= yoffset) {
      yoffset = Player._y-1;
    }
    var level = HTomb.World.levels[z];
    var grid = level.grid;
    var terrain = HTomb.World.terrain;
    var vis = HTomb.FOV.visible;
    var explored = level.explored;
    var creatures = HTomb.World.creatures;
    var items = HTomb.World.items;
    var features = HTomb.World.features;
    var sym;
    var fg;
    var bg;
    var coord;
    var below;
    var thing;
    // I am not sure if this is the best way
    for (var x = xoffset; x < xoffset+SCREENW; x++) {
      for (var y = yoffset; y < yoffset+SCREENH; y++) {
        coord = x*LEVELW*LEVELH + y*LEVELH + z;
        fg = "white";
        bg = "black";
        // testing
        explored[x][y] = true;
        // end testing
        if (!explored[x][y]) {
          sym = " ";
        } else if (vis[x][y]===false) {
          fg = "gray";
          bg = "black";
          if (items[coord]) {
            thing = items[coord][items[coord].length-1];
            sym = thing.symbol || "X";
          } else if (features[coord]) {
            thing = features[coord];
            sym = thing.symbol || "X";
          } else {
            sym = terrain[grid[x][y]].symbol || "X";
          }
        } else {
          if (creatures[coord]) {
            thing = creatures[coord];
            sym = thing.symbol || "X";
            fg = thing.fg || "white";
            bg = thing.bg || "black";
          } else if (items[coord]) {
            thing = items[coord][items[coord].length-1];
            sym = thing.symbol || "X";
            fg = thing.fg || "white";
            bg = thing.bg || "black";
          } else if (features[coord]) {
            thing = features[coord];
            sym = thing.symbol || "X";
            fg = thing.fg || "white";
            bg = thing.bg || "black";
          } else {
            thing = terrain[grid[x][y]];
            sym = thing.symbol || "X";
            fg = thing.fg || "white";
            bg = thing.bg || "black";
          }
        }
        display.draw(x-xoffset, y-yoffset, sym, fg, bg);
        //  terrain[grid[x][y]].symbol,
        //  (explored[x][y]===false) ? "black" : (vis[x][y]===true) ? "white" : "gray",
        //  "black"
        //);
      }
    }
    /*var creatures = HTomb.World.creatures;
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
    }*/
  };



  return HTomb;
})(HTomb);
