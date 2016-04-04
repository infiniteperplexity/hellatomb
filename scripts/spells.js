HTomb = (function(HTomb) {
  "use strict";
  var coord = HTomb.Utils.coord;

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
          HTomb.Particles.addEmitter(c.x,c.y,c.z,{fg: "black", dist: 1, alpha: 1, fade: 0.9,});
          //HTomb.Particles.addEmitter(x,y,z,{fg: "black", dist: 1, alpha: 1, fade: 0.9});
          HTomb.Particles.addEmitter(x,y,z,{fg: "black", dist: 4, alpha: 1, v: -0.5, fade: 0.9});
          // cast directly on a corpse
          items = HTomb.World.items[coord(x,y,z)]
          if (items) {
            for (i=0; i<items.length; i++) {
              if (items[i].template==="Corpse") {
                items[i].despawn();
                zombie = HTomb.Things.Zombie();
                zombie.place(x,y,z);
                HTomb.Things.Minion().addToEntity(zombie);
                zombie.minion.setMaster(caster.entity);
                zombie.ai.setTeam(caster.entity.ai.team);
                caster.entity.master.addMinion(zombie);
                zombie.ai.acted = true;
                HTomb.GUI.sensoryEvent("The corpse stirs and rises...",x,y,z);
                HTomb.Time.turn();
                return;
              }
            }
          }
          // if it's a tombstone
          items = HTomb.World.items[coord(x,y,z-1)] || [];
          for (i=0; i<items.length; i++) {
            if (items[i].template==="Corpse") {
              items[i].despawn();
              if (HTomb.World.tiles[z-1][x][y]===HTomb.Tiles.WallTile) {
                HTomb.World.tiles[z-1][x][y]=HTomb.Tiles.UpSlopeTile;
              }
              HTomb.GUI.sensoryEvent("You hear an ominous stirring below the earth...",x,y,z);
              zombie = HTomb.Things.Zombie();
              zombie.place(x,y,z-1);
              zombie.ai.setTeam(caster.entity.ai.team);
              HTomb.Things.Minion().addToEntity(zombie);
              zombie.minion.setMaster(caster.entity);
              caster.entity.master.addMinion(zombie);
              zombie.ai.acted = true;
              var zone = HTomb.Things.templates.DigTask.placeZone(x,y,z,caster.entity);
              zone.task.assignTo(zombie);
              HTomb.Time.turn();
              return;
            }
          }
        } else {
          HTomb.GUI.pushMessage("Can't cast the spell there.");
        }
      }
      HTomb.GUI.selectSquare(c.z,raiseZombie,{message:"Select a tile with a tombstone or corpse."});
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
