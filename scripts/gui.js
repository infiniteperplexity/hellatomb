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
  var coord = HTomb.Utils.coord;
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
  var overlayDisplay = new ROT.Display({
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
    var overlay = document.createElement("div");
    overlay.id = "overlay";
    body.appendChild(div);
    div.appendChild(game);
    div.appendChild(menu);
    div.appendChild(scroll);
    div.appendChild(overlay);
    game.appendChild(display.getContainer());
    menu.appendChild(menuDisplay.getContainer());
    scroll.appendChild(scrollDisplay.getContainer());
    overlay.appendChild(overlayDisplay.getContainer());
  };

  // Attach input events
  var shiftArrow = null;
  var keydown = function(key) {
    key.preventDefault();
    HTomb.Time.stopTime();
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
    click.preventDefault();
    // Convert X and Y from pixels to characters
    var x = Math.floor((click.clientX+XSKEW)/CHARWIDTH-1);
    var y = Math.floor((click.clientY+YSKEW)/CHARHEIGHT-1);
    if (click.button===2) {
      Controls.context.rightClickTile(x+gameScreen.xoffset,y+gameScreen.yoffset);
    } else {
      Controls.context.clickTile(x+gameScreen.xoffset,y+gameScreen.yoffset);
    }
  };
  var mousemove = function(move) {
    // Convert X and Y from pixels to characters
    var x = Math.floor((move.clientX+XSKEW)/CHARWIDTH-1);
    var y = Math.floor((move.clientY+YSKEW)/CHARHEIGHT-1);
      // If the hover is on the game screen, pass the X and Y tile coordinates
    Controls.context.mouseTile(x+gameScreen.xoffset,y+gameScreen.yoffset);
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
  window.oncontextmenu = function(e) {if (e && e.stopPropagation) {e.stopPropagation();} return false;};
  menuDisplay.getContainer().addEventListener("mousemove",function() {HTomb.Controls.context.mouseOver();});
  scrollDisplay.getContainer().addEventListener("mousemove",function() {HTomb.Controls.context.mouseOver();});
  overlayDisplay.getContainer().addEventListener("mousedown",function() {GUI.reset();});

  // set up message buffer
  GUI.sensoryEvent = function(strng,x,y,z) {
    if (HTomb.World.visible[HTomb.Utils.coord(x,y,z)]) {
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
  HTomb.Debug.pushMessage = function(msg) {
    if (HTomb.Debug.messages===true) {
      HTomb.GUI.pushMessage(msg);
      console.log(msg);
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

  GUI.refreshTile = function(x,y) {
    var xoffset = gameScreen.xoffset || 0;
    var yoffset = gameScreen.yoffset || 0;
    var z = gameScreen.z;
    var sym = HTomb.Tiles.getSymbol(x,y,z);
    display.draw(
      x-xoffset,
      y-yoffset,
      sym[0],
      sym[1],
      sym[2]
    );
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

  GUI.drawGlyph = function(x,y,ch,fg) {
    var xoffset = gameScreen.xoffset || 0;
    var yoffset = gameScreen.yoffset || 0;
    fg = fg || "white";
    var z = gameScreen.z;
    var bg = HTomb.Tiles.getBackground(x,y,z);
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
    var sym = HTomb.Tiles.getGlyph(x,y,z);
    display.draw(
      x-xoffset,
      y-yoffset,
      sym[0],
      sym[1],
      bg
    );
  };

  var overlayActive = false;
  function updateOverlay(arr) {
    HTomb.Time.stopTime();
    HTomb.Time.stopParticles();
    // we may not want to force the player to reset the GUI...but let's try it out
    for (var i=0; i<SCREENH+SCROLLH; i++) {
      overlayDisplay.drawText(1,1+i,"%c{black}"+(UNIBLOCK.repeat(SCREENW*(CHARWIDTH/TEXTWIDTH)+MENUW-2)));
    }
    for (var j=0; j<arr.length; j++) {
      var x=0;
      if (arr[j].charAt(0)===" ") {
        for (x=1; x<arr[j].length; x++) {
          if (arr[j].charAt(x)!==" ") {
            break;
          }
        }
      }
      overlayDisplay.drawText(4+x, 3+j, arr[j]);
    }
    overlayActive = true;
    var overlay = document.getElementById("overlay");
    overlay.style.display = "initial";
  }

  GUI.splash = function(arr) {
    Controls.context = new ControlContext();
    updateOverlay(arr);
  };
  // Reset the GUI
  GUI.reset = function() {
    if (overlayActive===true) {
      document.getElementById("overlay").style.display = "none";
      overlayActive = false;
    }
    GUI.panels = {
      main: gameScreen,
      middle: status,
      bottom: scroll,
      right: menu
    };
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
        // Draw every symbol in the right
        var sym = HTomb.Tiles.getSymbol(x,y,z);
        display.draw(this.x0+x-xoffset,this.y0+y-yoffset, sym[0], sym[1], sym[2]);
      }
    }
    GUI.renderParticles();
  };
  // Show status, currently including hit points and coordinates
  var status = new Panel(1,0);
  HTomb.GUI.renderStatus = function() {
    status.render();
  };
  status.render = function() {
    //black out the entire line with solid blocks
    var cursor = 0;
    scrollDisplay.drawText(this.x0+cursor,this.y0+1,"%c{black}"+(UNIBLOCK.repeat(SCROLLW-2)));
    scrollDisplay.drawText(this.x0+cursor,this.y0+1,"Mana:" + HTomb.Player.caster.mana + "/" + HTomb.Player.caster.maxmana);
    cursor+=12;
    scrollDisplay.drawText(this.x0+cursor,this.y0+1,"X:" + HTomb.Player.x);
    cursor+=6;
    scrollDisplay.drawText(this.x0+cursor,this.y0+1,"Y:" + HTomb.Player.y);
    cursor+=6;
    scrollDisplay.drawText(this.x0+cursor,this.y0+1,"Z:" + gameScreen.z);
    cursor+=7;
    scrollDisplay.drawText(this.x0+cursor,this.y0+1,
      HTomb.Time.dailyCycle.getPhase().symbol + " "
      + HTomb.Time.dailyCycle.day + ":"
      + HTomb.Time.dailyCycle.hour + ":"
      + HTomb.Time.dailyCycle.minute);
    cursor+=11;
    if (HTomb.Time.isPaused()===true) {
      scrollDisplay.drawText(this.x0+cursor,this.y0+1,"Paused");
    }
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
    "PageUp / PageDown to change speed.",
    "Hover mouse to examine a square.",
    "Click to pause or unpause.",
    "Right click for detailed view.",
    "Escape for summary view."
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
  ControlContext.prototype.rightClickTile = function(x,y) {
    this.clickTile(x,y);
  };
  ControlContext.prototype.clickTile = function() {
    GUI.reset();
  };
  // By default, dragging the mouse outside the game screen resets the game screen
  // This clears out highlighted tiles from hovering, for example
  var oldCursor = null;
  ControlContext.prototype.mouseOver = function() {
    if (oldCursor!==null) {
      GUI.refreshTile(oldCursor[0],oldCursor[1]);
    }
    oldCursor = null;
  };

  ControlContext.prototype.mouseTile = function(x,y) {
    if (oldCursor!==null) {
      GUI.refreshTile(oldCursor[0],oldCursor[1]);
    }
    GUI.highlightTile(x,y,"#0000FF");
    oldCursor = [x,y];
    var z = gameScreen.z;
    var txt = examineSquare(x,y,z);
    var myText = this.menuText || getDefaultText();
    GUI.displayMenu(myText.concat(" ").concat(txt));
  };
  function getDefaultText() {
    if (HTomb.Debug.tutorial.active!==true) {
      return defaultText;
    } else {
      let tutorialText = defaultText.concat([" ","TUTORIAL:",HTomb.Debug.tutorial.getText()]);
      return tutorialText;
    }
  }

  GUI.updateMenu = function() {
    GUI.displayMenu(Controls.context.menuText || getDefaultText());
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
      text.
      push(next);
      next = "Cover: ";
      if (square.cover) {
        next+=square.cover.describe();
      }
      text.push(next);
      next = "Lighting: ";
      next+=Math.round(HTomb.World.lit[z][x][y]);
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
      next = "Cover: ";
      if (above.cover) {
        next+=above.cover.describe();
      }
      text.push(next);
      next = "Lighting: ";
      next+=Math.round(HTomb.World.lit[z+1][x][y]);
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
      next = "Cover: ";
      if (below.cover) {
        next+=below.cover.describe();
      }
      text.push(next);
      next = "Lighting: ";
      next+=Math.round(HTomb.World.lit[z][x][y]);
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

  HTomb.Debug.zoomTo = function(x,y,z) {
    if (typeof(x)==="object") {
      z = x.z;
      y = x.y;
      x = x.x;
    }
    GUI.surveyMode();
    HTomb.Debug.explored = true;
    HTomb.Debug.visible = true;
    survey.z = z;
    if (x >= survey.xoffset+SCREENW-2) {
      survey.xoffset = x-SCREENW+2;
    } else if (x <= survey.xoffset) {
      survey.xoffset = x-1;
    }
    if (y >= survey.yoffset+SCREENH-2) {
      survey.yoffset = y-SCREENH+2;
    } else if (y <= survey.yoffset) {
      survey.yoffset = y-1;
    }
    gameScreen.render();
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
    VK_SPACE: Commands.wait,
    VK_ENTER: HTomb.Time.toggleTime,
    //VK_ESCAPE: HTomb.Time.stopTime,
    VK_ESCAPE: summaryView,
    VK_PAGE_UP: function() {
      HTomb.Time.setSpeed(HTomb.Time.getSpeed()/1.25);
      HTomb.GUI.pushMessage("Speed set to " + parseInt(HTomb.Time.getSpeed()) + ".");
      HTomb.Time.startTime();
    },
    VK_PAGE_DOWN: function() {
      HTomb.Time.setSpeed(HTomb.Time.getSpeed()*1.25);
      HTomb.GUI.pushMessage("Speed set to " + parseInt(HTomb.Time.getSpeed()) + ".");
    }
  });

  // Clicking outside the game screen does nothing
  main.clickAt = function(x,y) {
    HTomb.Time.toggleTime();
  };
  main.rightClickTile = function(x,y) {
    let p = HTomb.Player;
    if (x===p.x && y===p.y && gameScreen.z===p.z) {
      summaryView();
      return;
    }
    let f = HTomb.World.features[coord(x,y,gameScreen.z)];
    if (f && f.workshop && f.workshop.active && HTomb.World.creatures[coord(x,y,gameScreen.z)]===undefined) {
      workshopView(f.workshop);
      return;
    }
    detailsView(x,y,gameScreen.z);
  }
  main.clickTile = function(x,y) {
    HTomb.Time.toggleTime();
  };


  function viewDetails(x,y,z) {
    var square = HTomb.Tiles.getSquare(x,y,z);
    var c = coord(x,y,z);
    var details = ["PageUp or PageDown to scroll through minions; Tab to view summary; Escape to exit."]
    details.push(" ");
    details.push("Square at "+x+", "+y+", "+z+".");
    details.push(" ");
    var b, s, i;
    var thing;
    thing = HTomb.World.creatures[c];
    if (thing) {
      if (HTomb.Player.master.minions.indexOf(thing)>-1) {
        currentMinion = thing;
      }
      details.push("There is " + thing.describe() + " here.");
      details.push(" ");
      if (thing.ai && thing.ai.target) {
        b = thing.ai.target;
        details.push("Its attention is focused on " + b.describe() + " at "+b.x+", "+y+", "+z+".");
        details.push(" ");
      }
      if (thing.worker) {
        b = thing.worker;
        if (b.task) {
          s = "It is assigned to " + b.task.describe();
          if (b.task.zone) {
            var zone = b.task.zone;
            s+=" at " + zone.x + ", "+zone.y+", "+zone.z;
          }
          s+=".";
          details.push(s);
        }
        details.push(" ");
      }
      if (thing.inventory && thing.inventory.items.length>0) {
        b = thing.inventory.items;
        details.push("It is carrying: ");
        s = "  ";
        for (i=0; i<b.length; i++) {
          s+=b[i].describe();
          details.push(s);
          s = "  ";
        }
        details.push(" ");
      }
      if (thing.body && thing.body.materials) {
        b = thing.body.materials;
        details.push("Its body is made of: ");
        s = "  ";
        for (i in b) {
          s+=HTomb.Materials[i].describe() + " (" + b[i].has + " out of " + b[i].max + ")";
          details.push(s);
          s = "  ";
        }
        details.push(" ");
      }
    }
    thing = HTomb.World.features[c];
    if (thing) {
      details.push("There is " + thing.describe() + " here.");
    }
    if (thing && thing.workshop) {
      thing = thing.workshop;
      currentWorkshop = thing;
      if (thing.occupied) {
          details.push("It is manned by " + thing.occupied.describe());
      }
      if (thing.task) {
        details.push("It is working on " + thing.task.describe());
      }
      details.push(" ");
    }
    thing = HTomb.World.zones[c];
    if (thing) {
      details.push("There is " + thing.describe() + " zone here.");
      if (thing.task && thing.task.assignee) {
        b = thing.task.assignee;
        s = "It is assigned to " + b.describe() + " at " + b.x +", "+b.y+", "+b.z+".";
        details.push(s);
      }
      details.push(" ");
    }
    details = details.concat(square.terrain.details.description);
    details = details.concat(square.terrain.details.notes);
    return details;
  }
  main.mouseOver = function() {
    // The main control context always wants to show the instructions
    GUI.displayMenu(getDefaultText());
    gameScreen.render();
  };


  // These are the default controls
  var summary = new ControlContext({
    VK_ESCAPE: HTomb.GUI.reset,
    VK_PAGE_UP: detailsView,
    VK_PAGE_DOWN: workshopView,
    VK_TAB: workshopView
  });

  var workQueueCursor = 0;
  var workshops = new ControlContext({
    VK_ESCAPE: HTomb.GUI.reset,
    VK_PAGE_UP: nextWorkshop,
    VK_PAGE_DOWN: previousWorkshop,
    VK_TAB: detailsView,
    VK_UP: workQueueUp,
    VK_DOWN: workQueueDown,
    VK_LEFT: workQueueLeft,
    VK_RIGHT: workQueueRight,
    VK_EQUALS: workQueueMore,
    VK_HYPHEN_MINUS: workQueueLess,
    VK_DELETE: cancelGood,
    VK_BACK_SPACE: cancelGood
  });

  function cancelGood() {
    let w = currentWorkshop;
    w.task.cancel();
    w.nextGood();
  }
  function workQueueDown() {
    workQueueCursor+=1;
    //if (workQueueCursor>currentWorkshop.queue.length-1) {
    if (workQueueCursor>currentWorkshop.queue.length) {
      workQueueCursor = 0;
    }
    updateOverlay(workshopDetails(currentWorkshop));
  }
  function workQueueUp() {
    workQueueCursor-=1;
    if (workQueueCursor<0) {
      //workQueueCursor = currentWorkshop.queue.length-1;
      workQueueCursor = currentWorkshop.queue.length;
    }
    updateOverlay(workshopDetails(currentWorkshop));
  }
  function workQueueRight() {
    let i = workQueueCursor;
    let w = currentWorkshop;
    if (i>=w.queue.length) {
      return;
    }
    if (w.queue[i][1]==="finite") {
      w.queue[i][1]=1;
    } else if (parseInt(w.queue[i][1])===w.queue[i][1]) {
      w.queue[i][1]="infinite";
    } else if (w.queue[i][1]==="infinite") {
      w.queue[i][1] = "finite";
    }
    updateOverlay(workshopDetails(currentWorkshop));
  }
  function workQueueLeft() {
    let i = workQueueCursor;
    let w = currentWorkshop;
    if (i>=w.queue.length) {
      return;
    }
    if (w.queue.length===0) {
      return;
    }
    if (w.queue[i][1]==="finite") {
      w.queue[i][1]="infinite";
    } else if (parseInt(w.queue[i][1])===w.queue[i][1]) {
      w.queue[i][1]="finite";
    } else if (w.queue[i][1]==="infinite") {
      w.queue[i][1] = 1;
    }
    updateOverlay(workshopDetails(currentWorkshop));
  }
  function workQueueMore() {
    let i = workQueueCursor;
    let w = currentWorkshop;
    if (i>=w.queue.length) {
      return;
    }
    if (w.queue.length===0) {
      return;
    }
    if (w.queue[i][1]==="finite") {
      w.queue[i][2]+=1;
    } else if (parseInt(w.queue[i][1])===w.queue[i][1]) {
      w.queue[i][1]+=1;
      w.queue[i][2]+=1;
    }
    updateOverlay(workshopDetails(currentWorkshop));
  }
  function workQueueLess() {
    let i = workQueueCursor;
    let w = currentWorkshop;
    if (i>=w.queue.length) {
      return;
    }
    if (w.queue.length===0) {
      return;
    }
    if (w.queue[i][1]==="finite" && w.queue[i][2]>1) {
      w.queue[i][2]-=1;
    } else if (parseInt(w.queue[i][1])===w.queue[i][1] && w.queue[i][1]>1) {
      w.queue[i][1]-=1;
      if (w.queue[i][2]>w.queue[i][1]) {
        w.queue[i][2] = w.queue[i][1];
      }
    }
    updateOverlay(workshopDetails(currentWorkshop));
  }

  var details = new ControlContext({
    VK_ESCAPE: HTomb.GUI.reset,
    VK_PAGE_UP: nextMinion,
    VK_PAGE_DOWN: previousMinion,
    VK_TAB: summaryView
  });
  var currentMinion = null;
  var currentWorkshop = null;
  function nextMinion() {
    var p = HTomb.Player;
    if (currentMinion===null && p.master.minions.length>0) {
      p = p.master.minions[0];
      currentMinion = p;
      updateOverlay(viewDetails(p.x,p.y,p.z));
    } else if (p.master.minions.indexOf(currentMinion)===-1) {
      currentMinion = null;
      updateOverlay(viewDetails(p.x,p.y,p.z));
    } else {
      var i = p.master.minions.indexOf(currentMinion);
      if (i===p.master.minions.length-1) {
        i = 0;
      } else {
        i+=1;
      }
      p = p.master.minions[i];
      currentMinion = p;
      updateOverlay(viewDetails(p.x,p.y,p.z));
    }
    HTomb.Controls.context = details;
  }
  function previousMinion() {
    var p = HTomb.Player;
    if (currentMinion===null && p.master.minions.length>0) {
      p = p.master.minions[p.master.minions.length-1];
      currentMinion = p;
      updateOverlay(viewDetails(p.x,p.y,p.z));
    } else if (p.master.minions.indexOf(currentMinion)===-1) {
      currentMinion = null;
      updateOverlay(viewDetails(p.x,p.y,p.z));
    } else {
      var i = p.master.minions.indexOf(currentMinion);
      if (i===0) {
        i = p.master.minions.length-1;
      } else {
        i-=1;
      }
      p = p.master.minions[i];
      currentMinion = p;
      updateOverlay(viewDetails(p.x,p.y,p.z));
    }
    HTomb.Controls.context = details;
  }
  function nextWorkshop() {
    var p = HTomb.Player;
    if (currentWorkshop===null && p.master.workshops.length>0) {
      p = p.master.workshops[0];
      currentWorkshop = p;
      updateOverlay(workshopDetails(p));
    } else if (p.master.workshops.indexOf(currentWorkshop)===-1) {
      currentWorkshop = null;
      updateOverlay(viewDetails(p.x,p.y,p.z));
    } else {
      var i = p.master.workshops.indexOf(currentWorkshop);
      if (i===p.master.workshops.length-1) {
        i = 0;
      } else {
        i+=1;
      }
      p = p.master.workshops[i];
      currentWorkshop = p;
      updateOverlay(workshopDetails(p));
    }
    HTomb.Controls.context = workshops;
  }
  function previousWorkshop() {
    var p = HTomb.Player;
    if (currentWorkshop===null && p.master.workshops.length>0) {
      p = p.master.workshops[p.master.workshops.length-1];
      currentWorkshop = p;
      updateOverlay(workshopDetails(p));
    } else if (p.master.workshops.indexOf(currentWorkshop)===-1) {
      currentWorkshop = null;
      updateOverlay(viewDetails(p.x,p.y,p.z));
    } else {
      var i = p.master.workshops.indexOf(currentWorkshop);
      if (i===0) {
        i = p.master.workshops.length-1;;
      } else {
        i-=1;
      }
      p = p.master.workshops[i];
      currentWorkshop = p;
      updateOverlay(workshopDetails(p));
    }
    HTomb.Controls.context = workshops;
  }
  function workshopView(w) {
    w = w || HTomb.Player.master.workshops[0] || null;
    currentWorkshop = w;
    updateOverlay(workshopDetails(w));
    HTomb.Controls.context = workshops;
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i=0; i<alphabet.length; i++) {
      if (i===w.makes.length && i>0) {
        bindKey(workshops,"VK_"+alphabet[i],function() {
          w.queue.splice(workQueueCursor,1);
          workQueueUp();
          updateOverlay(workshopDetails(currentWorkshop));
        });
      } else if (i>w.makes.length) {
        delete workshops.boundKeys["VK_"+alphabet[i]];
      }
      else {
        bindKey(workshops,"VK_"+alphabet[i],function() {
          let good = w.makes[i];
          w.queue.splice(workQueueCursor,0,[good,"finite",1]);
          if (w.task===null) {
            w.nextGood();
          }
          updateOverlay(workshopDetails(currentWorkshop));
        });
      }
    }
  }
  function summaryView() {
    HTomb.Controls.context = summary;
    var text = ["Tab/PageUp/PageDown to scroll through minions; Escape to exit."];
    text.push(" ");
    var s;
    text.push("Minions:");
    for (let i=0; i<HTomb.Player.master.minions.length; i++) {
      var cr = HTomb.Player.master.minions[i];
      s = "  "+cr.describe() + " at "+cr.x+", "+cr.y+", "+cr.z;
      if (cr.minion.task) {
        s+=" working on " + cr.minion.task.describe();
        if (cr.minion.task.zone) {
          var zone = cr.minion.task.zone;
          s+=" at "+zone.x+", "+zone.y+", "+zone.z;
        }
      }
      text.push(s);
    }
    text.push(" ");
    text.push("Workshops:");
    for (let k=0; k<HTomb.Player.master.workshops.length; k++) {
      let w = HTomb.Player.master.workshops[k];
      s = "  "+w.describe()+" at "+w.x+", " +w.y+", "+w.z+".";
      text.push(s);
    }
    text.push(" ");
    text.push("Unassigned Tasks:");
    for (let k=0; k<HTomb.Player.master.taskList.length; k++) {
      var task = HTomb.Player.master.taskList[k];
      if (task.assignee===null) {
        s = "  "+task.describe();
        if (task.zone) {
          s+=" at "+task.zone.x+", "+task.zone.y+", "+task.zone.z;
        }
        s+=".";
        text.push(s);
      }
    }
    text.push(" ");
    text.push("Hoards:");
    var hoards = HTomb.ItemContainer();
    var zones = HTomb.Utils.where(HTomb.World.zones,function(v,k,o) {return (v.template==="HoardZone");});
    for (let j=0; j<zones.length; j++) {
      var x = zones[j].x;
      var y = zones[j].y;
      var z = zones[j].z;
      var items = HTomb.World.items[coord(x,y,z)] || [];
      for (var k=0; k<items.length; k++) {
        //really should be able to clone
        text.push("  "+items[k].describe());
      }
    }
    updateOverlay(text);
  }
  function workshopDetails(w) {
    let txt = [
      "Up/Down to traverse queue, Left/Right to change repeat options.",
      "Hyphen/Underscore to lower count, equals/plus to raise count.",
      "a-z to insert or remove production good from queue.",
      "Backspace or Delete to cancel current production.",
      "PageUp/PageDown to change workshops, Tab to see minions, Esc to exit.",
      w.describe() + " at " + w.x + ", " + w.y + ", " + w.z
    ];
    if (w.makes && w.makes.length>0) {
      txt.push("Products:");
      let alphabet = 'abcdefghijklmnopqrstuvwxyz';
      for (let i=0; i<w.makes.length; i++) {
        let t = HTomb.Things.templates[w.makes[i]];
        txt.push(alphabet[i] + ") " + t.describe());
      }
      txt.push(alphabet[w.makes.length] + ") Remove item.");
      txt.push(" ");
    }
    if (w.occupied) {
      txt.push("It is manned by " + w.occupied.describe());
    }
    if (w.task) {
      txt.push("It is working on " + w.task.describe());
    }
    txt.push(" ");
    txt.push("Production Queue:");
    let q = w.formattedQueue();
    if (q.length>0) {
      let s = q[workQueueCursor];
      s = "*" + s.substr(1);
      q[workQueueCursor] = s;
    }
    txt = txt.concat(q);
    return txt;
  }
  function detailsView(x,y,z) {
    if (x===undefined || y===undefined || z===undefined) {
      var p = HTomb.Player;
      if (p.master.minions.indexOf(currentMinion)===-1) {
        updateOverlay(viewDetails(p.x,p.y,p.z));
      } else {
        p = currentMinion;
        updateOverlay(viewDetails(p.x,p.y,p.z));
      }
    } else {
      updateOverlay(viewDetails(x,y,z));
    }
    HTomb.Controls.context = details;
  }
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
  GUI.choosingMenu = function(s, arr, func) {
    var alpha = "abcdefghijklmnopqrstuvwxyz";
    var contrls = {};
    var choices = [s];
    // there is probably a huge danger of memory leaks here
    for (var i=0; i<arr.length; i++) {
      var desc = (arr[i].onList!==undefined) ? arr[i].onList() : arr[i];
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
    if (options.message) {
      context.menuText.unshift("");
      context.menuText.unshift(options.message);
    }
    GUI.updateMenu();
    survey.saveX = gameScreen.xoffset;
    survey.saveY = gameScreen.yoffset;
    survey.saveZ = gameScreen.z;
    context.clickTile = function(x,y) {
      callb(x,y,gameScreen.z,options);
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
        callb(squares, options);
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

  GUI.center = function(x,y,z) {
    x = x-Math.floor(SCREENW/2)-1;
    y = y-Math.floor(SCREENH/2)-1;
    z = z || HTomb.Player.z;
    x = Math.max(x,Math.ceil(SCREENW/2));
    y = Math.max(y,Math.ceil(SCREENW/2));
    x = Math.min(x,Math.floor(LEVELW-1-SCREENW/2));
    y = Math.min(y,Math.floor(LEVELH-1-SCREENH/2));
    gameScreen.xoffset = x;
    gameScreen.yoffset = y;
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
  survey.rightClickTile = main.rightClickTile;

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

  var oldSquares;
  GUI.renderParticles = function() {
    var squares = {};
    var p,c,x,y,z;
    // collect the particles
    for (var j=0; j<HTomb.Particles.emitters.length; j++) {
      var emitter = HTomb.Particles.emitters[j];
      for (var i=0; i<emitter.particles.length; i++) {
        p = emitter.particles[i];
        // don't collect particles that aren't on the screen
        x = Math.round(p.x);
        if (x<gameScreen.xoffset || x>=gameScreen.xoffset+SCREENW || x>=LEVELW-1) {
          continue;
        }
        y = Math.round(p.y);
        if (y<gameScreen.yoffset || y>=gameScreen.yoffset+SCREENH || y>=LEVELH-1) {
          continue;
        }
        z = Math.round(p.z);
        // only bother with particles on the same level for now...or maybe within one level?
        //if (z!==gameScreen.z) {
        //  continue;
        //}
        c = coord(x,y,z);
        if (squares[c]===undefined) {
          squares[c] = [];
        }
        squares[c].push(p);
      }
    }
    // process the particles
    for (var s in squares) {
      if (oldSquares[s]) {
        delete oldSquares[s];
      }
      c = HTomb.Utils.decoord(s);
      x = c[0];
      y = c[1];
      z = c[2];
      var particles = squares[s];
      HTomb.Utils.shuffle(particles);
      var ch, fg;
      // if there are ever invisible particles we may need to handle this differently
      fg = HTomb.Tiles.getGlyph(x,y,z)[1];
      fg = ROT.Color.fromString(fg);
      for (var k=0; k<particles.length; k++) {
        var pfg = particles[k].fg;
        pfg[0] = Math.min(255,Math.max(pfg[0],0));
        pfg[1] = Math.min(255,Math.max(pfg[1],0));
        pfg[2] = Math.min(255,Math.max(pfg[2],0));
        //fg = HTomb.Utils.alphaHex(pfg, fg, particles[k].alpha);
        fg = HTomb.Utils.alphaHex(pfg, fg, particles[k].alpha);
      }
      fg[0] = Math.round(fg[0]);
      fg[1] = Math.round(fg[1]);
      fg[2] = Math.round(fg[2]);
      fg = ROT.Color.toHex(fg);
      ch = particles[particles.length-1].symbol;
      HTomb.GUI.drawGlyph(x,y,ch,fg);
    }
    // clean up expired particles
    for (var o in oldSquares) {
      c = HTomb.Utils.decoord(o);
      x = c[0];
      y = c[1];
      HTomb.GUI.refreshTile(x,y);
    }
    oldSquares = squares;
  };

  HTomb.GUI.selectBox = function(width, height, z, callb, options) {
    options = options || {};
    HTomb.GUI.pushMessage("Select a square.");
    var context = Object.create(survey);
    context.menuText = ["Use movement keys to navigate.","Comma go down.","Period to go up.","Escape to exit."];
    context.mouseTile = function(x0,y0) {
      var bg = options.bg || "#550000";
      gameScreen.render();
      var squares = [];
      for (var x=0; x<width; x++) {
        for (var y=0; y<height; y++) {
          squares.push([x0+x,y0+y,gameScreen.z]);
        }
      }
      for (var k =0; k<squares.length; k++) {
        var coord = squares[k];
        GUI.highlightTile(coord[0],coord[1],bg);
      }
      var txt = examineSquare(x0,y0,gameScreen.z);
      var myText = HTomb.Controls.context.menuText;
      GUI.displayMenu(myText.concat(" ").concat(txt));
    };
    HTomb.Controls.context = context;
    if (options.message) {
      context.menuText.unshift("");
      context.menuText.unshift(options.message);
    }
    GUI.updateMenu();
    survey.saveX = gameScreen.xoffset;
    survey.saveY = gameScreen.yoffset;
    survey.saveZ = gameScreen.z;
    context.clickTile = function(x0,y0) {
      var squares = [];
      for (var y=0; y<height; y++) {
        for (var x=0; x<width; x++) {
          squares.push([x0+x,y0+y,gameScreen.z]);
        }
      }
      callb(squares,options);
      GUI.reset();
    };
  };

  return HTomb;
})(HTomb);
