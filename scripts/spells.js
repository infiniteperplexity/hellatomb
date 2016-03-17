HTomb = (function(HTomb) {
  "use strict";
  var coord = HTomb.coord;

  HTomb.Things.define({
    template: "Spell",
    name: "spell"
  });

  HTomb.Things.defineSpell({
    template: "RaiseZombie",
    name: "raise zombie",
    cast: function(caster) {
      var c = caster.entity;
      var that = this;
      var items, zombie, i;
      function raiseZombie(x,y,z) {
        if (that.canDesignateTile(x,y,z)) {
          HTomb.Particles.addEmitter(c.x,c.y,c.z,{fg: "black", dist: 1});
          HTomb.Particles.addEmitter(x,y,z,{fg: "black", dist: 1});
          // cast directly on a corpse
          items = HTomb.World.items[coord(x,y,z)]
          if (items) {
            for (i=0; i<items.length; i++) {
              if (items[i].template==="Corpse") {
                items[i].remove();
                zombie = HTomb.Things.Zombie();
                zombie.place(x,y,z);
                HTomb.Things.Minion().addToEntity(zombie);
                zombie.minion.setMaster(caster.entity);
                caster.entity.master.addMinion(zombie);
                zombie.ai.acted = true;
                HTomb.GUI.sensoryEvent("The corpse stirs and rises...",x,y,z);
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
              zombie.minion.setMaster(caster.entity);
              caster.entity.master.addMinion(zombie);
              zombie.ai.acted = true;
              var zone = HTomb.Things.DigZone().place(x,y,z);
              var task = HTomb.Things.DigTask();
              task.assignTo(zombie);
              zone.task = task;
              zone.assigner = caster.entity;
              task.zone = zone;
            }
          }
        } else {
          HTomb.GUI.pushMessage("Can't cast the spell there.");
        }
      }
      HTomb.GUI.selectSquare(c.z,raiseZombie);
    },
    canDesignateTile: function(x,y,z) {
      if (HTomb.World.explored[z][x][y]!==true) {
        return false;
      }
      if (HTomb.World.features[coord(x,y,z)] && HTomb.World.features[coord(x,y,z)].template==="Tombstone" && HTomb.World.items[coord(x,y,z-1)] && HTomb.World.items[coord(x,y,z-1)].containsAny("Corpse")) {
        return true;
      }
      if (HTomb.World.items[coord(x,y,z)] && HTomb.World.items[coord(x,y,z)].containsAny("Corpse")) {
        return true;
      }
      return false;
    }
  });

  return HTomb;
})(HTomb);
