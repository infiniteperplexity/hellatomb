// The ridiculously huge GUI submodule contains all the display and input functions
// There must be some logical way to split this without exposing too many properties...
HTomb = (function(HTomb) {
  "use strict";
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
  // Lucida Console, Trebuchet MS, Monaco, Verdana, Arial, Courier New (may be default?)
  var display = new ROT.Display({width: SCREENW+MENUW, height: SCREENH+STATUSH+SCROLLH, fontSize: FONTSIZE});
  document.body.appendChild(display.getContainer());
  // Attach input events
  var shiftArrow = null;
  var keydown = function(key) {
    key.preventDefault();
    HTomb.stopTime();
    // Pass the keystroke to the current control context
    var diagonal = null;
    if (key.shiftKey && [ROT.VK_UP,ROT.VK_DOWN,ROT.VK_LEFT,ROT.VK_RIGHT].indexOf(key.keyCode)>-1) {
      if (shiftArrow===null) {
        shiftArrow = key.keyCode;
      } else if (shiftArrow===ROT.VK_UP) {
        if (key.keyCode===ROT.VK_LEFT) {
          diagonal = ROT.VK_NUMPAD7;
        } else if (key.keyCode===ROT.VK_RIGHT) {
          diagonal = ROT.VK_NUMPAD9;
        } else {
          shiftArrow = key.keyCode;
        }
      } else if (shiftArrow===ROT.VK_DOWN) {
        if (key.keyCode===ROT.VK_LEFT) {
          diagonal = ROT.VK_NUMPAD1;
        } else if (key.keyCode===ROT.VK_RIGHT) {
          diagonal = ROT.VK_NUMPAD3;
        } else {
          shiftArrow = key.keyCode;
        }
      } else if (shiftArrow===ROT.VK_LEFT) {
        if (key.keyCode===ROT.VK_UP) {
          diagonal = ROT.VK_NUMPAD7;
        } else if (key.keyCode===ROT.VK_DOWN) {
          diagonal = ROT.VK_NUMPAD1;
        } else {
          shiftArrow = key.keyCode;
        }
      } else if (shiftArrow===ROT.VK_RIGHT) {
        if (key.keyCode===ROT.VK_UP) {
          diagonal = ROT.VK_NUMPAD9;
        } else if (key.keyCode===ROT.VK_DOWN) {
          diagonal = ROT.VK_NUMPAD3;
        } else {
          shiftArrow = key.keyCode;
        }
      }
      if (diagonal!==null) {
        Controls.context.keydown({keyCode: diagonal});
      }
    } else {
      Controls.context.keydown(key);
    }
  };
  function keyup(key) {
    if (key.keyCode===shiftArrow) {
      shiftArrow=null;
    }
  }
  var mousedown = function(click) {
    // Due to borders and such, nudge the X and Y slightly
    var xskew = +3;
    var yskew = +7;
    // Convert X and Y from pixels to characters
    var x = Math.floor((click.clientX+xskew)/HTomb.Constants.CHARWIDTH-1);
    var y = Math.floor((click.clientY+yskew)/HTomb.Constants.CHARHEIGHT-1);
    // If the click is not on the game screen, pass the actual X and Y positions
    if (GUI.panels.overlay!==null || x>=SCREENW || y>=SCREENH) {
      Controls.context.clickAt(x,y);
    // If the click is on the game screen, pass the X and Y tile coordinates
    } else {
      Controls.context.clickTile(x+gameScreen.xoffset,y+gameScreen.yoffset);
    }
  };
  var mousemove = function(move) {
    // Due to borders and such, nudge the X and Y slightly
    var xskew = +3;
    var yskew = +7;
    // Convert X and Y from pixels to characters
    var x = Math.floor((move.clientX+xskew)/HTomb.Constants.CHARWIDTH-1);
    var y = Math.floor((move.clientY+yskew)/HTomb.Constants.CHARHEIGHT-1);
    // If the hover is not on the game screen, pass the actual X and Y positions
    if (GUI.panels.overlay!==null || x>=SCREENW || y>=SCREENH) {
      Controls.context.mouseOver(x,y);
    } else {
      // If the hover is on the game screen, pass the X and Y tile coordinates
      Controls.context.mouseTile(x+gameScreen.xoffset,y+gameScreen.yoffset);
    }
  };
  // Bind a ROT.js keyboard constant to a function for a particular context
  var bindKey = function(target, key, func) {
    target.boundKeys[ROT[key]] = func;
  };
  // Set up event listeners
  window.addEventListener("keydown",keydown);
  window.addEventListener("keyup",keyup);
  display.getContainer().addEventListener("mousedown",mousedown);
  display.getContainer().addEventListener("mousemove",mousemove);

  // set up message buffer
  GUI.pushMessage = function(strng) {
    scroll.buffer.push(strng);
    if (scroll.buffer.length>=SCROLLH-1) {
      scroll.buffer.shift();
    }
    // Render the message immediatey if the scroll is visible
    if (GUI.panels.bottom===scroll) {
      scroll.render();
    }
  };
  // Render display panels
  GUI.render = function() {
    if (GUI.panels.overlay !== null) {
      // The overlay, if any, obscures all other panels
      // Shoudl we add one for the minimap?
      GUI.panels.overlay.render();
    } else {
      // Draw all the panels
      GUI.panels.main.render();
      GUI.panels.middle.render();
      GUI.panels.bottom.render();
      GUI.panels.right.render();
      GUI.panels.corner.render();
    }
  };
  // Draw a character at the appropriate X and Y tile
  GUI.drawTile = function(x,y,ch,fg,bg) {
    var xoffset = gameScreen.xoffset || 0;
    var yoffset = gameScreen.yoffset || 0;
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
  // Change the background color of the appropriate X and Y tile
  GUI.highlightTile = function(x,y,bg) {
    var xoffset = gameScreen.xoffset || 0;
    var yoffset = gameScreen.yoffset || 0;
    var z = gameScreen.z;
    var sym = HTomb.Tiles.getSymbol(x,y,z);
    display.draw(
      x-xoffset,
      y-yoffset,
      sym[0],
      sym[1],
      bg
    );
  };
  // Display a splash screen
  GUI.splash = function(txt) {
    Controls.context = new ControlContext();
    var splash = new Panel(0,0);
    splash.render = function() {
      display.drawText(splash.x0+1,splash.y0+1, txt);
    };
    GUI.panels.overlay = splash;
    GUI.render();
  };
  // Reset the GUI
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
    GUI.recenter();
    GUI.render();
  };

  // **************** GUI Panels ******************
  // Each panel knows where it belongs on the screen
  function Panel(leftx,topy) {
    this.x0 = leftx;
    this.y0 = topy;
  }
  Panel.prototype.render = function() {};
  // The main game screen where you see tiles
  var gameScreen = new Panel(0,0);
  // Keep track of how many tiles it is offset from 0, 0
  gameScreen.xoffset = 0;
  gameScreen.yoffset = 0;
  // Keep track of which Z level it is on
  gameScreen.z = 1;
  gameScreen.render = function() {
    var z = gameScreen.z;
    var xoffset = gameScreen.xoffset;
    var yoffset = gameScreen.yoffset;
    for (var x = xoffset; x < xoffset+SCREENW; x++) {
      for (var y = yoffset; y < yoffset+SCREENH; y++) {
        if (gameScreen.z===undefined) {
          alert("wtf!");
        }
        // Draw every symbol in the right place
        var sym = HTomb.Tiles.getSymbol(x,y,z);
        sym = HTomb.World.dailyCycle.shade(sym,x,y,z);
        display.draw(this.x0+x-xoffset,this.y0+y-yoffset, sym[0], sym[1], sym[2]);
      }
    }
  };
  // Show status, currently including hit points and coordinates
  var status = new Panel(1,SCREENH);
  status.render = function() {
    //black out the entire line with solid blocks
    display.drawText(this.x0,this.y0+1,"%c{black}"+(UNIBLOCK.repeat(SCREENW-2)));
    display.drawText(this.x0,this.y0+1,"HP: " + 5 + "/" + 5);
    display.drawText(this.x0+15,this.y0+1,"X: " + HTomb.Player.x);
    display.drawText(this.x0+21,this.y0+1,"Y: " + HTomb.Player.y);
    display.drawText(this.x0+27,this.y0+1,"Elevation: " + gameScreen.z);
    display.drawText(this.x0+42,this.y0+1,
      HTomb.World.dailyCycle.getPhase().symbol + "  Time: "
      + HTomb.World.dailyCycle.day + ":"
      + HTomb.World.dailyCycle.hour + ":"
      + HTomb.World.dailyCycle.minute);
  };
  // Show messages
  var scroll = new Panel(1,SCREENH+STATUSH);
  scroll.buffer = [];
  scroll.render = function() {
    for (var s=0; s<this.buffer.length; s++) {
      //black out the entire line with solid blocks
      display.drawText(this.x0,this.y0+s+1,"%c{black}"+(UNIBLOCK.repeat(SCREENW+MENUW-2)));
      display.drawText(this.x0,this.y0+s+1,this.buffer[s]);
    }
  };
  // Provide the player with instructions
  var menu = new Panel(SCREENW+1,1);
  var defaultText = menu.text = [
    "To move use numpad",
    "or arrows.  Shift+arrows",
    "to go diagonally",
    "(release shift between",
    "diagonals.)",
    "G to pick up,",
    "D to drop.",
    ", or . to go down or up.",
    "Z to cast a spell",
    "J to assign a job",
    "A to act or apply",
    "Space to wait",
    "Hover mouse to examine",
    "a square.",
    "Tab to enter survey mode."
  ];
  menu.render = function() {
    for (var i=0; i<SCREENH; i++) {
      display.drawText(this.x0, this.y0+i+1, "%c{black}"+(UNIBLOCK.repeat(MENUW-2)));
      if (menu.text[i]) {
        display.drawText(this.x0, this.y0+1+i, menu.text[i]);
      }
    }
  };
  // Show properties of the tile the mouse is hovering over
  var hover = new Panel(SCREENW+1,SCREENH+1);
  hover.text = [
    ["Square: ","Creature: ","Items: ","Feature: ","",""],
    ["","","","","",""]
  ];
  hover.render = function() {
    for (var i=0; i<SCROLLH; i++) {
      display.drawText(this.x0, this.y0+i, "%c{black}"+(UNIBLOCK.repeat(MENUW)));
      display.drawText(this.x0, this.y0+i, hover.text[0][i]);
      display.drawText(this.x0+hover.text[0][i].length, this.y0+i, hover.text[1][i]);
    }
  };

  // Prototype for control contexts
  function ControlContext(bindings) {
    // Pass a map of keystroke / function bindings
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
      HTomb.Debug.pushMessage("No binding for " + key.keyCode);
    } else {
      this.boundKeys[key.keyCode]();
    }
  };
  // By default, clicking resets the GUI
  ControlContext.prototype.clickAt = function() {
    GUI.reset();
  };
  ControlContext.prototype.clickTile = function() {
    GUI.reset();
  };
  // By default, dragging the mouse outside the game screen resets the game screen
  // This clears out highlighted tiles from hovering, for example
  ControlContext.prototype.mouseOver = function() {
    if (GUI.panels.overlay===null) {
      gameScreen.render();
    }
  };
  // An odd place for this method...formats a list of items
  GUI.listItems = function(arr) {
    var mesg = "";
    for (var i = 0; i<arr.length; i++) {
      mesg = mesg + " " + arr[i].describe();
      if (i===arr.length-2) {
        mesg = mesg + ", and";
      } else if (i<arr.length-1) {
        mesg = mesg + ",";
      }
    }
    return mesg;
  };
  // By default, hovering over a tile describes its contents
  ControlContext.prototype.mouseTile = function(x,y) {
    if (GUI.panels.overlay===null) {
      GUI.panels.main.render();
    }
    var z = gameScreen.z;
    GUI.highlightTile(x,y,"#0000FF");
    var square = HTomb.Tiles.getSquare(x,y,z);
    if (square.explored===false) {
      hover.text[0][4] = "";
      hover.text[0][5] = "";
      hover.text[1] = ["","","","","",""];
      hover.render();
      return;
    }
    hover.text[1][0] = square.terrain.name + " at " + x +", " + y + ", " + z + ".";
    if (square.creature) {
      hover.text[1][1] = square.creature.describe();
    } else {
      hover.text[1][1] = "";
    }
    var mesg = "";
    var i;
    if (square.items) {
      hover.text[1][2] = GUI.listItems(square.items);
    } else {
      hover.text[1][2] = "";
    }
    if (square.feature) {
      hover.text[0][3] = "Feature: ";
      hover.text[1][3] = square.feature.describe();
    } else {
      hover.text[1][3] = "";
    }
    var vis;
    if (square.terrain.zview===+1 && z+1<NLEVELS) {
    //if (square.feature && square.feature.zView===+1 && z+1<NLEVELS) {
      hover.text[0][4] = "Above: ";
      hover.text[0][5] = "Above: ";
      vis = HTomb.Tiles.getSquare(x,y,z+1);
      if (vis.creature) {
        hover.text[1][4] = vis.creature.describe();
      } else {
        hover.text[1][4] = "";
      }
      if (vis.items) {
        hover.text[1][5] = GUI.listItems(vis.items);
      } else {
        hover.text[1][5] = "";
      }
    //} else if (square.feature && square.feature.zView===-1 && z-1>=0) {
    } else if (square.terrain.zview===-1 && z-1>=0) {
      hover.text[0][4] = "Below: ";
      hover.text[0][5] = "Below: ";
      vis = HTomb.Tiles.getSquare(x,y,z-1);
      if (vis.creature) {
        hover.text[1][4] = vis.creature.describe();
      } else {
        hover.text[1][4] = "";
      }
      if (vis.items) {
        hover.text[1][5] = GUI.listItems(vis.items);
      } else {
        hover.text[1][5] = "";
      }
      if (vis.feature && !square.feature) {
        hover.text[0][3] = "Below: ";
        hover.text[1][3] = vis.feature.describe();
      }
    } else {
      hover.text[1][4] = "";
      hover.text[1][5] = "";
      hover.text[0][4] = "";
      hover.text[0][5] = "";
    }
    hover.render();
  };

  // Survey mode lets to scan the play area independently from the player's position
  GUI.surveyMode = function() {
    Controls.context = survey;
    survey.saveX = gameScreen.xoffset;
    survey.saveY = gameScreen.yoffset;
    survey.saveZ = gameScreen.z;
    GUI.updateMenu(["You are now in survey mode.","Use movement keys to navigate.","Comma go down.","Period to go up.","Escape to exit."]);
  };

  // These are the default controls
  var main = new ControlContext({
    // bind number pad movement
    VK_LEFT: Commands.tryMoveWest,
    VK_RIGHT: Commands.tryMoveEast,
    VK_UP: Commands.tryMoveNorth,
    VK_DOWN: Commands.tryMoveSouth,
    // bind keyboard movement
    VK_A: Commands.act,
    VK_NUMPAD7: Commands.tryMoveNorthWest,
    VK_NUMPAD8: Commands.tryMoveNorth,
    VK_NUMPAD9: Commands.tryMoveNorthEast,
    VK_NUMPAD4: Commands.tryMoveWest,
    VK_NUMPAD5: Commands.wait,
    VK_NUMPAD6: Commands.tryMoveEast,
    VK_NUMPAD1: Commands.tryMoveSouthWest,
    VK_NUMPAD2: Commands.tryMoveSouth,
    VK_NUMPAD3: Commands.tryMoveSouthEast,
    VK_PERIOD: Commands.tryMoveDown,
    VK_COMMA: Commands.tryMoveUp,
    VK_G: Commands.pickup,
    VK_D: Commands.drop,
    VK_J: Commands.showJobs,
    VK_Z: Commands.showSpells,
    VK_TAB: GUI.surveyMode,
//    VK_SHIFT: //this now handles diagonal movement
    VK_SPACE: Commands.wait,
    VK_ESCAPE: HTomb.stopTime,
    VK_PAGE_UP: function() {
      HTomb.setSpeed(HTomb.getSpeed()/1.25);
      HTomb.GUI.pushMessage("Speed set to " + parseInt(HTomb.getSpeed()) + ".");
      HTomb.startTime();
    },
    VK_PAGE_DOWN: function() {
      HTomb.setSpeed(HTomb.getSpeed()*1.25);
      HTomb.GUI.pushMessage("Speed set to " + parseInt(HTomb.getSpeed()) + ".");
    }
  });

  // Clicking outside the game screen does nothing
  main.clickAt = function(x,y) {
    //do nothing
  };
  // Clicking a tile looks...this may be obsolete
  main.clickTile = function(x,y) {
    var square = HTomb.Tiles.getSquare(x,y,gameScreen.z);
    Commands.look(square);
  };

  // Update the right-hand menu instructions
  GUI.updateMenu = function(txt) {
    menu.text = txt;
    menu.render();
  };

  // Display a menu of letter-bound choices
  GUI.choosingMenu = function(s,arr, func) {
    var alpha = "abcdefghijklmnopqrstuvwxyz";
    var contrls = {};
    var choices = [s];
    // there is probably a huge danger of memory leaks here
    for (var i=0; i<arr.length; i++) {
      var desc = arr[i].describe();
      var choice = arr[i];
      // Bind a callback function and its closure to each keystroke
      contrls["VK_" + alpha[i].toUpperCase()] = func(choice);
      choices.push(alpha[i]+") " + arr[i].describe());
    }
    contrls.VK_ESCAPE = GUI.reset;
    choices.push("Esc to cancel");
    Controls.context = new ControlContext(contrls);
    GUI.updateMenu(choices);
  };

  // Select a single square with the mouse
  HTomb.GUI.selectSquare = function(z, callb, options) {
    options = options || {};
    GUI.updateMenu(["Use movement keys to navigate.","Comma go down.","Period to go up.","Escape to exit."]);
    HTomb.GUI.pushMessage("Select a square.");
    var context = Object.create(survey);
    HTomb.Controls.context = context;
    survey.saveX = gameScreen.xoffset;
    survey.saveY = gameScreen.yoffset;
    survey.saveZ = gameScreen.z;
    context.clickTile = function(x,y) {
      callb(x,y,gameScreen.z);
      GUI.reset();
    };
    if (options.line!==undefined) {
      var x0 = options.line.x || HTomb.Player.x;
      var y0 = options.line.y || HTomb.Player.y;
      var bg = options.line.bg || "#550000";
      context.mouseTile = function(x,y) {
        gameScreen.render();
        var line = HTomb.Path.line(x0,y0,x,y);
        for (var i in line) {
          var sq = line[i];
          HTomb.GUI.highlightSquare(sq[0],sq[1],bg);
        }
      };
    }
  };

  HTomb.GUI.pickDirection = function(callb) {
    GUI.updateMenu(["Pick a direction","Or press Escape to cancel"]);
    function actToward(dx,dy,dz) {
      return function() {
        var x = HTomb.Player.x+dx;
        var y = HTomb.Player.y+dy;
        var z = HTomb.Player.z+dz;
        callb(x,y,z);
        HTomb.GUI.reset();
      };
    }
    var context = new ControlContext({
      VK_LEFT: actToward(-1,0,0),
      VK_RIGHT: actToward(+1,0,0),
      VK_UP: actToward(0,-1,0),
      VK_DOWN: actToward(0,+1,0),
      // bind keyboard movement
      VK_PERIOD: actToward(0,0,-1),
      VK_COMMA: actToward(0,0,+1),
      VK_NUMPAD7: actToward(-1,-1,0),
      VK_NUMPAD8: actToward(0,-1,0),
      VK_NUMPAD9: actToward(+1,-1,0),
      VK_NUMPAD4: actToward(-1,0,0),
      VK_NUMPAD6: actToward(+1,0,0),
      VK_NUMPAD1: actToward(-1,+1,0),
      VK_NUMPAD2: actToward(0,+1,0),
      VK_NUMPAD3: actToward(+1,+1,0),
    });
    HTomb.Controls.context = context;
  };
  // Select a rectangular zone using its two corners
  HTomb.GUI.selectSquareZone = function(z, callb, options) {
    options = options || {};
    GUI.updateMenu(["Use movement keys to navigate.","Comma go down.","Period to go up.","Escape to exit."]);
    HTomb.GUI.pushMessage("Select the first corner.");
    var context = Object.create(survey);
    HTomb.Controls.context = context;
    survey.saveX = gameScreen.xoffset;
    survey.saveY = gameScreen.yoffset;
    survey.saveZ = gameScreen.z;
    context.clickTile = function (x,y) {
      HTomb.GUI.pushMessage("Select the second corner.");
      var context2 = new ControlContext({VK_ESCAPE: GUI.reset});
      HTomb.Controls.context = context2;
      context2.clickTile = secondSquare(x,y);
      context2.mouseTile = drawSquareBox(x,y);
    };
    var drawSquareBox = function(x0,y0) {
      var bg = options.bg || "#550000";
      return function(x1,y1) {
        gameScreen.render();
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
                squares.push([xs[x],ys[y],gameScreen.z]);
              }
            } else {
              squares.push([xs[x],ys[y],gameScreen.z]);
            }
          }
        }
        for (var k =0; k<squares.length; k++) {
          var coord = squares[k];
          GUI.highlightTile(coord[0],coord[1],bg);
        }
      };
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
            // If options.outline = true, use only the outline
            if (options.outline===true) {
              if (xs[x]===x0 || xs[x]===x1 || ys[y]===y0 || ys[y]===y1) {
                squares.push([xs[x],ys[y],gameScreen.z]);
              }
            } else {
              squares.push([xs[x],ys[y],gameScreen.z]);
            }
          }
        }
        // Invoke the callback function on the squares selected
        callb(squares);
        GUI.reset();
      };
    };
  };

  // Enter survey mode and save the screen's current position
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
    // Actually this returns a custom function for each type of movement
    return f;
  };

  // Recenter the game screen on the player
  GUI.recenter = function() {
    var Player = HTomb.Player;
    gameScreen.z = Player.z;
    if (Player.x >= gameScreen.xoffset+SCREENW-2) {
      gameScreen.xoffset = Player.x-SCREENW+2;
    } else if (Player.x <= gameScreen.xoffset) {
      gameScreen.xoffset = Player.x-1;
    }
    if (Player.y >= gameScreen.yoffset+SCREENH-2) {
      gameScreen.yoffset = Player.y-SCREENH+2;
    } else if (Player.y <= gameScreen.yoffset) {
      gameScreen.yoffset = Player.y-1;
    }
  };

  // The control context for surveying
  var survey = new ControlContext({
    VK_LEFT: surveyMove(-1,0,0),
    VK_RIGHT: surveyMove(+1,0,0),
    VK_UP: surveyMove(0,-1,0),
    VK_DOWN: surveyMove(0,+1,0),
    // bind keyboard movement
    VK_PERIOD: surveyMove(0,0,-1),
    VK_COMMA: surveyMove(0,0,+1),
    VK_NUMPAD7: surveyMove(-1,-1,0),
    VK_NUMPAD8: surveyMove(0,-1,0),
    VK_NUMPAD9: surveyMove(+1,-1,0),
    VK_NUMPAD4: surveyMove(-1,0,0),
    VK_NUMPAD6: surveyMove(+1,0,0),
    VK_NUMPAD1: surveyMove(-1,+1,0),
    VK_NUMPAD2: surveyMove(0,+1,0),
    VK_NUMPAD3: surveyMove(+1,+1,0),
    // Exit survey mode and return to the original position
    VK_ESCAPE: function() {
      //gameScreen.xoffset = survey.saveX;
      //gameScreen.yoffset = survey.saveY;
      gameScreen.z = survey.saveZ;
      GUI.recenter();
      GUI.reset();
    }
  });
  survey.clickTile = main.clickTile;

  // Currently implemented, seems slow and I don't know where to put it
  var minimap = {};
  minimap.render = function() {
    var x0 = HTomb.Constants.CHARWIDTH*SCREENW;
    var y0 = 15*HTomb.Constants.CHARHEIGHT;
    var gridSize = 1;
    var ctx = display._context;
    ctx.fillStyle = "black";
    ctx.fillRect(x0,y0,x0+LEVELW*gridSize,y0+LEVELH*gridSize);
    for (var x=0; x<LEVELW; x++) {
      for (var y=0; y<LEVELH; y++) {
        var c = HTomb.Tiles.getSymbol(x,y,gameScreen.z)[1];
        ctx.fillStyle = c;
        ctx.fillRect(x0+x*gridSize,y0+y*gridSize,gridSize,gridSize);
      }
    }
  };

  return HTomb;
})(HTomb);
