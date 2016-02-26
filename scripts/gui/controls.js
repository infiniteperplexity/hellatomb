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
  var Controls = HTomb.Controls;
  var Commands = HTomb.Commands;

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
    // Convert X and Y from pixels to characters
    var x = Math.floor((click.clientX+XSKEW)/CHARWIDTH-1);
    var y = Math.floor((click.clientY+YSKEW)/CHARHEIGHT-1);
    // If the click is not on the game screen, pass the actual X and Y positions
    if (GUI.panels.overlay!==null || x>=SCREENW || y>=SCREENH) {
      Controls.context.clickAt(x,y);
    // If the click is on the game screen, pass the X and Y tile coordinates
    } else {
      Controls.context.clickTile(x+gameScreen.xoffset,y+gameScreen.yoffset);
    }
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
    GUI.splash("Detailed viewing not yet implemented");
  }
  main.mouseOver = function() {
    if (GUI.panels.overlay===null) {
      // The main control context always wants to show the instructions
      GUI.displayMenu(defaultText);
      gameScreen.render();
    }
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

  return HTomb;
})(HTomb);
