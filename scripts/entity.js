HTomb = (function(HTomb) {
  "use strict";
  var coord = HTomb.coord;
  // Define a generic entity that occupies a tile space
  HTomb.Things.define({
    template: "Entity",
    name: "entity",
    parent: "Thing",
    x: null,
    y: null,
    z: null,
    behaviors: {},
    hp: 10,
    maxhp: 10,
    each: ["x","y","z","hp"],
    place: function(x,y,z) {
      //ah...this is causing some problems...
      this.remove();
      var c = coord(x,y,z);
      var creatures = HTomb.World.creatures;
      if (this.isCreature) {
        if (creatures[c]) {
          creatures[c].remove();
        }
        creatures[c] = this;
      }
      var items = HTomb.World.items;
      if (this.isItem) {
        this.remove();
        // put it on the new pile
        var pile = items[c];
        if (pile===undefined) {
          pile = items[c] = [];
        }
        if (this.stack) {
          this.stack.stackInto(pile);
        } else {
          pile.push(this);
        }
      }
      var features = HTomb.World.features;
      if (this.isFeature) {
        if (features[c]) {
          features[c].remove();
        }
        features[c] = this;
      }
      var liquids = HTomb.World.liquids;
      if (this.isLiquid) {
        if (liquids[c]) {
          liquids[c].remove();
        }
        liquids[c] = this;
      }
      var zones = HTomb.World.zones;
      if (this.isZone) {
        if (zones[c]) {
          if (zones[c].task) {
            zones[c].task.cancel();
          } else {
            zones[c].remove();
          }
        }
        zones[c] = this;
      }
      this.x = x;
      this.y = y;
      this.z = z;
      // Fire off the onPlace method, if applicable
      if (this.onPlace) {
        this.onPlace(x,y,z);
      }
    },
    onDespawn: function() {
      this.remove();
    },
    // Remove, but don't necessarily destroy
    remove: function() {
      var c = coord(this.x,this.y,this.z);
      //eventually need to clean up listeners
      var creatures = HTomb.World.creatures;
      if (this.isCreature) {
        delete creatures[c];
      }
      var items = HTomb.World.items;
      if (this.isItem) {
        var pile = items[c];
        // remove it from the old pile
        if (pile) {
          pile.splice(pile.indexOf(this),1);
          if (pile.length===0) {
            delete items[c];
          }
        }
      }
      var features = HTomb.World.features;
      if (this.isFeature) {
        delete features[c];
      }
      var liquids = HTomb.World.features;
      if (this.isLiquid) {
        delete liquids[c];
      }
      var zones = HTomb.World.zones;
      if (this.isZone) {
        delete zones[c];
      }
      this.x = null;
      this.y = null;
      this.z = null;
    },
    describe: function() {
      // add options for capitalization?
      if (this.isZone) {
        return this.name;
      }
      // should I handle this with an "onDescribe" function?
      if (this.isItem && this.stack && this.stack.n>1) {
        return (this.stack.n + " " +this.name+"s");
      } else {
        // pick the correct article
        var first = this.name[0];
        if (first==="a" || first==="e" || first==="i" || first==="o" || first==="u") {
          return ("an " + this.name);
        } else {
          return ("a " + this.name);
        }
      }
    },
    onCreate: function() {
      // Add behaviors to entity
      for (var b in this.behaviors) {
        var beh = HTomb.Things[b](this.behaviors[b] || {});
        beh.addToEntity(this);
      }
      // Randomly choose symbol if necessary
      if (Array.isArray(this.symbol)) {
        this.symbol = this.symbol[Math.floor(Math.random()*this.symbol.length)];
      }
      // Randomly choose  color if necessary
      if (Array.isArray(this.fg)) {
        this.fg = this.fg[Math.floor(Math.random()*this.fg.length)];
      }
      // Randomly perturb color, if necessary
      if (this.randomColor>0 && this.fg) {
        if (this.fg) {
          var c = ROT.Color.fromString(this.fg);
          c = ROT.Color.randomize(c,[this.randomColor, this.randomColor, this.randomColor]);
          c = ROT.Color.toHex(c);
          this.fg = c;
        }
      }
    }
  });

  HTomb.Things.defineCreature = function(args) {
    args = args || {};
    args.isCreature = true;
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineItem = function(args) {
    args = args || {};
    args.isItem = true;
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineFeature = function(args) {
    args = args || {};
    args.isFeature = true;
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineZone = function(args) {
    args = args || {};
    args.isZone = true;
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineLiquid = function(args) {
    args = args || {};
    args.isLiquid = true;
    HTomb.Things.defineEntity(args);
  };

  // Define a generic behavior that gets attached to entities
  HTomb.Things.define({
    template: "Behavior",
    name: "behavior",
    parent: "Thing",
    entity: null,
    addToEntity: function(ent) {
      this.entity = ent;
      ent[this.name] = this;
      if (ent.hasOwnProperty("each")===false) {
        var each = [];
        for (var i=0; i<ent.each.length; i++) {
          each.push(ent.each[i]);
        }
        ent.each = each;
      }
      ent.each.push(this.name);
      if (this.onAdd) {
        this.onAdd(this.options);
      }
    },
    each: ["entity"]
  });

return HTomb;
})(HTomb);
