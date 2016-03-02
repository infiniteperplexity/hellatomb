HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var coord = HTomb.coord;
  // should we maybe allow a queue of zones???  probably not

  // Define a generic task that gets workers assigned
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
    each: ["assigner","assignee","zone","feature"],
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
    // one of the more common ways to test if a task can be assigned
    canReachZone: function(cr) {
      var zone = this.zone;
      var path = HTomb.Path.aStar(zone.x,zone.y,zone.z,cr.x,cr.y,cr.z,{useLast: false});
      if (path!==false) {
        return true;
      } else if (zone.z===cr.z && HTomb.Path.distance(cr.x,cr.y,zone.x,zone.y)<=1) {
        return true;
        // this is hacky and needs to change
      } else if (HTomb.Tiles.isTouchableFrom(zone.x,zone.y,zone.z,cr.x,cr.y,cr.z)) {
        return true;
      } else {
        return false;
      }
    },
    canDesignateTile: function(x,y,z) {
      return true;
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
      var cr = this.assignee;
      if (cr.minion===undefined) {
        HTomb.Debug.pushMessage("Problem unassigning task");
      } else {
        this.assignee = null;
        cr.minion.unassign();
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
        this.assignee.minion.unassign();
      }
      if (this.zone) {
        //prevent recursion traps
        var z = this.zone;
        this.zone = null;
        z.remove();
      }
    },
    complete: function() {
      var master = this.assigner;
      if (master) {
        var taskList = this.assigner.master.taskList;
        if (taskList.indexOf(this)!==-1) {
          taskList.splice(taskList.indexOf(this),1);
        }
      }
      if (this.assignee) {
        this.assignee.minion.unassign();
      }
      if (this.zone) {
        this.zone.remove();
        //this.zone = null;
      }
      if (this.onComplete) {
        this.onComplete();
      }
    },
    // the last parameter is optional
    placeZone: function(x,y,z, master) {
      master = master || HTomb.Player;
      if (this.canDesignateTile(x,y,z)) {
        var zone = HTomb.Things[this.zoneTemplate.template]();
        zone.place(x,y,z);
        var t = HTomb.Things[this.template]();
        zone.task = t;
        t.zone = zone;
        t.assigner = master;
        t.assigner.master.taskList.push(t);
      } else if (HTomb.World.explored[z][x][y]!==true) {
        var dzone = HTomb.Things.DummyZone({name: this.zoneTemplate.name, bg: this.zoneTemplate.bg});
        dzone.place(x,y,z);
        var dt = HTomb.Things.DummyTask({fakeAs: this.template, name: this.name});
        dzone.task = dt;
        dt.zone = dzone;
        dt.assigner = master;
        dt.assigner.master.taskList.push(dt);
      }
      return (zone || dzone);
    },
    // note that this passes the behavior, not the entity
    designate: function(master) {
      this.designateSquares({master: master});
    },
    // one common way of designating tasks
    designateSquare: function(options) {
      options = options || {};
      var master = options.master || HTomb.Player;
      var z = master.entity.z;
      var that = this;
      function createZone(x,y,z) {
        that.placeZone(x,y,z);
        if (options.callback) {
          options.callback(x,y,z);
        }
      }
      HTomb.GUI.selectSquare(z,createZone);
    },
    // one common way of designating tasks
    designateSquares: function(options) {
      options = options || {};
      var master = options.master || HTomb.Player.master;
      options.outline = options.outline || false;
      var that = this;
      var taskSquares = function(squares) {
        for (var i=0; i<squares.length; i++) {
          var crd = squares[i];
          that.placeZone(crd[0],crd[1],crd[2]);
          if (options.callback) {
            options.callback(crd[0],crd[1],crd[2]);
          }
        }
        HTomb.GUI.reset();
      };
      HTomb.GUI.selectSquareZone(master.entity.z,taskSquares,{outline: options.outline, bg: this.zoneTemplate.bg});
    },
    ai: function() {
      this.seekZoneAI();
    },
    // A common AI pattern for Tasks
    seekZoneAI: function() {
      var cr = this.assignee;
      if (cr.movement) {
        var zone = this.zone;
        var x = zone.x;
        var y = zone.y;
        var z = zone.z;
        var dist = HTomb.Path.distance(cr.x,cr.y,x,y);
        if (HTomb.Tiles.isTouchableFrom(x,y,z,cr.x,cr.y,cr.z)) {
          this.work(x,y,z);
        } else if (dist>0 || cr.z!==z) {
          cr.movement.walkToward(x,y,z);
        } else if (dist===0) {
          cr.movement.walkRandom();
        }
      }
      cr.ai.acted = true;
    },
    work: function(x,y,z) {
      if (HTomb.World.turfs[coord(x,y,z)]) {
        (HTomb.World.turfs[coord(x,y,z)]).remove();
      }
      var f = HTomb.World.features[coord(x,y,z)];
      if (f===this.incompleteFeature) {
        f.steps-=1;
        if (f.steps<=0) {
          this.finish();
          this.complete();
        }
      } else {
        this.incompleteFeature = HTomb.Things.Construction(this.featureTemplate);
        this.incompleteFeature.task = this;
        if (f) {
          console.log("removed a feature to make room for " + this.incompleteFeature.describe());
          f.remove();
        }
        this.incompleteFeature.place(x,y,z);
      }
    },
    finish: function() {
      HTomb.Debug.pushMessage("Don't use default!");
      alert("don't use this!");
    }
  });

  HTomb.Things.defineTask({
    template: "UnearthingSigil",
    name: "unearthing sigil",
    zoneTemplate: {
      template: "DigZone",
      name: "dig",
      bg: "#553300"
    },
    featureTemplate: {
      name: "incomplete excavation",
      //symbol: "\u2022",
      symbol: "\u2717",
      steps: 5,
      fg: HTomb.Constants.BELOW
    },
    canDesignateTile: function(x,y,z) {
      if (HTomb.World.features[coord(x,y,z)] && HTomb.World.features[coord(x,y,z)].template!=="Tombstone") {
        return false;
      }
      var t = HTomb.World.tiles[z][x][y];
      var tb = HTomb.World.tiles[z-1][x][y];
      if (t===HTomb.Tiles.VoidTile) {
        return false;
      } else if (t===HTomb.Tiles.FloorTile && tb===HTomb.Tiles.VoidTile) {
        return false;
      } else if (t===HTomb.Tiles.EmptyTile && (tb===HTomb.Tiles.EmptyTile || tb===HTomb.Tiles.FloorTile)) {
        return false;
      }
      return true;
    },
    placeZone: function(x,y,z, master) {
      master = master || HTomb.Player;
      // raise a zombie if we can
      if (this.canDesignateTile(x,y,z) && HTomb.World.explored[z][x][y]) {
        var items = HTomb.World.items[coord(x,y,z-1)] || [];
        for (var i=0; i<items.length; i++) {
          if (items[i].template==="Corpse") {
            items[i].remove();
            if (HTomb.World.tiles[z-1][x][y]===HTomb.Tiles.WallTile) {
              HTomb.World.tiles[z-1][x][y]=HTomb.Tiles.UpSlopeTile;
            }
            HTomb.GUI.sensoryEvent("You hear an ominous stirring below the earth...",x,y,z);
            var zombie = HTomb.Things.Zombie();
            zombie.place(x,y,z-1);
            HTomb.Things.Minion().addToEntity(zombie);
            zombie.minion.setMaster(master);
            master.master.addMinion(zombie);
            zombie.ai.acted = true;
            var zn = HTomb.Things.templates.Task.placeZone.call(this,x,y,z,master);
            zn.task.tryAssign(zombie);
            zn.clearsFeature = false;
            return;
          }
        }
      }
      // otherwise just place a zone
      HTomb.Things.templates.Task.placeZone.call(this,x,y,z,master);
    },
    work: function(x,y,z) {
      if (this.zone.clearsFeature===false) {
        var f = HTomb.World.features[coord(x,y,z)];
        if (f && f.template==="Tombstone") {
          // to scatter the timing a bit...
          if (Math.random()<0.8) {
            f.feature.hp-=1;
          }
          if (f.feature.hp===0) {
            // explode the tombstone
            f.destroy();
            HTomb.GUI.sensoryEvent("A zombie bursts forth from the ground!",x,y,z);
            for (var i=0; i<ROT.DIRS[8].length; i++) {
              var x1 = ROT.DIRS[8][i][0]+x;
              var y1 = ROT.DIRS[8][i][1]+y;
              if (HTomb.World.tiles[z][x1][y1].solid!==true) {
                if (Math.random()<0.4) {
                  var rock = HTomb.Things.Rock();
                  rock.item.n = 1;
                  rock.place(x1,y1,z);
                }
              }
              HTomb.World.tiles[z][x][y] = HTomb.Tiles.DownSlopeTile;
              if(HTomb.World.turfs[coord(x,y,z)]) {
                HTomb.World.turfs[coord(x,y,z)].destroy();
              }
              this.complete();
              HTomb.World.validate();
            }
          }
        }
      } else {
        HTomb.Things.templates.Task.work.call(this,x,y,z);
      }
    },
    finish: function() {
      var tiles = HTomb.World.tiles;
      var EmptyTile = HTomb.Tiles.EmptyTile;
      var FloorTile = HTomb.Tiles.FloorTile;
      var WallTile = HTomb.Tiles.WallTile;
      var UpSlopeTile = HTomb.Tiles.UpSlopeTile;
      var DownSlopeTile = HTomb.Tiles.DownSlopeTile;
      var c = this.incompleteFeature;
      var x = c.x;
      var y = c.y;
      var z = c.z;
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
      c.remove();
      HTomb.World.validate();
    }
  });

  HTomb.Things.defineTask({
    template: "EarthenSigil",
    name: "earthen sigil",
    zoneTemplate: {
      template: "BuildZone",
      name: "build",
      bg: "#444444"
    },
    featureTemplate: {
      name: "incomplete construction",
      //symbol: "\u25AB",
      symbol: "\u2692",
      fg: HTomb.Constants.ABOVE,
      steps: 5
    },
    canDesignateTile: function(x,y,z) {
      if (HTomb.World.features[coord(x,y,z)]) {
        return false;
      }
      //shouldn't be able to build surrounded by emptiness
      var t = HTomb.World.tiles[z][x][y];
      if (t===HTomb.Tiles.VoidTile || t===HTomb.Tiles.WallTile) {
        return false;
      } else {
        return true;
      }
    },
    finish: function() {
      var tiles = HTomb.World.tiles;
      var EmptyTile = HTomb.Tiles.EmptyTile;
      var FloorTile = HTomb.Tiles.FloorTile;
      var WallTile = HTomb.Tiles.WallTile;
      var UpSlopeTile = HTomb.Tiles.UpSlopeTile;
      var DownSlopeTile = HTomb.Tiles.DownSlopeTile;
      var c = this.incompleteFeature;
      var x = c.x;
      var y = c.y;
      var z = c.z;
      var t = tiles[z][x][y];
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
      HTomb.World.validate();
      c.remove();
    },
    designate: function(master) {
      this.designateSquares({master: master, outline: true});
    }
  });

  HTomb.Things.defineTask({
    template: "RevokingSigil",
    name: "revoking sigil",
    allowedTiles: "all",
    designate: function(master) {
      if (master.entity===HTomb.Player) {
        var deleteZones = function(squares) {
          for (var i=0; i<squares.length; i++) {
            var crd = squares[i];
            var z = HTomb.World.zones[coord(crd[0], crd[1], crd[2])];
            if (z && z.task) {
              z.task.cancel();
            }
          }
        };
        HTomb.GUI.selectSquareZone(HTomb.Player.z,deleteZones,{outline: false});
      }
    }
  });

  HTomb.Things.defineTask({
    template: "WardingSigil",
    name: "warding sigil",
    zoneTemplate: {
      template: "PatrolZone",
      name: "patrol",
      bg: "#880000"
    },
    canDesignateTile: function() {
      return true;
    },
    designate: function(master) {
      this.designateSquare({master: master});
    },
    ai: function() {
      var cr = this.assignee;
      cr.ai.patrol(this.zone.x,this.zone.y,this.zone.z);
    }
  });

  HTomb.Things.defineTask({
    template: "HoardingSigil",
    name: "hoarding sigil",
    zoneTemplate: {
      template: "HoardZone",
      name: "hoard",
      bg: "#880000"
    },
    canDesignateTile: function(x,y,z) {
      if (HTomb.World.tiles[z][x][y]===HTomb.Tiles.FloorTile) {
        return true;
      } else {
        return false;
      }
    },
    designate: function(master) {
      this.designateSquares({master: master});
    },
    ai: function() {
      var cr = this.assignee;
      if (cr.movement) {
        var zone = this.zone;
        var x = zone.x;
        var y = zone.y;
        var z = zone.z;
        var path = HTomb.Path.aStar(cr.x,cr.y,cr.z,x,y,z);
        if (path===false) {
          cr.movement.walkRandom();
        } else {
          if (cr.inventory.items.length>0) {
            if (cr.x===x && cr.y===y && cr.z===z) {
              cr.inventory.drop(cr.inventory.items[0]);
            } else {
              cr.movement.walkToward(x,y,z);
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
                // if it's not haulable, skip it
                for (var i=0; i<items.length; i++) {
                  var item = items[i];
                  if (item.item.haulable!==false) {
                    cr.ai.target = item;
                    break outerLoop;
                  }
                }
              }
              if (cr.ai.target===null) {
                cr.movement.walkRandom();
              } else if (cr.x===cr.ai.target.x && cr.y===cr.ai.target.y && cr.z===cr.ai.target.z) {
                cr.inventory.pickup(item);
                cr.ai.target = null;
              } else {
                cr.movement.walkToward(cr.ai.target.x,cr.ai.target.y,cr.ai.target.z);
              }
          }
        }
      }
      cr.ai.acted = true;
      // Check to see if I can reach the zone.
      // Check to see if I am carrying an item
      // Check to see if I can find an item.
    }
  });
  HTomb.Things.defineTask({
    template: "ForbiddenSigil",
    name: "forbidden sigil",
    zoneTemplate: {
      template: "ForbiddenZone",
      name: "forbidden",
      bg: "#880000"
    },
    // this task will never be assigned...
    tryAssign: function() {
      return false;
    },
    canDesignateTile: function(x,y,z) {
      return true;
    },
    designate: function(master) {
      this.designateSquares({master: master, outline: true});
    },
    ai: function() {
      //var cr = this.assignee;
      //cr.ai.patrol(this.zone.x,this.zone.y,this.zone.z);
    }
  });
  HTomb.Things.defineTask({
    template: "MurderousSigil",
    name: "murderous sigil",
    zoneTemplate: {
      template: "MurderZone",
      name: "murder",
      bg: "#880000"
    },
    canDesignateTile: function(x,y,z) {
      return true;
    },
    designate: function(master) {
      this.designateSquare({master: master});
    },
    ai: function() {
      //var cr = this.assignee;
      //cr.ai.patrol(this.zone.x,this.zone.y,this.zone.z);
    }
  });
  HTomb.Things.defineTask({
    template: "HarvestingSigil",
    name: "harvesting sigil",
    zoneTemplate: {
      template: "HarvestZone",
      name: "harvest",
      bg: "#880000"
    },
    crops: ["Amanita","Bloodwort","Mandrake","Wolfsbane","Wormwood"],
    assignedCrop: null,
    tryAssign: function(cr) {
      var x = this.zone.x;
      var y = this.zone.y;
      var z = this.zone.z;
      var f = HTomb.World.features[coord(x,y,z)];
      // if the right kind of plant is there
      if (f && f.template===this.assignedCrop+"Plant" && f.crop.growTurns===0 && this.canReachZone(cr)) {
        this.assignTo(cr);
        return true;
      }
      if (f===undefined && this.canReachZone(cr)) {
        this.assignTo(cr);
        return true;
      }
      return false;
    },
    canDesignateTile: function(x,y,z) {
      var f = HTomb.World.features[coord(x,y,z)];
      //FAIL!!! this should be allowed if the current crop is there...
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
      var that = this;
      HTomb.GUI.choosingMenu("Choose a crop:", this.crops,
        function(crop) {
          return function() {
            var master = master || HTomb.Player;
            var z = master.z;
            var taskSquares = function(squares) {
              for (var i=0; i<squares.length; i++) {
                var crd = squares[i];
                var zn = that.placeZone(crd[0],crd[1],crd[2]);
                zn.task.assignedCrop = crop;
              }
              HTomb.GUI.reset();
            };
            HTomb.GUI.selectSquareZone(z,taskSquares);
          };
        }
      );
    },
    ai: function() {
      var cr = this.assignee;
      if (cr.movement) {
        var zone = this.zone;
        var x = zone.x;
        var y = zone.y;
        var z = zone.z;
        var path = HTomb.Path.aStar(cr.x,cr.y,cr.z,x,y,z);
        if (path===false) {
          console.log("can't find path to square");
          cr.movement.walkRandom();
        } else {
          var f = HTomb.World.features[coord(x,y,z)];
          // if the right kind of plant is there
          if (f && f.template===this.assignedCrop+"Plant") {
            console.log("the plant is there");
            // if the plant is ready to harvest
            if (f.crop.growTurns===0) {
              console.log("and it's ready to harvest");
              if (HTomb.Tiles.isTouchableFrom(x,y,z,cr.x,cr.y,cr.z)) {
                console.log("can reach it");
                this.work(x,y,z);
              } else {
                console.log("trying to walk toward it");
                // should check for path viability?
                cr.movement.walkToward(x,y,z);
              }
            } else {
              console.log("plant but not ready to harvest");
              // for now, wander until the plant is ready to harvest
              this.walkRandom();
            }
          // look for seeds
          } else {
            console.log("no plant");
            // should check to see if we are holding seeds
              // need a method to check for a kind of item...
            if (cr.inventory.items.containsAny(this.assignedCrop+"Seed")) {
              console.log("we have a seed");
              if (HTomb.Tiles.isTouchableFrom(x,y,z,cr.x,cr.y,cr.z)) {
                console.log("can reach it");
                this.work(x,y,z);
              } else {
                console.log("walking to plant the seed");
                // should check for path viability?
                cr.movement.walkToward(x,y,z);
              }
            // if we haven't found seeds yet, look for them
            } else if (cr.ai.target===null || cr.ai.target.template!==this.assignedCrop+"Seed") {
              console.log("haven't found seed");
              console.log("looping for seed");
              outerLoop:
              for (var zn in HTomb.World.zones) {
                if (HTomb.World.zones[zn].template==="HoardZone") {
                  console.log("checking a hoard zone");
                  var items = HTomb.World.items[zn];
                  if (items) {
                    for (var i=0; i<items.length; i++) {
                      console.log("this is a " + items[i].template);
                      console.log("looking for a " + this.assignedCrop+"Seed");
                      if (items[i].template===this.assignedCrop+"Seed") {
                        // should check for path?
                        console.log("found a seed");
                        cr.ai.target = items[i];
                        break outerLoop;
                      }
                    }
                  }
                }
              }
            }
            if (cr.ai.acted !== true) {
              if (cr.ai.target===null) {
                console.log("found no seeds");
                //couldn't find any seeds
                cr.movement.walkRandom();
              } else if (cr.x===cr.ai.target.x && cr.y===cr.ai.target.y && cr.z===cr.ai.target.z) {
                console.log("pickup the seed");
                // for now we pick up the entire stack of seeds?
                cr.inventory.pickup(cr.ai.target);
                cr.ai.target = null;
              } else {
                console.log("walking toward the seed");
                //walk toward the seeds
                cr.movement.walkToward(cr.ai.target.x,cr.ai.target.y,cr.ai.target.z);
              }
            }
          }
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
      if (f && f.template===this.assignedCrop+"Plant" && f.crop.growTurns===0) {
        f.crop.harvestBy(this.assignee);
        this.finish();
        this.complete();
      } else {
        var seed = null;
        for (var i=0; i<this.assignee.inventory.items.length; i++) {
          var item = this.assignee.inventory.items[i];
          if (item.template===this.assignedCrop+"Seed") {
            //plant the whole stack at once for now
            item.crop.plantAt(x,y,z);
            this.assignee.inventory.items.remove(item);
            this.unassign();
            return;
          }
        }
      }
    }
  });
  HTomb.Things.defineTask({
    template: "DismantlingSigil",
    name: "dismantling sigil",
    zoneTemplate: {
      template: "DismantleZone",
      name: "dismantle",
      bg: "#880000"
    },
    finish: function() {
      var x = this.zone.x;
      var y = this.zone.y;
      var z = this.zone.z;
      var thing = HTomb.World.features[coord(x,y,z)];
      if (thing) {
        HTomb.GUI.sensoryEvent("Removed " + thing.describe(),x,y,z);
        thing.destroy();
        return;
      }
      thing = HTomb.World.turfs[coord(x,y,z)];
      if (thing) {
        HTomb.GUI.sensoryEvent("Removed " + thing.describe(),x,y,z);
        thing.destroy();
        return;
      }
    },
    canDesignateTile: function(x,y,z) {
      if (HTomb.World.features[coord(x,y,z)] || (HTomb.World.turfs[coord(x,y,z)] && HTomb.World.turfs[coord(x,y,z)].liquid===undefined)) {
        return true;
      } else {
        return false;
      }
    },
    designate: function(master) {
      this.designateSquares({master: master});
    },
    work: function(x,y,z) {
      var thing = HTomb.World.features[coord(x,y,z)];
      if (thing) {
        thing.feature.hp-=1;
        if (thing.feature.hp<=0) {
          this.finish();
          this.complete();
        }
      } else {
        thing = HTomb.World.turfs[coord(x,y,z)];
        if (thing) {
          this.finish();
          this.complete();
        }
      }
    }
  });

  HTomb.Things.defineTask({
    template: "CraftingSigil",
    name: "crafting sigil",
    zoneTemplate: {
      template: "BuildFeatureZone",
      name: "build",
      bg: "#553300"
    },
    featureTemplate: {
      name: "incomplete ",
      symbol: "\u25AB",
      steps: 10,
      fg: "#BB9922"
    },
    features: ["Door","Throne","ScryingGlass"],
    finish: function() {
      var c = this.incompleteFeature;
      var x = this.zone.x;
      var y = this.zone.y;
      var z = this.zone.z;
      //c.remove();
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
    designate: function(master) {
      var arr = [];
      for (var i=0; i<this.features.length; i++) {
        arr.push(HTomb.Things.templates[this.features[i]]);
      }
      var that = this;
      HTomb.GUI.choosingMenu("Choose a feature:", arr,
      function(feature) {
        return function() {
          var master = master || HTomb.Player;
          var z = master.z;
          function createZone(x,y,z) {
            var zone = that.placeZone(x,y,z);
            if (zone) {
              //console.log(zone.task);
              zone.completeFeature = HTomb.Things[feature.template]();
            }
          }
          HTomb.GUI.selectSquare(z,createZone);
        };
      });
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


/*

Q: Turn a floor tile into a wall tile?
A: Build on the tile once to create a slope, and then build on the tile again to create a wall.

Q: Turn an upward slope into a wall tile?
A: Build once on the slope.

Q: Build a passage to the next level up?
A: Build once on a floor tile to create a slope.  If there is no ceiling above, you can reach the next level up.  Otherwise, dig a hole in the ceiling (see below.)

Q: Turn a deep pit or trench into a shallow pit or trench?
A: Build once in the pit.  Do not build above the pit or a worker may place a floor above the slope.

Q: Fill in a pit from above?
A: Build once in the pit to create a slope, then build in it a second time to fill in the pit.

Q: Build a floor in an empty tile?
A: Build once in the empty tile.

Q: Build a ceiling from above?
A: Same as building a floor.

Q: Build a ceiling from below?
A: Build an upward slope directly below, then build on the level above.

Q: Dig a shallow pit or trench in the floor?
A: Dig once on a floor tile to create a downward slope.

Q: Dig a deep pit or trench in the floor?
A: Dig once on a floor tile to create a downward slope; then dig once more either above or on the slope.  Do not dig in the pit if there is an upward slope directly below the tile, or a worker might remove the floor of the pit.

Q: Build a passage to the next level down?
A: Dig once on a floor tile.

Q: Create a tunnel (with floor and ceiling intact) from a wall tile?
A: Dig once in the wall tile.  Make sure there is not an upward slope directly below the tile, or a worker might remove the floor of the tunnel.

Q: Dig a hole in the ceiling from below?
A: Build once on the floor directly below to create an upward slope.  Then dig once in the wall tile above.

Q: Dig a hole in the ceiling from above?
A: Same as digging a shallow pit.

*/
