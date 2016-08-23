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
  var Commands = HTomb.Commands;

  var Controls = HTomb.Controls;
  Controls.contexts = {};

  GUI.getDefaultText = function() {
    if (HTomb.Debug.tutorial.active!==true) {
      return defaultText;
    } else {
      let tutorialText = GUI.panels.menu.defaultText.concat([" ","TUTORIAL:",HTomb.Debug.tutorial.getText()]);
      return tutorialText;
    }
  }

  GUI.updateMenu = function() {
    GUI.displayMenu(GUI.panels.menu.menuText || GUI.getDefaultText());
  };

  GUI.examineSquare = function(x,y,z) {
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
  };


  // Survey mode lets to scan the play area independently from the player's position
  GUI.surveyMode = function() {
    Controls.context = survey;
    var gameScreen = GUI.panels.gameScreen;
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
  var main = new Controls.newContext({
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
    VK_BACK_QUOTE: function() {Controls.summaryView();},
    VK_ESCAPE: function() {Controls.systemView();},
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
    if (x===p.x && y===p.y && GUI.panels.gameScreen.z===p.z) {
      summaryView();
      return;
    }
    let f = HTomb.World.features[coord(x,y,GUI.panels.gameScreen.z)];
    if (f && f.workshop && f.workshop.active && HTomb.World.creatures[coord(x,y,GUI.panels.gameScreen.z)]===undefined) {
      Controls.workshopView(f.workshop);
      return;
    }
    Controls.detailsView(x,y,GUI.panels.gameScreen.z);
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
    GUI.displayMenu(GUI.getDefaultText());
    GUI.panels.gameScreen.render();
  };

  var surveyMove = Controls.surveyMove = function(dx,dy,dz) {
    var f = function() {
      let gameScreen = GUI.panels.gameScreen;
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

  var survey = Controls.contexts.survey = new Controls.newContext({
    VK_LEFT: Controls.surveyMove(-1,0,0),
    VK_RIGHT: Controls.surveyMove(+1,0,0),
    VK_UP: Controls.surveyMove(0,-1,0),
    VK_DOWN: Controls.surveyMove(0,+1,0),
    // bind keyboard movement
    VK_PERIOD: Controls.surveyMove(0,0,-1),
    VK_COMMA: Controls.surveyMove(0,0,+1),
    VK_NUMPAD7: Controls.surveyMove(-1,-1,0),
    VK_NUMPAD8: Controls.surveyMove(0,-1,0),
    VK_NUMPAD9: Controls.surveyMove(+1,-1,0),
    VK_NUMPAD4: Controls.surveyMove(-1,0,0),
    VK_NUMPAD6: Controls.surveyMove(+1,0,0),
    VK_NUMPAD1: Controls.surveyMove(-1,+1,0),
    VK_NUMPAD2: Controls.surveyMove(0,+1,0),
    VK_NUMPAD3: Controls.surveyMove(+1,+1,0),
    // Exit survey mode and return to the original position
    VK_ESCAPE: function() {
      //gameScreen.xoffset = survey.saveX;
      //gameScreen.yoffset = survey.saveY;
      GUI.panels.gameScreen.z = survey.saveZ;
      GUI.recenter();
      GUI.reset();
    }
  });


  survey.menuText = ["You are now in survey mode.","Use movement keys to navigate.","Comma go down.","Period to go up.","Escape to exit."];
  survey.clickTile = main.clickTile;
  survey.rightClickTile = main.rightClickTile;
  // Recenter the game screen on the player
  GUI.recenter = function() {
    var Player = HTomb.Player;
    GUI.panels.gameScreen.z = Player.z;
    if (Player.x >= GUI.panels.gameScreen.xoffset+SCREENW-2) {
      GUI.panels.gameScreen.xoffset = Player.x-SCREENW+2;
    } else if (Player.x <= GUI.panels.gameScreen.xoffset) {
      GUI.panels.gameScreen.xoffset = Player.x-1;
    }
    if (Player.y >= GUI.panels.gameScreen.yoffset+SCREENH-2) {
      GUI.panels.gameScreen.yoffset = Player.y-SCREENH+2;
    } else if (Player.y <= GUI.panels.gameScreen.yoffset) {
      GUI.panels.gameScreen.yoffset = Player.y-1;
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
    GUI.panels.gameScreen.xoffset = x;
    GUI.panels.gameScreen.yoffset = y;
  };

  HTomb.GUI.selectBox = function(width, height, z, callb, options) {
    options = options || {};
    var gameScreen = GUI.panels.gameScreen;
    HTomb.GUI.pushMessage("Select a square.");
    var context = Object.create(survey);
    context.menuText = ["Use movement keys to navigate.","Comma go down.","Period to go up.","Escape to exit."];
    context.mouseTile = function(x0,y0) {
      var bg = options.bg || "#550000";
      GUI.panels.gameScreen.render();
      var squares = [];
      for (var x=0; x<width; x++) {
        for (var y=0; y<height; y++) {
          squares.push([x0+x,y0+y,GUI.panels.gameScreen.z]);
        }
      }
      for (var k =0; k<squares.length; k++) {
        var coord = squares[k];
        GUI.highlightTile(coord[0],coord[1],bg);
      }
      var txt = GUI.examineSquare(x0,y0,gameScreen.z);
      var myText = HTomb.Controls.context.menuText;
      GUI.displayMenu(myText.concat(" ").concat(txt));
    };
    HTomb.Controls.context = context;
    if (options.message) {
      context.menuText.unshift("");
      context.menuText.unshift(options.message);
    }
    GUI.updateMenu();
    survey.saveX = GUI.panels.gameScreen.xoffset;
    survey.saveY = GUI.panels.gameScreen.yoffset;
    survey.saveZ = GUI.panels.gameScreen.z;
    context.clickTile = function(x0,y0) {
      var squares = [];
      for (var y=0; y<height; y++) {
        for (var x=0; x<width; x++) {
          squares.push([x0+x,y0+y,GUI.panels.gameScreen.z]);
        }
      }
      callb(squares,options);
      GUI.reset();
    };
  };

  GUI.pickDirection = function(callb) {
    function actToward(dx,dy,dz) {
      return function() {
        var x = HTomb.Player.x+dx;
        var y = HTomb.Player.y+dy;
        var z = HTomb.Player.z+dz;
        callb(x,y,z);
        HTomb.GUI.reset();
      };
    }
    var context = new Controls.newContext({
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
  GUI.selectSquareZone = function(z, callb, options) {
    var gameScreen = GUI.panels.gameScreen;
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
    survey.saveX = GUI.panels.gameScreen.xoffset;
    survey.saveY = GUI.panels.gameScreen.yoffset;
    survey.saveZ = GUI.panels.gameScreen.z;
    context.clickTile = function (x,y) {
      HTomb.GUI.pushMessage("Select the second corner.");
      var context2 = new Controls.newContext({VK_ESCAPE: GUI.reset});
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
                squares.push([xs[x],ys[y],GUI.panels.gameScreen.z]);
              }
            } else {
              squares.push([xs[x],ys[y],GUI.panels.gameScreen.z]);
            }
          }
        }
        for (var k =0; k<squares.length; k++) {
          var coord = squares[k];
          GUI.highlightTile(coord[0],coord[1],bg);
        }
        var txt = GUI.examineSquare(x1,y1,GUI.panels.gameScreen.z);
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
                squares.push([xs[x],ys[y],GUI.panels.gameScreen.z]);
              }
            } else {
              squares.push([xs[x],ys[y],GUI.panels.gameScreen.z]);
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
    Controls.context = new Controls.newContext(contrls);
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
    survey.saveX = GUI.panels.gameScreen.xoffset;
    survey.saveY = GUI.panels.gameScreen.yoffset;
    survey.saveZ = GUI.panels.gameScreen.z;
    context.clickTile = function(x,y) {
      callb(x,y,GUI.panels.gameScreen.z,options);
      GUI.reset();
    };
    if (options.line!==undefined) {
      var x0 = options.line.x || HTomb.Player.x;
      var y0 = options.line.y || HTomb.Player.y;
      var bg = options.line.bg || "#550000";
      context.mouseTile = function(x,y) {
        GUI.panels.gameScreen.render();
        var line = HTomb.Path.line(x0,y0,x,y);
        for (var i in line) {
          var sq = line[i];
          HTomb.GUI.highlightSquare(sq[0],sq[1],bg);
        }
        var txt = GUI.examineSquare(x1,y1,GUI.panels.gameScreen.z);
        var myText = HTomb.Controls.context.menuText;
        GUI.displayMenu(myText.concat(" ").concat(txt));
      };
    }
  };


  HTomb.Controls.contexts.main = main;

  return HTomb;
})(HTomb);
