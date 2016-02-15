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
  var display = new ROT.Display({width: SCREENW+MENUW, height: SCREENH+STATUSH+SCROLLH, fontSize: FONTSIZE, fontFamily: "Century wewGothic MS"});
  document.body.appendChild(display.getContainer());
  // Attach input events

  // Render display panels
  GUI.render = function() {
    // Draw all the panels
    GUI.panels.main.render();
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
  // Reset the GUI
  GUI.reset = function() {

    GUI.panels = {
      main: gameScreen
    };

    //Controls.context = main;
    //GUI.recenter();
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
        // Draw every symbol in the right place
        var sym = HTomb.Tiles.getSymbol(x,y,z);
        display.draw(this.x0+x-xoffset,this.y0+y-yoffset, sym[0], sym[1], sym[2]);
      }
    }
  };
  // Show status, currently including hit points and coordinates
  var status = new Panel(1,SCREENH);
  status.render = function() {
  };
  // Show messages
  var scroll = new Panel(1,SCREENH+STATUSH);
  scroll.buffer = [];
  scroll.render = function() {
  };
  // Provide the player with instructions
  var menu = new Panel(SCREENW+1,1);
  menu.render = function() {
  };
  // Show properties of the tile the mouse is hovering over
  var hover = new Panel(SCREENW+1,SCREENH+1);
  hover.render = function() {
  };

  return HTomb;
})(HTomb);
