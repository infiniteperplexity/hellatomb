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
      if (this.turf) {
        this.turf.place(x,y,z);
      }
      this.x = x;
      this.y = y;
      this.z = z;
      if (this.onPlace) {
        this.onPlace(x,y,z);
      }
      return this;
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
      if (this.turf) {
        this.turf.remove();
      }
      this.x = null;
      this.y = null;
      this.z = null;
    },
    destroy: function() {
      if (this.creature && this.creature.destroy) {
        this.creature.destroy();
      }
      if (this.item && this.item.destroy) {
        this.item.destroy();
      }
      if (this.feature && this.feature.destroy) {
        this.feature.destroy();
      }
      if (this.zone && this.zone.destroy) {
        this.zone.destroy();
      }
      if (this.turf && this.turf.destroy) {
        this.turf.destroy();
      }
      this.remove();
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
    template: "Creature",
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
    }
  });

  HTomb.Things.defineBehavior({
    template: "Item",
    name: "item",
    stackable: false,
    n: null,
    maxn: 10,
    container: null,
    haulable: true,
    each: ["n","haulable"],
    place: function(x,y,z) {
      var c = coord(x,y,z);
      var pile = HTomb.World.items[c] || ItemContainer();
      pile.push(this.entity);
      if (pile.length>0) {
        HTomb.World.items[c] = pile;
        pile.parent = HTomb.World.items;
      }
    },
    remove: function() {
      var it = this.entity;
      var c = coord(it.x,it.y,it.z);
      var pile = HTomb.World.items[c];
      // remove it from the old pile
      if (pile) {
        if (pile.contains(this.entity)) {
          pile.remove(this.entity);
          if (pile.length===0) {
            delete HTomb.World.items[c];
          }
        }
      }
    },
    onAdd: function() {
      if (this.entity.stackSize && this.stackable && this.n===null) {
        this.n = this.entity.stackSize();
      }
    }
  });
  HTomb.Things.defineBehavior({
    template: "Feature",
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
    }
  });
  HTomb.Things.defineBehavior({
    template: "Zone",
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
    }
  });
  HTomb.Things.defineBehavior({
    template: "Turf",
    name: "turf",
    place: function(x,y,z) {
      var c = coord(x,y,z);
      var turfs = HTomb.World.turfs;
      if (turfs[c]) {
        turfs[c].remove();
      }
      turfs[c] = this.entity;
    },
    remove: function() {
      var l = this.entity;
      var c = coord(l.x,l.y,l.z);
      var turfs = HTomb.World.turfs;
      delete turfs[c];
    }
  });

  HTomb.Things.defineBehavior({
    template: "Liquid",
    name: "liquid",
    infinite: true,
    each: ["infinite"],
    shimmer: function() {
      var bg = ROT.Color.fromString(this.entity.bg);
      bg = ROT.Color.randomize(bg,[0, 0, 25]);
      bg = ROT.Color.toHex(bg);
      return bg;
    },
    darken: function() {
      var bg = ROT.Color.fromString(this.entity.bg);
      bg = ROT.Color.multiply(bg,[72,128,192]);
      bg = ROT.Color.toHex(bg);
      return bg;
    }
  });

  HTomb.Things.defineCreature = function(args) {
    args = args || {};
    args.behaviors = args.behaviors || {};
    args.behaviors.Creature = args.behaviors.Creature || {};
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
    args.behaviors.Item = item;
    HTomb.Things.defineEntity(args);
    //if (args.asFeature) {
    //  var feature = {};
    //  feature.template = args.asFeature.template || args.feature + "Feature";
    //  feature.name = args.asFeature.name || args.name;
    //}
  };
  HTomb.Things.defineFeature = function(args) {
    args = args || {};
    args.behaviors = args.behaviors || {};
    args.behaviors.Feature = args.behaviors.Feature || {};
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineZone = function(args) {
    args = args || {};
    args.behaviors = args.behaviors || {};
    args.behaviors.Zone = args.behaviors.Zone || {};
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineTurf = function(args) {
    args = args || {};
    var turf = {};
    args.behaviors = args.behaviors || {};
    args.behaviors.Turf = args.behaviors.Turf || {};
    args.plural = true;
    HTomb.Things.defineEntity(args);
  };



  function ItemContainer(args) {
    var container = Object.create(Array.prototype);
    for (var method in ItemContainer.prototype) {
      if (ItemContainer.prototype.hasOwnProperty(method)) {
        container[method] = ItemContainer.prototype[method];
      }
    }
    if (Array.isArray(args)) {
      for (var i=0; i<args.length; i++) {
        container.push(args[i]);
      }
    }
    return container;
  }
  HTomb.ItemContainer = ItemContainer;
  ItemContainer.prototype = {
    parent: null,
    getParent: function() {
      if (parent===HTomb.World.items) {
        for (key in HTomb.World.items) {
          if (HTomb.World.items[key]===this) {
            return c = HTomb.decoord(key);
          }
        }
      } else {
        return parent;
      }
    },
    absorbStack: function(item) {
      var one;
      var two;
      for (var i=0; i<this.length; i++) {
        if ((this[i].template===item.template) && (this[i].item.n<this[i].item.maxn)) {
          one = item.item.n;
          two = this[i].item.n;
          if ((one+two)>item.item.maxn) {
            this[i].item.n = item.item.maxn;
            item.item.n = one+two-item.item.maxn;
          } else {
            this[i].item.n = one+two;
            item.item.n = 0;
          }
        }
      }
      if (item.item.n>0) {
        Array.prototype.push.call(this,item)
        item.item.container = this;
      } else {
        item.despawn();
      }
    },
    push: function(item) {
      if (item.item.stackable) {
        this.absorbStack(item);
      } else {
        Array.prototype.push.call(this,item);
        item.item.container = this;
      }
    },
    unshift: function(item) {
      if (item.item.stackable) {
        this.absorbStack(item);
      } else {
        Array.prototype.unshift.call(this,arg);
        item.item.container = this;
      }
    },
    contains: function(item) {
      var indx = this.indexOf(item);
      if (indx>-1) {
        return true;
      } else {
        return false;
      }
    },
    containsAny: function(template) {
      for (var i=0; i<this.length; i++) {
        if (this[i].template===template) {
          return true;
        }
      }
      return false;
    },
    shift: function() {
      var item = Array.prototype.shift.call(this);
      item.item.container = null;
      return item;
    },
    pop: function() {
      var item = Array.prototype.pop.call(this);
      item.item.container = null;
      return item;
    },
    remove: function(item) {
      var indx = this.indexOf(item);
      if (indx>-1) {
        item.item.container = null;
        return this.splice(indx,1);
      }
    },
    list: function() {
      var mesg = "";
      for (var i = 0; i<this.length; i++) {
        if (i>0) {
          mesg+=" ";
        }
        mesg+=this[i].describe();
        if (i===this.length-2) {
          mesg = mesg + ", and";
        } else if (i<this.length-1) {
          mesg = mesg + ",";
        }
      }
      return mesg;
    }
  }

return HTomb;
})(HTomb);
