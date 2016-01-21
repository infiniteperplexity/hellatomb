HTomb = (function(HTomb) {
  "use strict";
  // create a function for pseudo-classical inheritance
  function extend(parent) {
    var obj;
    obj = Object.create(parent);
    obj.prototype.constructor = obj;
    return obj;
  }
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
  var EARTHTONE = HTomb.Constants.EARTHTONE;
  var SHADOW = HTomb.Constants.SHADOW;
  // set up GUI and display
  var GUI = HTomb.GUI;
  var Controls = HTomb.Controls;
  var Commands = HTomb.Commands;
  var display = new ROT.Display({width: SCREENW+MENUW, height: SCREENH+STATUSH+SCROLLH, fontsize: FONTSIZE});
  document.body.appendChild(display.getContainer());
  // attach input events
  var keydown = function(key) {
    Controls.context.keydown(key);
  };
  var mousedown = function(click) {
    var xskew = +1;
    var yskew = +4;
    var x = Math.floor((click.clientX+xskew)/HTomb.Constants.CHARWIDTH-1);
    var y = Math.floor((click.clientY+yskew)/HTomb.Constants.CHARHEIGHT-1);
    Controls.context.clickAt(x,y);
  };
  var bindKey = function(target, key, func) {
    target.boundKeys[ROT[key]] = func;
  };
  window.addEventListener("keydown",keydown);
  display.getContainer().addEventListener("mousedown",mousedown);

  // set up message buffer
  GUI.pushMessage = function(strng) {
    scroll.buffer.push(strng);
    if (scroll.buffer.length>=SCROLLH-1) {
      scroll.buffer.shift();
    }
    if (GUI.panels.bottom===scroll) {
      scroll.render();
    }
  };
  // rendering
  GUI.render = function() {
    if (GUI.panels.overlay !== null) {
      GUI.panels.overlay.render();
    } else {
      GUI.panels.main.render();
      GUI.panels.middle.render();
      GUI.panels.bottom.render();
      GUI.panels.right.render();
      GUI.panels.corner.render();
    }
    //for (var i=0; i<GUI.panels.length; i++) {
    //  GUI.panels[i].render();
    //}
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
  GUI.init = function() {
    GUI.panels = {overlay: intro};
    Controls.context = splash;
    GUI.render();
  };
  GUI.reset = function() {
    GUI.panels = {
      main: gameScreen,
      middle: status,
      bottom: scroll,
      right: menu,
      corner: hover,
      overlay: null
    };
    menu.text = defaultText;
    Controls.context = main;
    GUI.render();
  };

  // **************** GUI Panels ******************
  function Panel(leftx,topy) {
    this.x0 = leftx;
    this.y0 = topy;
  }
  Panel.prototype.render = function() {};
  var gameScreen = new Panel(0,0);
  // I should probably have some way of altering how this works for surveying
  gameScreen.render = function() {
    var Player = HTomb.Player;
    var z = Controls.context.z = Player._z;
    var xoffset = Controls.context.xoffset;
    var yoffset = Controls.context.yoffset;
    if (Player._x >= xoffset+SCREENW-2) {
      xoffset = Controls.context.xoffset = Player._x-SCREENW+2;
    } else if (Player._x <= xoffset) {
      xoffset = Controls.context.xoffset = Player._x-1;
    }
    if (Player._y >= yoffset+SCREENH-2) {
      yoffset = Controls.context.yoffset = Player._y-SCREENH+2;
    } else if (Player._y <= yoffset) {
      yoffset = Controls.context.yoffset = Player._y-1;
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
        // explored[x][y] = true;
        // end testing
        if (!explored[x][y]) {
          sym = " ";
        } else if (vis[x][y]===false) {
          fg = SHADOW;
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
            fg = thing.fg || EARTHTONE;
            bg = thing.bg || "black";
          } else {
            thing = terrain[grid[x][y]];
            sym = thing.symbol || "X";
            fg = thing.fg || EARTHTONE;
            bg = thing.bg || "black";
          }
        }
        display.draw(this.x0+x-xoffset,this.y0+y-yoffset, sym, fg, bg);
      }
    }
  };
  var status = new Panel(1,SCREENH);
  status.render = function() {
    display.drawText(this.x0,this.y0+1,"HP: " + 5 + "/" + 5);
    display.drawText(this.x0+15,this.y0+1,"Depth: " + HTomb.Player._z);
  };
  var scroll = new Panel(1,SCREENH+STATUSH);
  scroll.buffer = [];
  scroll.render = function() {
    for (var s=0; s<this.buffer.length; s++) {
      //black out the entire line with solid blocks
      display.drawText(this.x0,this.y0+s+1,"%c{black}"+(UNIBLOCK.repeat(SCREENW-2)));
      display.drawText(this.x0,this.y0+s+1,this.buffer[s]);
    }
  };
  var menu = new Panel(SCREENW+1,1);
  var defaultText = menu.text = [
    "To move use AWSD,",
    "arrows, or keypad.",
    "G to pick up,",
    "F to drop.",
    ", or . to go down or up.",
    "Z to cast a spell",
    "Click to examine a square."
  ];
  menu.render = function() {
    for (var i=0; i<SCREENH; i++) {
      display.drawText(this.x0, this.y0+i+1, "%c{black}"+(UNIBLOCK.repeat(MENUW-2)));
      if (menu.text[i]) {
        display.drawText(this.x0, this.y0+1+i, menu.text[i]);
      }
    }
  };
  var hover = new Panel(SCREENW+1,SCREENH+1);
  hover.render = function() {
    display.drawText(this.x0,this.y0,"Testing this space for now.");
  };
  var intro = new Panel(0,0);
  intro.render = function() {
    display.drawText(this.x0+1,this.y0+1, "Welcome to HellaTomb!");
  };

  function ControlContext(bindings) {
    bindings = bindings || {};
    this.boundKeys = [];
    for (var b in bindings) {
      bindKey(this,b,bindings[b]);
    }
  }
  ControlContext.prototype.keydown = function(key) {
    if (  this.boundKeys[key.keyCode]===undefined) {
      console.log("No binding for " + key.keyCode);
    } else {
      this.boundKeys[key.keyCode]();
    }
  };
  ControlContext.prototype.clickAt = function() {
    GUI.reset();
  };
  var main = new ControlContext({
    // bind number pad movement
    VK_LEFT: Commands.tryMoveWest,
    VK_RIGHT: Commands.tryMoveEast,
    VK_UP: Commands.tryMoveNorth,
    VK_DOWN: Commands.tryMoveSouth,
    // bind keyboard movement
    VK_Z: Commands.tryMoveSouthWest,
    VK_S: Commands.tryMoveSouth,
    VK_X: Commands.tryMoveSouth,
    VK_C: Commands.tryMoveSouthEast,
    VK_A: Commands.tryMoveWest,
    VK_D: Commands.tryMoveEast,
    VK_Q: Commands.tryMoveNorthWest,
    VK_W: Commands.tryMoveNorth,
    VK_E: Commands.tryMoveNorthEast,
    VK_PERIOD: Commands.tryMoveDown,
    VK_COMMA: Commands.tryMoveUp,
    VK_G: Commands.pickup,
    VK_F: Commands.drop,
    VK_P: Commands.showSpells
  });
  main.xoffset = 0;
  main.yoffset = 0;
  main.z = 1;

  main.clickAt = function(x,y) {
    var square = HTomb.World.getSquare(x+this.xoffset,y+this.yoffset,this.z);
    Commands.look(square);
  };
  var splash = new ControlContext();
  var spells = new ControlContext({
      VK_Z: function() {Commands.raiseZombie();GUI.reset();},
      VK_ESC: GUI.reset
  });
  Controls.contexts = {};
  Controls.contexts.splash = splash;
  Controls.contexts.main = main;
  Controls.contexts.spells = spells;
  GUI.updateMenu = function(txt) {
    menu.text = txt;
    menu.render();
  };

  //Controls.stack = [];


  return HTomb;
})(HTomb);
