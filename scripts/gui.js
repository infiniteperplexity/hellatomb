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
  var SCROLLW = HTomb.Constants.SCROLLW;
  var MENUW = HTomb.Constants.MENUW;
  var MENUH = HTomb.Constants.MENUH;
  var STATUSH = HTomb.Constants.STATUSH;
  var FONTSIZE = HTomb.Constants.FONTSIZE;
  var UNIBLOCK = HTomb.Constants.UNIBLOCK;
  var EARTHTONE = HTomb.Constants.EARTHTONE;
  var SHADOW = HTomb.Constants.SHADOW;
  var FONTFAMILY = HTomb.Constants.FONTFAMILY;
  var CHARHEIGHT = HTomb.Constants.CHARHEIGHT;
  var CHARWIDTH = HTomb.Constants.CHARWIDTH;
  var TEXTFONT = HTomb.Constants.TEXTFONT;
  var TEXTSIZE = HTomb.Constants.TEXTSIZE;
  var XSKEW = HTomb.Constants.XSKEW;
  var YSKEW = HTomb.Constants.YSKEW;
  var TEXTSPACING = HTomb.Constants.TEXTSPACING;
  var TEXTWIDTH = HTomb.Constants.TEXTWIDTH;

  // set up GUI and display
  var GUI = HTomb.GUI;
  GUI.panels = {};
  var Controls = HTomb.Controls;
  var Commands = HTomb.Commands;
  var display = new ROT.Display({
    width: SCREENW,
    height: SCREENH,
    fontSize: FONTSIZE,
    fontFamily: FONTFAMILY
  });
  var scrollDisplay = new ROT.Display({
    width: SCROLLW,
    height: STATUSH+SCROLLH,
    fontSize: TEXTSIZE,
    fontFamily: TEXTFONT,
    spacing: TEXTSPACING
  });
  var menuDisplay = new ROT.Display({
    width: MENUW,
    height: MENUH,
    fontSize: TEXTSIZE,
    fontFamily: TEXTFONT,
    spacing: TEXTSPACING
  });
  var splashDisplay = new ROT.Display({
    width: SCREENW*(CHARWIDTH/TEXTWIDTH)+MENUW,
    height: MENUH,
    fontSize: TEXTSIZE,
    fontFamily: TEXTFONT,
    spacing: TEXTSPACING
  });
  GUI.domInit = function() {
    var body = document.body;
    var div = document.createElement("div");
    div.id = "main";
    var game = document.createElement("div");
    game.id = "game";
    var menu = document.createElement("div");
    menu.id = "menu";
    var scroll = document.createElement("div");
    scroll.id = "scroll";
    var splash = document.createElement("div");
    splash.id = "splash";
    body.appendChild(div);
    div.appendChild(game);
    div.appendChild(menu);
    div.appendChild(scroll);
    div.appendChild(splash);
    game.appendChild(display.getContainer());
    menu.appendChild(menuDisplay.getContainer());
    scroll.appendChild(scrollDisplay.getContainer());
    splash.appendChild(splashDisplay.getContainer());
  };

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
  // this may change a bit if I add click functionality to other canvases
  var mousedown = function(click) {
    // Convert X and Y from pixels to characters
    var x = Math.floor((click.clientX+XSKEW)/CHARWIDTH-1);
    var y = Math.floor((click.clientY+YSKEW)/CHARHEIGHT-1);
    Controls.context.clickTile(x+gameScreen.xoffset,y+gameScreen.yoffset);
  };
  var mousemove = function(move) {
    // Convert X and Y from pixels to characters
    var x = Math.floor((move.clientX+XSKEW)/CHARWIDTH-1);
    var y = Math.floor((move.clientY+YSKEW)/CHARHEIGHT-1);
    // If the hover is not on the game screen, pass the actual X and Y positions
    if (GUI.panels.overlay!==null || x>=SCREENW || y>=SCREENH || x<0 || y<0) {
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
  menuDisplay.getContainer().addEventListener("mousemove",function() {HTomb.Controls.context.mouseOver();});
  scrollDisplay.getContainer().addEventListener("mousemove",function() {HTomb.Controls.context.mouseOver();});
  splashDisplay.getContainer().addEventListener("mousedown",function() {GUI.reset();});

  // set up message buffer
  GUI.sensoryEvent = function(strng,x,y,z) {
    if (HTomb.World.visible[HTomb.coord(x,y,z)]) {
      GUI.pushMessage(strng);
    }
  };
  GUI.pushMessage = function(strng) {
    scroll.buffer.push(strng);
    if (scroll.buffer.length>=SCROLLH) {
      scroll.buffer.shift();
    }
    // Render the message immediatey if the scroll is visible
    if (GUI.panels.bottom===scroll) {
      scroll.render();
    }
  };
  // Render display panels
  GUI.render = function() {
    // Draw all the panels
    GUI.panels.main.render();
    GUI.panels.middle.render();
    GUI.panels.bottom.render();
    GUI.panels.right.render();
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

  GUI.splash = function(arr) {
    // we may not want to force the player to reset the GUI...but let's try it out
    Controls.context = new ControlContext();
    var splash = document.getElementById("splash");
    splash.style.display = "initial";
    for (var i=0; i<SCREENH+SCROLLH; i++) {
      splashDisplay.drawText(1,1+i,"%c{black}"+(UNIBLOCK.repeat(SCREENW+MENUW+1)));
    }
    for (var j=0; j<arr.length; j++) {
      splashDisplay.drawText(4, 3+j, arr[j]);
    }
  };
  // Reset the GUI
  GUI.reset = function() {
    GUI.panels = {
      main: gameScreen,
      middle: status,
      bottom: scroll,
      right: menu
    };
    document.getElementById("splash").style.display = "none";
    Controls.context = main;
    GUI.updateMenu();
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
        var p = HTomb.Player;
        if (x===p.x && y===p.y && z===p.z) {
          // don't dim the player's foreground at night
          sym[2] = HTomb.World.dailyCycle.shade(sym,x,y,z)[2];
        } else {
          sym = HTomb.World.dailyCycle.shade(sym,x,y,z);
        }
        display.draw(this.x0+x-xoffset,this.y0+y-yoffset, sym[0], sym[1], sym[2]);
      }
    }
  };
  // Show status, currently including hit points and coordinates
  var status = new Panel(1,0);
  status.render = function() {
    //black out the entire line with solid blocks
    var cursor = 0;
    scrollDisplay.drawText(this.x0+cursor,this.y0+1,"%c{black}"+(UNIBLOCK.repeat(SCREENW-2)));
    scrollDisplay.drawText(this.x0+cursor,this.y0+1,"HP:" + 5 + "/" + 5);
    cursor+=9;
    scrollDisplay.drawText(this.x0+cursor,this.y0+1,"X:" + HTomb.Player.x);
    cursor+=6;
    scrollDisplay.drawText(this.x0+cursor,this.y0+1,"Y:" + HTomb.Player.y);
    cursor+=6;
    scrollDisplay.drawText(this.x0+cursor,this.y0+1,"Z:" + gameScreen.z);
    cursor+=7;
    scrollDisplay.drawText(this.x0+cursor,this.y0+1,
      HTomb.World.dailyCycle.getPhase().symbol + " "
      + HTomb.World.dailyCycle.day + ":"
      + HTomb.World.dailyCycle.hour + ":"
      + HTomb.World.dailyCycle.minute);
  };
  // Show messages
  var scroll = new Panel(1,STATUSH);
  scroll.buffer = [];
  scroll.render = function() {
    for (var s=0; s<this.buffer.length; s++) {
      //black out the entire line with solid blocks
      scrollDisplay.drawText(this.x0,this.y0+s+1,"%c{black}"+(UNIBLOCK.repeat(SCREENW+MENUW-2)));
      scrollDisplay.drawText(this.x0,this.y0+s+1,this.buffer[s]);
    }
  };
  // Provide the player with instructions
  var menu = new Panel(0,1);
  var defaultText = [
    "Movement: NumPad / Arrows.",
    "(Shift+Arrows for diagonal.)",
    "J: Assign Job, Z: Cast Spell.",
    "G: Pick Up, D: Drop, I: Inventory.",
    "Space: Wait, Tab: Survey Mode.",
    "Hover mouse to examine a square."
  ];
  menu.render = function() {
    for (var i=0; i<SCREENH+SCROLLH; i++) {
      menuDisplay.drawText(this.x0, this.y0+i, "%c{black}"+(UNIBLOCK.repeat(MENUW-2)));
      if (menu.text[i]) {
        var j = 0;
        if (menu.text[i].charAt(0)===" ") {
          for (j=0; j<menu.text[i].length; j++) {
            if (menu.text[i].charAt(j)!==" ") {
              break;
            }
          }
        }
        menuDisplay.drawText(this.x0+j, this.y0+i, menu.text[i]);
      }
    }
  };
  // Show properties of the tile the mouse is hovering over

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

  ControlContext.prototype.mouseTile = function(x,y) {
    if (GUI.panels.overlay===null) {
      GUI.panels.main.render();
    }
    GUI.highlightTile(x,y,"#0000FF");
    var z = gameScreen.z;
    var txt = examineSquare(x,y,z);
    var myText = this.menuText || defaultText;
    GUI.displayMenu(myText.concat(" ").concat(txt));
  };

  GUI.updateMenu = function() {
    GUI.displayMenu(Controls.context.menuText || defaultText);
  };

  function examineSquare(x,y,z) {
    var square = HTomb.Tiles.getSquare(x,y,z);
    var below = HTomb.Tiles.getSquare(x,y,z-1);
    var above = HTomb.Tiles.getSquare(x,y,z+1);
    var text = ["Coord: " + square.x +"," + square.y + "," + square.z];
    var next;
    var listLines, i;
    if(square.explored || HTomb.Debug.explored) {
      next = "Terrain: "+square.terrain.name;
      text.push(next);
      next = "Creature: ";
      if (square.creature && (square.visible || HTomb.Debug.visible)) {
        next+=square.creature.describe();
        text.push(next);
      }
      next = "Items: ";
      if (square.items && (square.visible || HTomb.Debug.visible)) {
        for (i=0; i<square.items.length; i++) {
          next+=square.items[i].describe();
          text.push(next);
          next = "       ";
        }
      }
      next = "Feature: ";
      if (square.feature) {
        next+=square.feature.describe();
      }
      text.push(next);
      next = "Zone: ";
      if (square.zone) {
        next+=square.zone.describe();
      }
      text.push(next);
      next = "Turf/Liquid: ";
      if (square.turf) {
        next+=square.turf.describe();
      }
      text.push(next);
      text.push(" ");
    }
    if (square.exploredAbove) {
      next = "Above: "+above.terrain.name;
      text.push(next);
      next = "Creature: ";
      if (above.creature && square.visibleAbove) {
        next+=above.creature.describe();
        text.push(next);
      }
      next = "Items: ";
      if (above.items && square.visibleAbove) {
        for (i=0; i<above.items.length; i++) {
          next+=above.items[i].describe();
          text.push(next);
          next = "       ";
        }
      }
      next = "Feature: ";
      if (above.feature) {
        next+=above.feature.describe();
      }
      text.push(next);
      next = "Zone: ";
      if (above.zone) {
        next+=above.zone.describe();
      }
      text.push(next);
      next = "Turf/Liquid: ";
      if (above.turf) {
        next+=above.turf.describe();
      }
      text.push(next);
      text.push(" ");
    }
    if (square.exploredBelow) {
      next = "Below: "+below.terrain.name;
      text.push(next);
      next = "Creature: ";
      if (below.creature && square.visibleBelow) {
        next+=below.creature.describe();
        text.push(next);
      }
      next = "Items: ";
      if (below.items && square.visibleBelow) {
        for (i=0; i<below.items.length; i++) {
          next+=below.items[i].describe();
          text.push(next);
          next = "       ";
        }
      }
      next = "Feature: ";
      if (below.feature) {
        next+=below.feature.describe();
      }
      text.push(next);
      next = "Zone: ";
      if (below.zone) {
        next+=below.zone.describe();
      }
      text.push(next);
      next = "Turf/Liquid: ";
      if (below.turf) {
        next+=below.turf.describe();
      }
      text.push(next);
    }
    return text;
  }


  // Survey mode lets to scan the play area independently from the player's position
  GUI.surveyMode = function() {
    Controls.context = survey;
    survey.saveX = gameScreen.xoffset;
    survey.saveY = gameScreen.yoffset;
    survey.saveZ = gameScreen.z;
    GUI.updateMenu();
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
    VK_I: Commands.inventory,
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
    viewDetails(x,y,gameScreen.z);
  };
  function viewDetails(x,y,z) {
    var square = HTomb.Tiles.getSquare(x,y,z);
    var details = [];
    details = details.concat(square.terrain.details());
    GUI.splash(details);
  }
  main.mouseOver = function() {
    if (GUI.panels.overlay===null) {
      // The main control context always wants to show the instructions
      GUI.displayMenu(defaultText);
      gameScreen.render();
    }
  };

  // Update the right-hand menu instructions
  GUI.displayMenu = function(arr) {
    var i=0;
    var br=null;
    while(i<arr.length) {
      if (arr[i].length<MENUW-2) {
        i++;
        continue;
      }
      for (var j=0; j<arr[i].length; j++) {
        if (arr[i][j]===" ") {
          br = j;
        }
        if (j>=MENUW-2) {
          var one = arr[i].substring(0,br);
          var two = arr[i].substring(br+1);
          arr[i] = one;
          arr.splice(i+1,0,two);
          break;
        }
      }
      i++;
      br = null;
    }
    menu.text = arr;
    menu.render();
  };

  // Display a menu of letter-bound choices
  GUI.choosingMenu = function(s,arr, func) {
    var alpha = "abcdefghijklmnopqrstuvwxyz";
    var contrls = {};
    var choices = [s];
    // there is probably a huge danger of memory leaks here
    for (var i=0; i<arr.length; i++) {
      var desc = (arr[i].describe!==undefined) ? arr[i].describe() : arr[i];
      var choice = arr[i];
      // Bind a callback function and its closure to each keystroke
      contrls["VK_" + alpha[i].toUpperCase()] = func(choice);
      choices.push(alpha[i]+") " + desc);
    }
    contrls.VK_ESCAPE = GUI.reset;
    choices.push("Esc to cancel");
    Controls.context = new ControlContext(contrls);
    Controls.context.menuText = choices;
    GUI.updateMenu();
  };

  // Select a single square with the mouse
  HTomb.GUI.selectSquare = function(z, callb, options) {
    options = options || {};
    HTomb.GUI.pushMessage("Select a square.");
    var context = Object.create(survey);
    context.menuText = ["Use movement keys to navigate.","Comma go down.","Period to go up.","Escape to exit."];
    HTomb.Controls.context = context;
    GUI.updateMenu();
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
        var txt = examineSquare(x1,y1,gameScreen.z);
        var myText = HTomb.Controls.context.menuText;
        GUI.displayMenu(myText.concat(" ").concat(txt));
      };
    }
  };

  HTomb.GUI.pickDirection = function(callb) {
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
    context.menuText = ["Pick a direction","Or press Escape to cancel"];
    HTomb.Controls.context = context;
  };
  // Select a rectangular zone using its two corners
  HTomb.GUI.selectSquareZone = function(z, callb, options) {
    options = options || {};
    HTomb.GUI.pushMessage("Select the first corner.");
    var context = Object.create(survey);
    context.menuText = ["Use movement keys to navigate.","Comma go down.","Period to go up.","Escape to exit."];
    if (options.message) {
      context.menuText.unshift("");
      context.menuText.unshift(options.message);
    }
    HTomb.Controls.context = context;
    GUI.updateMenu();
    survey.saveX = gameScreen.xoffset;
    survey.saveY = gameScreen.yoffset;
    survey.saveZ = gameScreen.z;
    context.clickTile = function (x,y) {
      HTomb.GUI.pushMessage("Select the second corner.");
      var context2 = new ControlContext({VK_ESCAPE: GUI.reset});
      HTomb.Controls.context = context2;
      context2.menuText = context.menuText;
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
        var txt = examineSquare(x1,y1,gameScreen.z);
        var myText = HTomb.Controls.context.menuText;
        GUI.displayMenu(myText.concat(" ").concat(txt));
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
        if (options.reset!==false) {
          GUI.reset();
        }
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
  survey.menuText = ["You are now in survey mode.","Use movement keys to navigate.","Comma go down.","Period to go up.","Escape to exit."];
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
