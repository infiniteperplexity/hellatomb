HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.Utils.coord;
  // should we maybe allow a queue of zones???  probably not
  HTomb.Things.define({
    template: "Task",
    name: "task",
    parent: "Thing",
    assigner: null,
    assignee: null,
    zone: null,
    zoneTemplate: null,
    incompleteFeature: null,
    featureTemplate: null,
    clearsFeature: false,
    each: ["assigner","assignee","zone","feature"],
    ingredients: {},
    // note that this passes the behavior, not the entity
    canReachZone: function(cr) {
      var x = this.zone.x;
      var y = this.zone.y;
      var z = this.zone.z;
      var path = HTomb.Path.aStar(x,y,z,cr.x,cr.y,cr.z,{useLast: false});
      if (path!==false) {
        return true;
      } else if (z===cr.z && HTomb.Path.distance(cr.x,cr.y,x,y)<=1) {
        return true;
        // does touchability work consistently?
      } else if (HTomb.Tiles.isTouchableFrom(x,y,z,cr.x,cr.y,cr.z)) {
        return true;
      } else {
        return false;
      }
    },
    designate: function(assigner) {
      HTomb.GUI.selectSquareZone(assigner.z,this.designateSquares,{
        context: this,
        assigner: assigner,
        callback: this.placeZone,
        outline: false,
        bg: this.zoneTemplate.bg
      });
    },
    designateSquare: function(x,y,z, options) {
      options = options || {};
      var assigner = options.assigner;
      var callb = options.callback;
      callb.call(options.context,x,y,z,assigner);
    },
    designateSquares: function(squares, options) {
      options = options || {};
      var assigner = options.assigner;
      var callb = options.callback;
      for (var i=0; i<squares.length; i++) {
        var crd = squares[i];
        callb.call(options.context,crd[0],crd[1],crd[2],assigner);
      }
    },
    placeZone: function(x,y,z,assigner) {
      var zone, t;
      if (this.canDesignateTile(x,y,z) || HTomb.World.explored[z][x][y]!==true) {
        zone = HTomb.Things[this.zoneTemplate.template]();
        zone.place(x,y,z);
        t = HTomb.Things[this.template]();
        zone.task = t;
        zone.assigner = assigner;
        t.zone = zone;
        t.assigner = assigner;
        if (assigner.master) {
          assigner.master.taskList.push(t);
        }
      }
      return zone;
    },
    onCreate: function() {
      HTomb.Events.subscribe(this,"Destroy");
    },
    onDefine: function() {
      if (this.zoneTemplate) {
        HTomb.Things.defineZone(this.zoneTemplate);
      }
    },
    tryAssign: function(cr) {
      if (this.canReachZone(cr)) {
        this.assignTo(cr);
        return true;
      } else {
        return false;
      }
    },
    canDesignateTile: function(x,y,z) {
      return true;
    },
    checkAssignment: function(x,y,z) {
      if (this.canDesignateTile(x,y,z)===false) {
        HTomb.World.explored[z][x][y] = true;
        HTomb.GUI.pushMessage("Designation invalid");
        this.cancel();
        return false;
      }
      return true;
    },
    assignTo: function(cr) {
      if (cr.minion===undefined) {
        HTomb.Debug.pushMessage("Problem assigning task");
      } else {
        this.assignee = cr;
        cr.worker.onAssign(this);
      }
    },
    onDestroy: function(event) {
      var cr = event.entity;
      if (cr===this.assignee) {
        this.unassign();
      } else if (cr===this.assigner) {
        this.cancel();
      }
    },
    unassign: function() {
      var cr = this.assignee;
      if (cr.worker===undefined) {
        HTomb.Debug.pushMessage("Problem unassigning task");
      } else {
        this.assignee = null;
        cr.worker.unassign();
      }
    },
    cancel: function() {
      var master = this.assigner;
      if (master) {
        var taskList = this.assigner.master.taskList;
        if (taskList.indexOf(this)!==-1) {
          taskList.splice(taskList.indexOf(this),1);
        }
      }
      if (this.assignee) {
        this.assignee.worker.unassign();
      }
      if (this.zone) {
        //prevent recursion traps
        var z = this.zone;
        this.zone = null;
        z.remove();
        HTomb.Events.unsubscribeAll(z);
      }
      HTomb.Events.unsubscribeAll(this);
    },
    complete: function() {
      // this generally should not get overridden
      var master = this.assigner;
      if (master) {
        var taskList = this.assigner.master.taskList;
        if (taskList.indexOf(this)!==-1) {
          taskList.splice(taskList.indexOf(this),1);
        }
      }
      if (this.assignee) {
        this.assignee.worker.unassign();
      }
      if (this.zone) {
        this.zone.remove();
      }
      if (this.onComplete) {
        this.onComplete();
      }
    },
    ai: function() {
      if (this.assignee.ai.acted===true) {
        return;
      }
      this.assignee.worker.requires(this.ingredients);
      if (this.assignee.ai.acted===true) {
        return;
      }
      this.assignee.worker.gotoWork();
    },
    work: function(x,y,z) {
      if (this.checkAssignment===false) {
        return;
      }
      this.assignee.worker.construct(x,y,z);
    },
    finish: function() {
      // used the default finish method
      HTomb.Debug.pushMessage("Maybe don't use default finish method");
    }
  });

  HTomb.Things.defineTask({
    template: "DigTask",
    name: "dig",
    zoneTemplate: {
      template: "DigZone",
      name: "dig",
      bg: "#884400"
    },
    featureTemplate: {
      name: "incomplete excavation",
      //symbol: "\u2022",
      symbol: "\u2717",
      steps: 5,
      fg: HTomb.Constants.BELOW
    },
    canDesignateTile: function(x,y,z) {
      var t = HTomb.World.tiles[z][x][y];
      var tb = HTomb.World.tiles[z-1][x][y];
      if (t===HTomb.Tiles.VoidTile) {
        return false;
      } else if (HTomb.World.features[coord(x,y,z)] && HTomb.World.features[coord(x,y,z)].owned!==false) {
        return false;
      } else if (t===HTomb.Tiles.FloorTile && tb===HTomb.Tiles.VoidTile) {
        return false;
      } else if (t===HTomb.Tiles.EmptyTile && (tb===HTomb.Tiles.EmptyTile || tb===HTomb.Tiles.FloorTile)) {
        return false;
      }
      return true;
    },
    finish: function(f) {
      var tiles = HTomb.World.tiles;
      var EmptyTile = HTomb.Tiles.EmptyTile;
      var FloorTile = HTomb.Tiles.FloorTile;
      var WallTile = HTomb.Tiles.WallTile;
      var UpSlopeTile = HTomb.Tiles.UpSlopeTile;
      var DownSlopeTile = HTomb.Tiles.DownSlopeTile;
      var x = f.x;
      var y = f.y;
      var z = f.z;
      var t = tiles[z][x][y];
      // If there is a slope below, dig out the floor
      if (tiles[z-1][x][y]===UpSlopeTile && HTomb.World.explored[z-1][x][y] && (t===WallTile || t===FloorTile)) {
        tiles[z][x][y] = DownSlopeTile;
      // If it's a wall, dig a tunnel
      } else if (t===WallTile) {
        tiles[z][x][y] = FloorTile;
      } else if (t===FloorTile) {
        // If it's a floor with a wall underneath dig a trench
        if (tiles[z-1][x][y]===WallTile) {
          tiles[z][x][y] = DownSlopeTile;
          tiles[z-1][x][y] = UpSlopeTile;
        // Otherwise just remove the floor
        } else {
          tiles[z][x][y] = EmptyTile;
        }
      // If it's a down slope tile, remove the slopes
      } else if (t===DownSlopeTile) {
        tiles[z][x][y] = EmptyTile;
        tiles[z-1][x][y] = FloorTile;
      // if it's an upward slope, remove the slope
      } else if (t===UpSlopeTile) {
        tiles[z][x][y] = FloorTile;
        if (tiles[z+1][x][y]===DownSlopeTile) {
          tiles[z+1][x][y] = EmptyTile;
        }
      } else if (t===EmptyTile) {
        tiles[z-1][x][y] = FloorTile;
      }
      if(HTomb.World.turfs[coord(x,y,z)]) {
        HTomb.World.turfs[coord(x,y,z)].destroy();
      }
      if (Math.random()<0.25) {
        var rock = HTomb.Things.Rock();
        rock.item.n = 1;
        rock.place(x,y,z);
      }
      f.remove();
      HTomb.World.validate.cleanNeighbors(x,y,z);
      this.complete();
    },
    work: function(x,y,z) {
      if (this.checkAssignment===false) {
        return;
      }
      var f = HTomb.World.features[coord(x,y,z)];
      if (f && f.template==="Tombstone") {
        if (f.steps===undefined) {
          f.steps=10;
        }
        f.steps-=1;
        if (f.steps===0) {
          f.explode();
          HTomb.World.tiles[z][x][y] = HTomb.Tiles.DownSlopeTile;
          this.complete();
          HTomb.World.validate.cleanNeighbors(x,y,z);
        }
      } else {
        this.assignee.worker.construct(x,y,z);
      }
    }
  });

  HTomb.Things.defineTask({
    template: "BuildTask",
    name: "build",
    zoneTemplate: {
      template: "BuildZone",
      name: "build",
      //magenta
      bg: "#440088"
    },
    featureTemplate: {
      name: "incomplete construction",
      symbol: "\u2692",
      fg: HTomb.Constants.ABOVE,
      steps: 5
    },
    ingredients: {Rock: 1},
    canDesignateTile: function(x,y,z) {
      //shouldn't be able to build surrounded by emptiness
      var t = HTomb.World.tiles[z][x][y];
      if (t===HTomb.Tiles.VoidTile || t===HTomb.Tiles.WallTile) {
        return false;
      } else if (HTomb.World.features[coord(x,y,z)] && HTomb.World.features[coord(x,y,z)].owned!==false) {
        return false;
      } else {
        return true;
      }
    },
    finish: function(f) {
      var tiles = HTomb.World.tiles;
      var EmptyTile = HTomb.Tiles.EmptyTile;
      var FloorTile = HTomb.Tiles.FloorTile;
      var WallTile = HTomb.Tiles.WallTile;
      var UpSlopeTile = HTomb.Tiles.UpSlopeTile;
      var DownSlopeTile = HTomb.Tiles.DownSlopeTile;
      var x = f.x;
      var y = f.y;
      var z = f.z;
      var t = tiles[z][x][y];
      var turf = HTomb.World.turfs[coord(x,y,z)];
      if (turf) {
        turf.remove();
      }
      // If it's a floor, build a slope
      if (t===FloorTile) {
        tiles[z][x][y] = UpSlopeTile;
        if (tiles[z+1][x][y]===EmptyTile) {
          tiles[z+1][x][y] = DownSlopeTile;
        }
      // If it's a slope, make it into a wall
    } else if (t===UpSlopeTile) {
        tiles[z][x][y] = WallTile;
        if (tiles[z+1][x][y] === DownSlopeTile) {
          tiles[z+1][x][y] = FloorTile;
        }
      // If it's empty, add a floor
      } else if (t===DownSlopeTile || t===EmptyTile) {
        tiles[z][x][y] = FloorTile;
      }
      HTomb.World.validate.cleanNeighbors(x,y,z);
      f.remove();
      this.complete();
    },
    designate: function(assigner) {
      HTomb.GUI.selectSquareZone(assigner.z,this.designateSquares,{
        context: this,
        assigner: assigner,
        callback: this.placeZone,
        outline: true,
        bg: this.zoneTemplate.bg
      });
    }
  });

  HTomb.Things.defineTask({
    template: "Undesignate",
    name: "undesignate",
    allowedTiles: "all",
    designate: function(assigner) {
      var deleteZones = function(x,y,z, assigner) {
        var zn = HTomb.World.zones[coord(x,y,z)];
        if (zn && zn.task && zn.assigner===assigner) {
          zn.task.cancel();
        }
        var c = HTomb.World.creatures[coord(x,y,z)];
        if (c && c.minion && c.minion.master===assigner && c.worker && c.worker.task) {
          c.worker.task.unassign();
        }
      };
      HTomb.GUI.selectSquareZone(assigner.z,this.designateSquares,{
        context: this,
        assigner: assigner,
        callback: deleteZones
      });
    }
  });

  HTomb.Things.defineTask({
    template: "PatrolTask",
    name: "patrol",
    zoneTemplate: {
      template: "PatrolZone",
      name: "patrol",
      bg: "#880088"
    },
    designate: function(assigner) {
      HTomb.GUI.selectSquare(assigner.z,this.designateSquare,{
        assigner: assigner,
        context: this,
        callback: this.placeZone
      });
    },
    ai: function() {
      var cr = this.assignee;
      cr.ai.patrol(this.zone.x,this.zone.y,this.zone.z);
    }
  });

  HTomb.Things.defineTask({
    template: "HoardTask",
    name: "hoard",
    zoneTemplate: {
      template: "HoardZone",
      name: "hoard",
      bg: "#666600"
    },
    canDesignateTile: function(x,y,z) {
      if (HTomb.World.tiles[z][x][y]===HTomb.Tiles.FloorTile) {
        return true;
      } else {
        return false;
      }
    },
    ai: function() {
      var cr = this.assignee;
      var t = cr.ai.target;
      if (t && (t.x===null || t.y===null || t.z===null)) {
        cr.ai.target = null;
      }
      if (cr.movement) {
        var zone = this.zone;
        var x = zone.x;
        var y = zone.y;
        var z = zone.z;
        var path = HTomb.Path.aStar(cr.x,cr.y,cr.z,x,y,z);
        if (path===false) {
          this.unassign();
          cr.ai.walkRandom();
        } else {
          if (cr.inventory.items.length>0) {
            if (cr.x===x && cr.y===y && cr.z===z) {
              cr.inventory.drop(cr.inventory.items[0]);
            } else {
              cr.ai.walkToward(x,y,z);
            }
          } else {
              //search for items...should shuffle them first or something
              outerLoop:
              for (var it in HTomb.World.items) {
                var items = HTomb.World.items[it];
                var zone = HTomb.World.zones[it];
                // if it's already in a hoard, skip it
                if (zone && zone.template==="HoardZone") {
                  continue;
                }
                // if it's not owned, skip it
                for (var i=0; i<items.length; i++) {
                  var item = items[i];
                  if (item.item.owned===true) {
                    cr.ai.target = item;
                    break outerLoop;
                  }
                }
              }
              // should maybe use fetch with an option to avoid things in hoards?
              if (cr.ai.target===null) {
                this.unassign();
                cr.ai.walkRandom();
              } else if (cr.x===cr.ai.target.x && cr.y===cr.ai.target.y && cr.z===cr.ai.target.z) {
                cr.inventory.pickup(item);
                cr.ai.target = null;
              } else {
                cr.ai.walkToward(cr.ai.target.x,cr.ai.target.y,cr.ai.target.z);
              }
          }
        }
      }
      cr.ai.acted = true;
    }
  });
  HTomb.Things.defineTask({
    template: "ForbidTask",
    name: "forbid",
    zoneTemplate: {
      template: "ForbiddenZone",
      name: "forbidden",
      bg: "#880000"
    },
    // this task will never be assigned...
    tryAssign: function() {
      return false;
    }
  });

  HTomb.Things.defineTask({
    template: "DismantleTask",
    name: "harvest/dismantle",
    zoneTemplate: {
      template: "DismantleZone",
      name: "dismantle",
      bg: "#446600"
    },
    finish: function(f) {
      f.feature.harvest();
      this.complete();
    },
    canDesignateTile: function(x,y,z) {
      if (HTomb.World.features[coord(x,y,z)] || (HTomb.World.turfs[coord(x,y,z)] && HTomb.World.turfs[coord(x,y,z)].liquid===undefined)) {
        return true;
      } else {
        return false;
      }
    },
    // filter depending on whether we are removing features or turfs
    designateSquares: function(squares, options) {
      var anyf = false;
      for (var j=0; j<squares.length; j++) {
        var s = squares[j];
        if (HTomb.World.features[coord(s[0],s[1],s[2])]) {
          anyf = true;
        }
      }
      if (anyf===true) {
        squares = squares.filter(function(e,i,a) {
          return (HTomb.World.features[coord(e[0],e[1],e[2])]!==undefined);
        });
      }
      HTomb.Things.templates.Task.designateSquares.call(this, squares, options);
    },
    work: function(x,y,z) {
      this.assignee.worker.dismantle(x,y,z);
    }
  });

  HTomb.Things.defineTask({
    template: "CraftTask",
    name: "craft",
    zoneTemplate: {
      template: "CraftZone",
      name: "craft",
      bg: "#553300"
    },
    featureTemplate: {
      name: "incomplete ",
      symbol: "\u25AB",
      steps: 10,
      fg: "#BB9922"
    },
    features: ["Door","Throne","ScryingGlass","Torch"],
    finish: function(f) {
      var x = this.zone.x;
      var y = this.zone.y;
      var z = this.zone.z;
      f.remove();
      this.zone.completeFeature.place(x,y,z);
    },
    canDesignateTile: function(x,y,z) {
      var square = HTomb.Tiles.getSquare(x,y,z);
      if (square.terrain===HTomb.Tiles.FloorTile && HTomb.World.features[coord(x,y,z)]===undefined) {
        return true;
      } else {
        return false;
      }
    },
    designate: function(assigner) {
      var arr = [];
      for (var i=0; i<this.features.length; i++) {
        arr.push(HTomb.Things.templates[this.features[i]]);
      }
      var that = this;
      HTomb.GUI.choosingMenu("Choose a feature:", arr,
      function(feature) {
        return function() {
          function createZone(x,y,z) {
            var zone = that.placeZone(x,y,z);
            if (zone) {
              zone.completeFeature = HTomb.Things[feature.template]();
            }
          }
          HTomb.GUI.selectSquare(assigner.z,this.designateSquare,{
            assigner: assigner,
            context: that,
            callback: createZone
          });
        };
      });
    }
  });

  HTomb.Things.defineTask({
    template: "FarmTask",
    name: "farm",
    zoneTemplate: {
      template: "FarmZone",
      name: "farm",
      bg: "#008800"
    },
    //crops: ["Amanita","Bloodwort","Mandrake","Wolfsbane","Wormwood"],
    assignedCrop: null,
    findSeeds: function() {
      var crops = [];
      for (var it in HTomb.World.items) {
        var items = HTomb.World.items[it];
        for (var i=0; i<items.length; i++) {
          var item = items[i];
          if (item.crop && item.template===item.baseTemplate+"Seed" && crops.indexOf(item.baseTemplate)===-1) {
            crops.push(item.baseTemplate);
          }
        }
      }
      return crops;
    },
    tryAssign: function(cr) {
      var x = this.zone.x;
      var y = this.zone.y;
      var z = this.zone.z;
      var f = HTomb.World.features[coord(x,y,z)];
      if (f===undefined && this.canReachZone(cr)) {
        this.assignTo(cr);
        return true;
      }
      return false;
    },
    canDesignateTile: function(x,y,z) {
      var f = HTomb.World.features[coord(x,y,z)];
      // if (f && f.template!==this.assignedCrop+"Plant") {
      if (f) {
        return false;
      }
      if (HTomb.World.turfs[coord(x,y,z)] && HTomb.World.turfs[coord(x,y,z)].liquid) {
        return false;
      }
      var t = HTomb.World.tiles[z][x][y];
      if (t===HTomb.Tiles.FloorTile) {
        return true;
      } else {
        return false;
      }
    },
    designate: function(master) {
      master = master || HTomb.Player;
      var that = this;
      var crops = this.findSeeds();
      var taskSquares = function(squares) {
        if (crops.length===0) {
          HTomb.GUI.pushMessage("No seeds available.");
          HTomb.GUI.reset();
          return;
        } else if (crops.length===1) {
          that.assignedCrop = crops[0];
          HTomb.GUI.pushMessage("Assigning " + that.assignedCrop);
          for (var k=0; k<squares.length; k++) {
            var crd = squares[k];
            var zn = that.placeZone(crd[0],crd[1],crd[2]);
            if (zn) {
              zn.task.assignedCrop = that.assignedCrop;
            }
          }
          HTomb.GUI.reset();
          return;
        }
        HTomb.GUI.choosingMenu("Choose a crop:", crops, function(crop) {
          return function() {
            that.assignedCrop = crop;
            for (var j=0; j<squares.length; j++) {
              var crd = squares[j];
              var zn = that.placeZone(crd[0],crd[1],crd[2]);
              if (zn) {
                zn.task.assignedCrop = that.assignedCrop;
              }
            }
            HTomb.GUI.reset();
          };
        });
      };
      HTomb.GUI.selectSquareZone(master.z,taskSquares,{reset: false});
    },
    ai: function() {
      var cr = this.assignee;
      if (cr.movement) {
        var zone = this.zone;
        var x = zone.x;
        var y = zone.y;
        var z = zone.z;
        var f = HTomb.World.features[coord(x,y,z)];
        var needsSeed = this.fetch(this.assignedCrop+"Seed");
        if (needsSeed===false) {
          this.seekZoneAI();
        }
      }
      cr.ai.acted = true;
    },
    work: function(x,y,z) {
      if (HTomb.World.turfs[coord(x,y,z)] && HTomb.World.turfs[coord(x,y,z)].template!=="Soil") {
        HTomb.World.turfs[coord(x,y,z)].destroy();
        HTomb.Things.Soil().place(x,y,z);
      }
      var f = HTomb.World.features[coord(x,y,z)];
      var seed = null;
      for (var i=0; i<this.assignee.inventory.items.length; i++) {
        var item = this.assignee.inventory.items[i];
        if (item.template===this.assignedCrop+"Seed") {
          //plant the whole stack at once for now
          item.crop.plantAt(x,y,z);
          this.assignee.inventory.items.remove(item);
          this.finish();
          this.complete();
          return;
        }
      }
    }
  });


  HTomb.Things.defineTask({
    template: "DummyTask",
    fakeTemplate: null,
    zoneTemplate: {
      template: "DummyZone"
    },
    tryAssign: function(cr) {
      var zone = this.zone;
      if (HTomb.World.explored[zone.z][zone.x][zone.y]) {
        HTomb.GUI.pushMessage("Designation invalid");
        this.cancel();
        return false;
      } else if (this.canReachZone(cr)) {
        this.assignTo(cr);
        return true;
      } else {
        return false;
      }
    },
    canDesignateTile: function(x,y,z) {
      return true;
    },
    work: function(x,y,z) {
      HTomb.World.explored[z][x][y] = true;
      HTomb.GUI.pushMessage("Designation invalid");
      this.cancel();
    }
  });


  return HTomb;
})(HTomb);
