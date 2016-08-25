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

  let Panels = GUI.Panels;
  let gameScreen = Panels.gameScreen;
  let menu = Panels.menu;
  let scroll = Panels.scroll;
  let status = Panels.status;
  let overlay = Panels.overlay;

  // Basic rendering of panels
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
    Main.renderParticles();
  };
  var oldSquares;
  Main.renderParticles = function() {
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
      Main.drawGlyph(x,y,ch,fg);
    }
    // clean up expired particles
    for (var o in oldSquares) {
      c = HTomb.Utils.decoord(o);
      x = c[0];
      y = c[1];
      Main.refreshTile(x,y);
    }
    oldSquares = squares;
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
  scroll.buffer = [];
  scroll.render = function() {
    for (var s=0; s<this.buffer.length; s++) {
      //black out the entire line with solid blocks
      scrollDisplay.drawText(this.x0,this.y0+s+1,"%c{black}"+(UNIBLOCK.repeat(SCREENW+MENUW-2)));
      scrollDisplay.drawText(this.x0,this.y0+s+1,this.buffer[s]);
    }
  };
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

  let Display = GUI.Display = {};

  GUI.reset = function() {
    if (overlay.active) {
      overlay.hide();
    }
    GUI.Contexts.active = GUI.Contexts.main;
    // This shoudl probably be handled a bit differently?
    GUI.updateMenu(); // menu.refresh();
    GUI.recenter(); // gameScreen.recenter();
    GUI.render(); // Actions.render();
  };
  // This should probably be an Event, not a GUI method
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

  // Render all four default panels
  Display.render = function() {
    gameScreen.render();
    status.render();
    scroll.render();
    menu.render();
  };


  Main.getDefaultText = function() { // Not sure yet what to do here
    if (HTomb.Debug.tutorial.active!==true) {
      return defaultText;
    } else {
      let tutorialText = defaultText.concat([" ","TUTORIAL:",HTomb.Debug.tutorial.getText()]);
      return tutorialText;
    }
  }
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
  //******end defaults


  // *** Drawing on the game screen *****
  Main.refreshTile = function(x,y) {
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
  Main.drawTile = function(x,y,ch,fg,bg) {
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

  Main.drawGlyph = function(x,y,ch,fg) {
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
  Main.highlightTile = function(x,y,bg) {
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

  return HTomb;
})(HTomb);
