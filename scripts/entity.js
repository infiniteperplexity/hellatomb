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
    each: ["x","y","z"],
    place: function(x,y,z) {
      this.remove();
      if (this.creature) {
        this.creature.place(x,y,z);
      }
      if (this.item) {
        this.item.place(x,y,z);
      }
      if (this.feature) {
        this.feature.place(x,y,z);
      }
      if (this.zone) {
        this.zone.place(x,y,z);
      }
      if (this.liquid) {
        this.liquid.place(x,y,z);
      }
      this.x = x;
      this.y = y;
      this.z = z;
      if (this.onPlace) {
        this.onPlace(x,y,z);
      }
    },
    remove: function() {
      if (this.creature) {
        this.creature.remove();
      }
      if (this.item) {
        this.item.remove();
      }
      if (this.feature) {
        this.feature.remove();
      }
      if (this.zone) {
        this.zone.remove();
      }
      if (this.liquid) {
        this.liquid.remove();
      }
      this.x = null;
      this.y = null;
      this.z = null;
    },
    onDespawn: function() {
      this.remove();
    },
    describe: function() {
      // add options for capitalization?
      if (this.plural===true) {
        return this.name;
      }
      if (this.zone) {
        return this.name;
      }
      // should I handle this with an "onDescribe" function?
      if (this.item && this.item.stackable && this.item.n>1) {
        return (this.item.n + " " +this.name+"s");
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

  HTomb.Things.defineBehavior({
    template: "CreatureBehavior",
    name: "creature",
    maxhp: 10,
    hp: 10,
    each: ["hp"],
    place: function(x,y,z) {
      var c = coord(x,y,z);
      var creatures = HTomb.World.creatures;
      if (creatures[c]) {
        creatures[c].remove();
      }
      creatures[c] = this.entity;
    },
    remove: function() {
      var cr = this.entity;
      var c = coord(cr.x,cr.y,cr.z);
      var creatures = HTomb.World.creatures;
      delete creatures[c];
    },
    destroy: function() {
      this.remove();
    }
  });

  HTomb.Things.defineBehavior({
    template: "ItemBehavior",
    name: "item",
    stackable: false,
    n: null,
    maxn: 10,
    each: ["n"],
    place: function(x,y,z) {
      var c = coord(x,y,z);
      var pile = HTomb.World.items[c] || [];
      if (this.stackable) {
        this.stackInto(pile);
      } else {
        pile.push(this.entity);
      }
      if (pile.length>0) {
        HTomb.World.items[c] = pile;
      }
    },
    remove: function() {
      var it = this.entity;
      var c = coord(it.x,it.y,it.z);
      var pile = HTomb.World.items[c];
      // remove it from the old pile
      if (pile) {
        pile.splice(pile.indexOf(this),1);
        if (pile.length===0) {
          delete HTomb.World.items[c];
        }
      }
    },
    destroy: function() {
      this.remove();
    },
    stackInto: function(arr) {
      var one;
      var two;
      for (var i=0; i<arr.length; i++) {
        if ((this.n>0) && (arr[i].template===this.entity.template) && (arr[i].item.n<arr[i].item.maxn)) {
          one = this.n;
          two = arr[i].item.n;
          if ((one+two)>this.maxn) {
            arr[i].item.n = this.maxn;
            this.n = one+two-this.maxn;
          } else {
            arr[i].item.n = one+two;
            this.n = 0;
          }
        }
      }
      if (this.n>0) {
        arr.push(this.entity);
      }
    },
    listItems: function(arr) {
      var mesg = "";
      for (var i = 0; i<arr.length; i++) {
        mesg = mesg + " " + arr[i].describe();
        if (i===arr.length-2) {
          mesg = mesg + ", and";
        } else if (i<arr.length-1) {
          mesg = mesg + ",";
        }
      }
      return mesg;
    },
    onAdd: function() {
      if (this.entity.stackSize && this.stackable && this.n===null) {
        this.n = this.entity.stackSize();
      }
    }
  });
  HTomb.Things.defineBehavior({
    template: "FeatureBehavior",
    name: "feature",
    hp: 10,
    maxhp: 10,
    each: ["hp"],
    place: function(x,y,z) {
      var c = coord(x,y,z);
      var features = HTomb.World.features;
      if (features[c]) {
        features[c].remove();
      }
      features[c] = this.entity;
    },
    remove: function() {
      var f = this.entity;
      var c = coord(f.x,f.y,f.z);
      var features = HTomb.World.features;
      delete features[c];
    },
    destroy: function() {
      this.remove();
    }
  });
  HTomb.Things.defineBehavior({
    template: "ZoneBehavior",
    name: "zone",
    place: function(x,y,z) {
      var c = coord(x,y,z);
      var zones = HTomb.World.zones;
      if (zones[c]) {
        zones[c].remove();
      }
      zones[c] = this.entity;
    },
    remove: function() {
      var z = this.entity;
      var c = coord(z.x,z.y,z.z);
      var zones = HTomb.World.zones;
      if (zones[c] && zones[c].task) {
        zones[c].task.cancel();
      }
      delete zones[c];
    },
    destroy: function() {
      this.remove();
    }
  });
  HTomb.Things.defineBehavior({
    template: "LiquidBehavior",
    name: "liquid",
    infinite: true,
    each: ["infinite"],
    place: function(x,y,z) {
      var c = coord(x,y,z);
      var liquids = HTomb.World.liquids;
      if (liquids[c]) {
        liquids[c].remove();
      }
      liquids[c] = this.entity;
    },
    remove: function() {
      var l = this.entity;
      var c = coord(l.x,l.y,l.z);
      var liquids = HTomb.World.liquids;
      delete liquids[c];
    },
    destroy: function() {
      this.remove();
    }
  });

  HTomb.Things.defineCreature = function(args) {
    args = args || {};
    args.behaviors = args.behaviors || {};
    args.behaviors.CreatureBehavior = args.behaviors.CreatureBehavior || {};
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineItem = function(args) {
    args = args || {};
    args.behaviors = args.behaviors || {};
    var item = {};
    if (args.stackable) {
      item.stackable = args.stackable;
      if (args.n) {
        item.n = args.n;
      }
      if (args.maxn) {
        item.maxn = args.maxn;
      }
    }
    args.behaviors.ItemBehavior = item;
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineFeature = function(args) {
    args = args || {};
    args.behaviors = args.behaviors || {};
    args.behaviors.FeatureBehavior = args.behaviors.FeatureBehavior || {};
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineZone = function(args) {
    args = args || {};
    args.behaviors = args.behaviors || {};
    args.behaviors.ZoneBehavior = args.behaviors.ZoneBehavior || {};
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineLiquid = function(args) {
    args = args || {};
    args.behaviors = args.behaviors || {};
    args.behaviors.LiquidBehavior = args.behaviors.LiquidBehavior || {};
    args.plural = true;
    HTomb.Things.defineEntity(args);
  };



return HTomb;
})(HTomb);
