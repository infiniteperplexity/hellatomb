// The ridiculously huge GUI submodule contains all the display and input functions
// There must be some logical way to split this without exposing too many properties...
HTomb = (function(HTomb) {
  "use strict";
  // break out constants
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

  // set up GUI and display
  var GUI = HTomb.GUI;

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

  // The main game screen where you see tiles
  var gameScreen = GUI.panels.gameScreen = {};
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
  // set up message buffer
  GUI.sensoryEvent = function(strng,x,y,z) {
    if (HTomb.World.visible[z][x][y]) {
      GUI.pushMessage(strng);
    }
  };
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
  // Show status, currently including hit points and coordinates
  var status = {};
  status.render = function() {
    var x0 = 1;
    var y0 = 1;
    //black out the entire line with solid blocks
    var cursor = 0;
    scrollDisplay.drawText(x0+cursor,y0,"%c{black}"+(UNIBLOCK.repeat(SCROLLW-2)));
    scrollDisplay.drawText(x0+cursor,y0,"HP:" + 5 + "/" + 5);
    cursor+=9;
    scrollDisplay.drawText(x0+cursor,y0,"X:" + HTomb.Player.x);
    cursor+=6;
    scrollDisplay.drawText(x0+cursor,y0,"Y:" + HTomb.Player.y);
    cursor+=6;
    scrollDisplay.drawText(x0+cursor,y0,"Z:" + gameScreen.z);
    cursor+=6;
    scrollDisplay.drawText(x0+cursor,y0+1,
      HTomb.World.dailyCycle.getPhase().symbol + " "
      + HTomb.World.dailyCycle.day + ":"
      + HTomb.World.dailyCycle.hour + ":"
      + HTomb.World.dailyCycle.minute);
  };
  // Show messages
  GUI.panels.scroll = {};
  scroll.buffer = [];
  scroll.render = function() {
    var x0 = 1;
    var y0 = STATUSH;
    for (var s=0; s<this.buffer.length; s++) {
      //black out the entire line with solid blocks
      scrollDisplay.drawText(x0,y0+s+1,"%c{black}"+(UNIBLOCK.repeat(SCROLLW-2)));
      scrollDisplay.drawText(x0,y0+s+1,this.buffer[s]);
    }
  };
  // Provide the player with instructions
  GUI.panels.menu = {};
  menu.defaultText = [
    "Use numpad or arrows to move, shift+arrows to move diagonally, J to assign a job, A to act or apply, "+
    "Z to cast a spell, space to wait, or tab to enter survey mode.",
    "Hover mouse to examine a square."
  ];
  menu.render = function() {
    var x0 = 0;
    var y0 = 1;
    for (var i=0; i<MENUH; i++) {
      menuDisplay.drawText(x0, y0+i, "%c{black}"+(UNIBLOCK.repeat(MENUW-2)));
      if (menu.text[i]) {
        menuDisplay.drawText(x0, y0+i, menu.text[i]);
      }
    }
  };

  GUI.updateMenu = function() {
    GUI.displayMenu(Controls.context.menuText || GUI.panels.menu.defaultText);
  };

  function examineSquare(x,y,z) {
    var square = HTomb.Tiles.getSquare(x,y,z);
    var below = HTomb.Tiles.getSquare(x,y,z-1);
    var above = HTomb.Tiles.getSquare(x,y,z+1);
    var text = ["Coord: " + square.x +"," + square.y + "," + square.z];
    var next;
    if(square.explored) {
      next = "Terrain: "+square.terrain.name;
      text.push(next);
      next = "Creature: ";
      if (square.creature && square.visible) {
        next+=square.creature.describe();
        text.push(next);
      }
      next = "Items: ";
      if (square.items && square.visible) {
        next+=GUI.listItems(square.items);
      }
      text.push(next);
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
      next = "Liquid: ";
      if (square.liquid) {
        next+=square.liquid.describe();
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
        next+=GUI.listItems(above.items);
      }
      text.push(next);
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
      next = "Liquid: ";
      if (above.liquid) {
        next+=above.liquid.describe();
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
        next+=GUI.listItems(below.items);
      }
      text.push(next);
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
      next = "Liquid: ";
      if (below.liquid) {
        next+=below.liquid.describe();
      }
      text.push(next);
    }
    return text;
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
    GUI.panels.menu.text = arr;
    GUI.panels.menu.render();
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
    Controls.context.menuText = choices;
    GUI.updateMenu();
  };

  return HTomb;
})(HTomb);
