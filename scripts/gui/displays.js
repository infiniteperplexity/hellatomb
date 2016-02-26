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
  GUI.panels = {};
  var Controls = HTomb.Controls;
  var Commands = HTomb.Commands;
  GUI.panels.display = new ROT.Display({
    width: SCREENW,
    height: SCREENH,
    fontSize: FONTSIZE,
    fontFamily: FONTFAMILY
  });
  GUI.panels.scrollDisplay = new ROT.Display({
    width: SCROLLW,
    height: STATUSH+SCROLLH,
    fontSize: TEXTSIZE,
    fontFamily: TEXTFONT,
    spacing: TEXTSPACING
  });
  GUI.panels.menuDisplay = new ROT.Display({
    width: MENUW,
    height: MENUH,
    fontSize: TEXTSIZE,
    fontFamily: TEXTFONT,
    spacing: TEXTSPACING
  });
  GUI.domInit = function() {
    var body = document.body;
    var div = document.createElement("div");
    div.id = "main";
    var contain = document.createElement("div");
    contain.id = "contain";
    var game = document.createElement("div");
    game.id = "game";
    var menu = document.createElement("div");
    menu.id = "menu";
    var scroll = document.createElement("div");
    scroll.id = "scroll";
    body.appendChild(div);
    div.appendChild(contain);
    div.appendChild(menu);
    contain.appendChild(game);
    contain.appendChild(document.createElement("br"));
    contain.appendChild(scroll);
    game.appendChild(display.getContainer());
    menu.appendChild(menuDisplay.getContainer());
    scroll.appendChild(scrollDisplay.getContainer());
  };
  
  return HTomb;
})(HTomb);
