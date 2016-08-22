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

  function systemView() {
    HTomb.Controls.context = system;
    // it would be nice if "static menu" were a thing
    updateOverlay([
      "Esc) Back to game.",
      "S) Save game.",
      "A) Save game as...",
      "R) Restore game.",
      "Q) Quit game."
    ]);
  }
  function saveCommand() {

  }
  function saveAsCommand() {

  }
  function restoreCommand() {

  }
  function quitCommand() {
    console.log("testing");
    updateOverlay([
      "Really quit?",
      "Y) Yes.",
      "N) No."
    ]);
    HTomb.Controls.context = new ControlContext({
      VK_ESCAPE: HTomb.GUI.reset,
      VK_Y: function() {close();},
      VK_N: systemView
    });
  }
  var system = new ControlContext({
    VK_ESCAPE: HTomb.GUI.reset,
    VK_S: saveCommand,
    VK_A: saveAsCommand,
    VK_R: restoreCommand,
    VK_Q: quitCommand
  });

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
    VK_BACK_SPACE: cancelGood,
    VK_DELETE: cancelGood
  });

  function cancelGood() {
    let i = workQueueCursor;
    let w = currentWorkshop;
    if (i===-1 && w.task) {
      w.task.cancel();
      w.nextGood();
    } else if (w.queue.length>0 && i>=0) {
      w.queue.splice(i,1);
      if (workQueueCursor>=w.queue.length) {
        workQueueCursor = w.queue.length-1;
      }
    }
    updateOverlay(workshopDetails(w));
  }

  function workQueueDown() {
    workQueueCursor+=1;
    //if (workQueueCursor>currentWorkshop.queue.length-1) {
    if (workQueueCursor>=currentWorkshop.queue.length) {
      workQueueCursor = -1;
    }
    console.log(workQueueCursor);
    updateOverlay(workshopDetails(currentWorkshop));
  }
  function workQueueUp() {
    workQueueCursor-=1;
    if (workQueueCursor<-1) {
      //workQueueCursor = currentWorkshop.queue.length-1;
      workQueueCursor = currentWorkshop.queue.length-1;
    }
    console.log(workQueueCursor);
    updateOverlay(workshopDetails(currentWorkshop));
  }
  function workQueueRight() {
    let i = workQueueCursor;
    let w = currentWorkshop;
    if (i===-1 || w.queue.length===0) {
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
    if (i===-1 || w.queue.length===0) {
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
    if (i===-1 || w.queue.length===0) {
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
    if (i===-1 || w.queue.length===0) {
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
      if (i>=w.makes.length) {
        delete workshops.boundKeys["VK_"+alphabet[i]];
      }
      else {
        bindKey(workshops,"VK_"+alphabet[i],function() {
          let good = w.makes[i];
          w.queue.splice(workQueueCursor+1,0,[good,"finite",1]);
          if (w.task===null) {
            w.nextGood();
          }
          if (workQueueCursor<w.queue.length-1) {
            workQueueCursor+=1;
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
      "a-z to insert good into queue.",
      "Backspace or Delete to cancel good or remove from queue.",
      "PageUp/PageDown to change workshops, Tab to see minions, Esc to exit.",
      w.describe() + " at " + w.x + ", " + w.y + ", " + w.z
    ];
    txt.push(" ");
    if (w.makes && w.makes.length>0) {
      txt.push("Products:");
      let alphabet = 'abcdefghijklmnopqrstuvwxyz';
      for (let i=0; i<w.makes.length; i++) {
        let t = HTomb.Things.templates[w.makes[i]];
        txt.push(alphabet[i] + ") " + t.describe());
      }
      txt.push(" ");
    }
    txt.push("Production Queue:");
    let q = w.formattedQueue();
    if (workQueueCursor>=w.queue.length) {
      workQueueCursor = w.queue.length-1;
    }
    if (q.length>1 && workQueueCursor>-1) {
      let s = q[workQueueCursor+1];
      s = "*" + s.substr(1);
      q[workQueueCursor+1] = s;
    } else {
      let s = q[0];
      s = "*" + s.substr(1);
      q[0] = s;
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

  return HTomb;
})(HTomb);
