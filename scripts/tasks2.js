HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;

  // Define a generic task that gets workers assigned
  HTomb.Things.define({
    template: "Task",
    name: "task",
    parent: "Thing",
    assigner: null,
    assignee: null,
    zone: null,
    zoneTemplate: null,
    each: ["assigner","assignee","zone"],
    onDefine: function() {
      if (this.zone) {
        var z = this.zoneTemplate;
        z.isZone = true;
        // is this how we define an entity?
        HTomb.Things.define(z);
      }
    },
    tryAssign: function(cr) {
      HTomb.Debug.pushMessage("Probably shouldn't use default tryAssign()");
      this.assignTo(cr);
      return true;
    },
    // one of the more common ways to test if a task can be assigned
    canReachZone: function(cr) {
      var zone = this.zone;
      var path = HTomb.Path.aStar(zone.x,zone.y,zone.z,cr.x,cr.y,cr.z);
      if (path!==false) {
        return true;
      } else {
        return false;
      }
    },
    assignTo: function(cr) {
      if (cr.minion===undefined) {
        HTomb.Debug.pushMessage("Problem assigning task");
      } else {
        this.assignee = cr;
        cr.minion.onAssign(this);
      }
    },
    unassign: function() {
      var cr = this.assignedTo;
      if (cr.minion===undefined) {
        HTomb.Debug.pushMessage("Problem unassigning task");
      } else {
        this.assignedTo = null;
        cr.minion.unassign();
      }
    },
    // one common way of designating tasks
    designateSquare: function(options) {
      options = options || {};
      options.master = options.master || HTomb.Player;
      var _z = options.master.z;
      var createZone = function(x,y,z) {
        var zone = HTomb.Things.create(this.zoneTemplate.template);
        zone.place(x,y,z);
        var t = HTomb.Things[this.template]();
        zone.task = t;
        t.zone = zone;
        t.master = options.master;
        options.master.master.taskList.push(t);
        HTomb.GUI.reset();
      };
      HTomb.GUI.selectSquare(_z,createZone);
    },
    // one common way of designating tasks
    designateSquares: function(options) {
      options = options || {};
      options.master = options.master || HTomb.Player;
      options.outline = options.outline || false;
      options.okayTiles = options.okayTiles ||[HTomb.Tiles.FloorTile];
      var taskSquares = function(squares) {
        for (var i=0; i<squares.length; i++) {
          var crd = squares[i];
          if (options.okayTiles.indexOf(HTomb.World.tiles[crd[2]][crd[0]][crd[1]])===-1) {
            continue;
          }
          var z = HTomb.Things.create(this.zoneTemplate.template);
          z.place(crd[0],crd[1],crd[2]);
          var t = HTomb.Things[this.template]();
          z.task = t;
          t.zone = z;
          t.master = options.master;
          options.master.master.taskList.push(t);
        }
        HTomb.GUI.reset();
      };
      HTomb.GUI.selectSquareZone(options.master.z,digSquares,{outline: options.outline, bg: this.zoneTemplate.bg});
    }
  });


  return HTomb;
})(HTomb);
