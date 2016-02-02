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
  var NLEVELS = HTomb.Constants.NLEVELS;
  var SCROLLH = HTomb.Constants.SCROLLH;
  var MENUW = HTomb.Constants.MENUW;
  var STATUSH = HTomb.Constants.STATUSH;
  var FONTSIZE = HTomb.Constants.FONTSIZE;
  var UNIBLOCK = HTomb.Constants.UNIBLOCK;
  var EARTHTONE = HTomb.Constants.EARTHTONE;
  var SHADOW = HTomb.Constants.SHADOW;
  // set up GUI and display
  var GUI = HTomb.GUI;
  GUI.panels = {};
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
    var xoffset = Controls.context.xoffset || 0;
    var yoffset = Controls.context.yoffset || 0;
    fg = fg || "white"  ;
    bg = bg || "black";
    display.draw(
      x-xoffset,
      y-yoffset,
      ch,
      fg,
      bg
    );
  };

  GUI.splash = function(txt) {
    Controls.context = new ControlContext();
    var splash = new Panel(0,0);
    splash.render = function() {
      display.drawText(splash.x0+1,splash.y0+1, txt);
    };
    GUI.panels.overlay = splash;
    GUI.render();
  };
  GUI.reset = function() {
    console.log("resetting gui");
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
    GUI.recenter();
    GUI.render();
  };

  // **************** GUI Panels ******************
  function Panel(leftx,topy) {
    this.x0 = leftx;
    this.y0 = topy;
  }
  Panel.prototype.render = function() {};
  var gameScreen = new Panel(0,0);
  gameScreen.xoffset = 0;
  gameScreen.yoffset = 0;
  gameScreen.z = 0;
  gameScreen.render = function() {
    var z = gameScreen.z;
    var xoffset = gameScreen.xoffset;
    var yoffset = gameScreen.yoffset;
    // I am not sure if this is the best way
    for (var x = xoffset; x < xoffset+SCREENW; x++) {
      for (var y = yoffset; y < yoffset+SCREENH; y++) {
        var sym = HTomb.Tiles.getSymbol(x,y,z);
        display.draw(this.x0+x-xoffset,this.y0+y-yoffset, sym[0], sym[1], sym[2]);
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
      display.drawText(this.x0,this.y0+s+1,"%c{black}"+(UNIBLOCK.repeat(SCREENW+MENUW-2)));
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
    "P to cast a spell",
    "J to assign a job",
    "Click to examine a square.",
    "Shift to enter survey mode."
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
    if (bindings===undefined) {
      this.keydown = GUI.reset;
    } else {
      this.boundKeys = [];
      for (var b in bindings) {
        bindKey(this,b,bindings[b]);
      }
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



  GUI.surveyMode = function() {
    Controls.context = survey;
    survey.saveX = gameScreen.xoffset;
    survey.saveY = gameScreen.yoffset;
    survey.saveZ = gameScreen.z;
    survey.xoffset = main.xoffset;
    survey.yoffset = main.yoffset;
    survey.z = main.z;
    GUI.updateMenu(["You are now in survey mode.","Use movement keys to navigate.","Comma go down.","Period to go up.","Escape to exit."]);
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
    VK_J: Commands.showJobs,
    VK_P: Commands.showSpells,
    VK_SHIFT: GUI.surveyMode
  });
  main.xoffset = 0;
  main.yoffset = 0;
  main.z = 1;

  main.clickAt = function(x,y) {
    var square = HTomb.Tiles.getSquare(x+this.xoffset,y+this.yoffset,this.z);
    Commands.look(square);
  };

  Controls.contexts = {};
  GUI.updateMenu = function(txt) {
    menu.text = txt;
    menu.render();
  };

  GUI.choosingMenu = function(s,arr, func) {
    var alpha = "abcdefghijklmnopqrstuvwxyz";
    var contrls = {};
    var choices = [s];
    // there is probably a huge danger of memory leaks here
    for (var i=0; i<arr.length; i++) {
      var desc = arr[i].describe();
      var choice = arr[i];
      contrls["VK_" + alpha[i].toUpperCase()] = func(choice);
      choices.push(alpha[i]+") " + arr[i].describe());
    }
    contrls.VK_ESCAPE = GUI.reset;
    choices.push("Esc to cancel");
    Controls.context = new ControlContext(contrls);
    GUI.updateMenu(choices);
  };

  HTomb.GUI.selectSquare = function(z, callb, options) {
    options = options || {};
    HTomb.GUI.pushMessage("Select a square.");
    var context = new ControlContext({VK_ESCAPE: GUI.reset});
    HTomb.Controls.context = context;
    context.clickAt = function(x,y) {
      callb(x,y,z);
    };
  };
  HTomb.GUI.selectSquareZone = function(z, callb, options) {
    options = options || {};
    HTomb.GUI.pushMessage("Select the first corner.");
    var context = new ControlContext({VK_ESCAPE: GUI.reset});
    HTomb.Controls.context = context;
    context.clickAt = function (x,y) {
      HTomb.GUI.drawAt(x,y,"X","red","black");
      HTomb.GUI.pushMessage("Select the second corner.");
      context.clickAt = secondSquare(x,y);
    };
    var secondSquare = function(x0,y0) {
      return function(x1,y1) {
        var xs = [];
        var ys = [];
        for (var i=0; i<=Math.abs(x1-x0); i++) {
            xs[i] = x0+i*Math.sign(x1-x0);
          }

        for (var j=0; j<=Math.abs(y1-y0); j++) {
          ys[j] = y0+j*Math.sign(y1-y0);
        }
        var squares = [];
        for (var x=0; x<xs.length; x++) {
          for (var y=0; y<ys.length; y++) {
            if (options.outline===true) {
              if (xs[x]===x0 || xs[x]===x1 || ys[y]===y0 || ys[y]===y1) {
                squares.push([xs[x],ys[y],z]);
              }
            } else {
              squares.push([xs[x],ys[y],z]);
            }
          }
        }
        callb(squares);
        GUI.reset();
      };
    };
  };

  var surveyMove = function(dx,dy,dz) {
    var f = function() {
      if (gameScreen.z+dz < NLEVELS || gameScreen.z+dz >= 0) {
        gameScreen.z+=dz;
      }
      if (gameScreen.xoffset+dx < LEVELW-SCREENW && gameScreen.xoffset+dx >= 0) {
        gameScreen.xoffset+=dx;
      }
      if (gameScreen.yoffset+dy < LEVELH-SCREENH && gameScreen.yoffset+dy >= 0) {
        gameScreen.yoffset+=dy;
      }
      GUI.render();
    };
    return f;
  };


  GUI.recenter = function() {
    var Player = HTomb.Player;
    gameScreen.z = Player._z;
    if (Player._x >= gameScreen.xoffset+SCREENW-2) {
      gameScreen.xoffset = Player._x-SCREENW+2;
    } else if (Player._x <= gameScreen.xoffset) {
      gameScreen.xoffset = Player._x-1;
    }
    if (Player._y >= gameScreen.yoffset+SCREENH-2) {
      gameScreen.yoffset = Player._y-SCREENH+2;
    } else if (Player._y <= gameScreen.yoffset) {
      gameScreen.yoffset = Player._y-1;
    }
  };

  var survey = new ControlContext({
    VK_LEFT: surveyMove(-1,0,0),
    VK_RIGHT: surveyMove(+1,0,0),
    VK_UP: surveyMove(0,-1,0),
    VK_DOWN: surveyMove(0,+1,0),
    // bind keyboard movement
    VK_Z: surveyMove(-1,+1,0),
    VK_S: surveyMove(0,+1,0),
    VK_X: surveyMove(0,+1,0),
    VK_C: surveyMove(+1,+1,0),
    VK_A: surveyMove(-1,0,0),
    VK_D: surveyMove(+1,0,0),
    VK_Q: surveyMove(-1,-1,0),
    VK_W: surveyMove(0,-1,0),
    VK_E: surveyMove(+1,-1,0),
    VK_PERIOD: surveyMove(0,0,-1),
    VK_COMMA: surveyMove(0,0,+1),
    VK_ESCAPE: function() {
      main.xoffset = survey.saveX;
      main.yoffset = survey.saveY;
      main.z = survey.saveZ;
      GUI.reset();
    }
  });
  survey.clickAt = main.clickAt;

  return HTomb;
})(HTomb);
