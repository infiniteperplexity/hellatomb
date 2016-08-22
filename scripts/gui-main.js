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
    VK_TILDE: summaryView,
    VK_ESCAPE: systemView,
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

  return HTomb;
})(HTomb);
