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

  // set up GUI and display
  var GUI = HTomb.GUI;
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
    }
  };
  // Display a splash screen
  GUI.splash = function(txt) {
    Controls.context = new ControlContext();
    var splash = new Panel(0,0);
    splash.render = function() {
      for (var i=0; i<SCREENH+SCROLLH; i++) {
        display.drawText(this.x0,this.y0+i,"%c{black}"+(UNIBLOCK.repeat(SCREENW+MENUW+1)));
      }
      display.drawText(splash.x0+3,splash.y0+2, txt);
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
      overlay: null
    };
    Controls.context = main;
    GUI.updateMenu();
    GUI.recenter();
    GUI.render();
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

  return HTomb;
})(HTomb);
