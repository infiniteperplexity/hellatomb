// The lowest-level GUI functionality, interacting with the DOM directly or through ROT.js.
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

  // **************** GUI Panels ******************
  // Each panel knows where it belongs on the screen
  function Panel(leftx,topy) {
    this.x0 = leftx;
    this.y0 = topy;
  }
  Panel.prototype.render = function() {};
  GUI.panels = {};
  // The main game screen where you see tiles
  var gameScreen = GUI.panels.gameScreen = new Panel(0,0);
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
  var status = GUI.panels.status = new Panel(1,0);
  GUI.renderStatus = function() {
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
  var scroll = GUI.panels.scroll = new Panel(1,STATUSH);
  scroll.buffer = [];
  scroll.render = function() {
    for (var s=0; s<this.buffer.length; s++) {
      //black out the entire line with solid blocks
      scrollDisplay.drawText(this.x0,this.y0+s+1,"%c{black}"+(UNIBLOCK.repeat(SCREENW+MENUW-2)));
      scrollDisplay.drawText(this.x0,this.y0+s+1,this.buffer[s]);
    }
  };
  // Provide the player with instructions
  var menu = GUI.panels.menu = new Panel(0,1);
  menu.defaultText = [
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
  Controls.newContext = ControlContext;
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
    var txt = examineSquare(x,y,z); /// This seems broken!!!
    var myText = this.menuText || getDefaultText(); /// This seems broken!!!
    GUI.displayMenu(myText.concat(" ").concat(txt));
  };

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

  return HTomb;
})(HTomb);
