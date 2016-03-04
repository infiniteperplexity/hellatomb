HTomb = (function(HTomb) {
  "use strict";
  var coord = HTomb.coord;

  HTomb.Things.define({
    template: "Spell",
    name: "spell",
    parent: "Thing"
  });

  HTomb.Things.defineSpell({
    template: "RaiseZombie",
    name: "raise zombie",
    cast: function(caster) {
      var c = caster.entity;
      var task = HTomb.Things.ExhumeTask();
      HTomb.Player.master.designate(task);
    },
    designateSquares: function(task) {
      var master = HTomb.Player.master;
      var succeed = false;
      var taskSquares = function(squares) {
        for (var i=0; i<squares.length; i++) {
          var crd = squares[i];
          if (task.placeZone(crd[0],crd[1],crd[2])) {
            succeed = true;
          }
        }
        if (succeed===true) {
          HTomb.turn();
        }
        HTomb.GUI.reset();
      };
      HTomb.GUI.selectSquareZone(master.entity.z,taskSquares,
        {message: "Use the mouse to select two corners of the zone you want to cast this in.  Make sure to include at least one corpse or tombstone.  If the tombstone is highlighted in orange, you cast the spell successfully.  A zombie will take several turns to dig its way out of its grave.",
          bg: task.zoneTemplate.bg});
    }
  });


  HTomb.Things.defineTask({
    template: "ExhumeTask",
    name: "exhume zombie",
    zoneTemplate: {
      template: "ExhumeZone",
      name: "exhume zombie",
      bg: "#553300"
    },
    canDesignateTile: function(x,y,z) {
      if (HTomb.World.explored[z][x][y]!==true) {
        return false;
      }
      if (HTomb.World.features[coord(x,y,z)] && HTomb.World.features[coord(x,y,z)].template==="Tombstone" && HTomb.World.items[coord(x,y,z-1)] && HTomb.World.items[coord(x,y,z-1)].containsAny("Corpse")) {
        return true;
      //} else if (HTomb.World.items[coord(x,y,z)].containsAny("Corpse")) {
      //  return true;
      }
      if (HTomb.World.items[coord(x,y,z)] && HTomb.World.items[coord(x,y,z)].containsAny("Corpse")) {
        return true;
      }
      return false;
    },
    designate: function(master) {
      master = master || HTomb.Player;
      HTomb.Things.templates.RaiseZombie.designateSquares(this);
      // this really should use up a turn!  But...async issues...
    },
    placeZone: function(x,y,z,master) {
      master = master || HTomb.Player;
      var zombie, i, items;
      if (this.canDesignateTile(x,y,z)) {
        // if there's a corpse just sitting there
        items = HTomb.World.items[coord(x,y,z)]
        if (items) {
          for (i=0; i<items.length; i++) {
            if (items[i].template==="Corpse") {
              items[i].remove();
              zombie = HTomb.Things.Zombie();
              zombie.place(x,y,z);
              HTomb.Things.Minion().addToEntity(zombie);
              zombie.minion.setMaster(master);
              master.master.addMinion(zombie);
              zombie.ai.acted = true;
              HTomb.GUI.sensoryEvent("The corpse stirs and rises...",x,y,z);
              return zombie;;
            }
          }
        }
        // if it's a tombstone
        items = HTomb.World.items[coord(x,y,z-1)] || [];
        for (i=0; i<items.length; i++) {
          if (items[i].template==="Corpse") {
            items[i].remove();
            if (HTomb.World.tiles[z-1][x][y]===HTomb.Tiles.WallTile) {
              HTomb.World.tiles[z-1][x][y]=HTomb.Tiles.UpSlopeTile;
            }
            HTomb.GUI.sensoryEvent("You hear an ominous stirring below the earth...",x,y,z);
            zombie = HTomb.Things.Zombie();
            zombie.place(x,y,z-1);
            HTomb.Things.Minion().addToEntity(zombie);
            zombie.minion.setMaster(master);
            master.master.addMinion(zombie);
            zombie.ai.acted = true;
            var zone = HTomb.Things[this.zoneTemplate.template]();
            zone.place(x,y,z);
            var t = HTomb.Things[this.template]();
            zone.task = t;
            t.zone = zone;
            t.assigner = master;
            t.assigner.master.taskList.push(t);
            zone.task.tryAssign(zombie);
            return zone;
          }
        }
      }
    },
    work: function(x,y,z) {
      var f = HTomb.World.features[coord(x,y,z)];
      if (f && f.template==="Tombstone") {
        // to scatter the timing a bit...
        if (Math.random()<0.8) {
          f.feature.hp-=1;
        }
        if (f.feature.hp===0) {
          this.finish();
          this.complete();
        }
      } else {
        this.cancel();
      }
    },
    finish: function() {
      var x = this.zone.x;
      var y = this.zone.y;
      var z = this.zone.z;
      var f = HTomb.World.features[coord(x,y,z)];
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
      }
      HTomb.World.validate.cleanNeighbors(x,y,z);
    }
  });

  HTomb.Things.defineSpell({
    template: "SummonBat",
    name: "summon bat",
    cast: function(caster) {
      var c = caster.entity;
      HTomb.GUI.pushMessage(c.describe() + " summons a bat.");
      var sq = HTomb.Tiles.randomEmptyNeighbor(c.x,c.y,c.z);
      if (sq) {
        var b = HTomb.Things.Bat();
        b.place(sq[0],sq[1],sq[2]);
        if (!c.master) {
          HTomb.Things.Master().addToEntity(c);
        }
        HTomb.Things.Minion().addToEntity(b);
        b.minion.setMaster(c);
        c.master.addMinion(b);
        b.ai.acted = true;
      }
    }
  });


  return HTomb;
})(HTomb);
