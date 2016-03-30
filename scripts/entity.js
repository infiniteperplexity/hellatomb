HTomb = (function(HTomb) {
  "use strict";
  var coord = HTomb.Utils.coord;
  // Define a generic entity that occupies a tile space
  HTomb.Things.define({
    template: "Entity",
    name: "entity",
    parent: "Thing",
    x: null,
    y: null,
    z: null,
    behaviors: {},
    myBehaviors: [],
    each: ["x","y","z","reference"],
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
      for (var b in this.myBehaviors) {
        if (this.myBehaviors[b].onPlace) {
          this.myBehaviors[b].onPlace();
        }
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
      for (var b in this.myBehaviors) {
        if (this.myBehaviors[b].onRemove) {
          this.myBehaviors[b].onRemove();
        }
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
      this.reference = null;
      HTomb.Events.publish({type: "Destroy", entity: this});
      for (var i=0; i<this.myBehaviors.length; i++) {
        var b = this.myBehaviors[i];
        HTomb.Events.unsubscribeAll(b);
      }
      HTomb.Events.unsubscribeAll(this);
      this.remove();
    },
    onDespawn: function() {
      this.remove();
    },
    describe: function() {
      // add options for capitalization?
      if (this.zone) {
        return this.name;
      }
      // should I handle this with an "onDescribe" function?
      if (this.item && this.item.stackable && this.item.n>1) {
        if (this.plural!==true) {
          return (this.item.n + " " +this.name+"s");
        } else {
          return (this.item.n + " " +this.name);
        }
      } else {
        if (this.plural===true) {
          return this.name;
        }
        // pick the correct article
        var first = this.name[0];
        if (first==="a" || first==="e" || first==="i" || first==="o" || first==="u") {
          return ("an " + this.name);
        } else {
          return ("a " + this.name);
        }
      }
    },
    fall: function() {
      var g = HTomb.Tiles.groundLevel(this.x,this.y,this.z);
      if (this.creature) {
        if (HTomb.World.creatures[coord(this.x,this.y,g)]) {
          alert("haven't decided how to handle falling creature collisions");
        } else {
          HTomb.GUI.sensoryEvent(this.describe() + " falls " + (this.z-g) + " stories!",this.x,this.y,this.z);
          this.place(this.x,this.y,g);
        }
      }
      if (this.item) {
        HTomb.GUI.sensoryEvent(this.describe() + " falls " + (this.z-g) + " stories!",this.x,this.y,this.z);
        this.place(this.x,this.y,g);
      }
      HTomb.GUI.render();
    },
    onCreate: function() {
      this.myBehaviors = [];
      // Add behaviors to entity
      for (var b in this.behaviors) {
        if (typeof(HTomb.Things[b])!=="function") {
            console.log("Problem with behavior " + b + " for " + this.describe());
        }
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
      ent.myBehaviors.push(this);
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
    },
    die: function() {
      //maybe check to see if the parent entity has a different "die" function
      HTomb.GUI.sensoryEvent(this.entity.describe() + " dies.",this.entity.x,this.entity.y,this.entity.z);
      this.entity.destroy();
    }
  });

  HTomb.Things.defineBehavior({
    template: "Item",
    name: "item",
    stackable: false,
    n: 1,
    maxn: 10,
    container: null,
    owned: true,
    bulk: 10,
    each: ["n","owned"],
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
    makeStack: function() {
      if (this.entity.stackSize && this.stackable && this.n===null) {
        this.n = 1+HTomb.Utils.diceUntil(3,3);
      }
    }
  });

  HTomb.Things.defineBehavior({
    template: "Feature",
    name: "feature",
    yields: null,
    integrity: null,
    each: ["integrity","yields"],
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
    dismantle: function(optionalTask) {
      if (this.integrity===null) {
        this.integrity=5;
      }
      this.integrity-=1;
      if (this.integrity<=0) {
        this.harvest();
        if (optionalTask) {
          optionalTask.complete();
        }
      }
    },
    harvest: function() {
      if (this.yields!==null) {
        var x = this.entity.x;
        var y = this.entity.y;
        var z = this.entity.z;
        for (var template in this.yields) {
          var n = HTomb.Utils.diceUntil(2,2);
          if (this.yields[template].nozero) {
            n = Math.max(n,1);
          }
          for (var i=0; i<n; i++) {
            var thing = HTomb.Things[template]().place(x,y,z);
          }
        }
      }
      this.entity.destroy();
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
      bg = ROT.Color.randomize(bg,[bg[0]/16, bg[1]/16, bg[2]/16]);
      bg = ROT.Color.toHex(bg);
      return bg;
    },
    darken: function() {
      var bg = ROT.Color.fromString(this.entity.bg);
      bg = ROT.Color.multiply(bg,[72,128,192]);
      bg = ROT.Color.toHex(bg);
      return bg;
    },
    flood: function() {
      var x = this.entity.x;
      var y = this.entity.y;
      var z = this.entity.z;
      var t = HTomb.World.turfs[coord(x,y,z-1)];
      var water;
      if (HTomb.World.tiles[z-1][x][y].solid!==true && t.liquid===undefined) {
        water = HTomb.Things.Water().place(x,y,z);
        water.liquid.flood();
        // if we flood below, don't flood to the sides...should this happen each turn?
        return;
      }
      var neighbors = HTomb.Tiles.neighbors(this.entity.x,this.entity.y,4);
      for (var i=0; i<neighbors.length; i++) {
        x = neighbors[i][0];
        y = neighbors[i][1];
        t = HTomb.World.turfs[coord(x,y,z)];
        if (HTomb.World.tiles[z][x][y].solid===true || (t && t.liquid)) {
          continue;
        }
        water = HTomb.Things.Water().place(x,y,z);
        water.liquid.flood();
      }
    }
  });

  HTomb.Things.defineCreature = function(args) {
    args = args || {};
    if (args.parent!==undefined) {
      var parent = HTomb.Things.templates[args.parent];
      for (var arg in parent) {
        if (args[arg]===undefined) {
          if (Object.keys(parent[arg]).length>0) {
            console.log("need to handle inheritance of " + arg);
            continue;
          }
          args[arg] = parent[arg];
        }
      }
    }
    args.behaviors = args.behaviors || {};
    args.behaviors.Creature = {};
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineItem = function(args) {
    args = args || {};
    args.behaviors = args.behaviors || {};
    if (args.parent!==undefined) {
      var parent = HTomb.Things.templates[args.parent];
      for (var arg in parent) {
        if (args[arg]===undefined) {
          if (Object.keys(parent[arg]).length>0) {
            console.log("need to handle inheritance of " + arg);
            continue;
          }
          args[arg] = parent[arg];
        }
      }
    }
    var item = {};
    // okay I see where the problem is...this won't capture the parents' arguments
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
  };
  HTomb.Things.defineFeature = function(args) {
    args = args || {};
    if (args.parent!==undefined) {
      var parent = HTomb.Things.templates[args.parent];
      for (var arg in parent) {
        if (args[arg]===undefined) {
          if (Object.keys(parent[arg]).length>0) {
            console.log("need to handle inheritance of " + arg);
            continue;
          }
          args[arg] = parent[arg];
        }
      }
    }
    args.behaviors = args.behaviors || {};
    var feature = {};
    if (args.yields) {
      feature.yields = args.yields;
    }
    args.behaviors.Feature = feature;
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineZone = function(args) {
    args = args || {};
    if (args.parent!==undefined) {
      var parent = HTomb.Things.templates[args.parent];
      for (var arg in parent) {
        if (args[arg]===undefined) {
          if (Object.keys(parent[arg]).length>0) {
            console.log("need to handle inheritance of " + arg);
            continue;
          }
          args[arg] = parent[arg];
        }
      }
    }
    args.behaviors = args.behaviors || {};
    args.behaviors.Zone = {};
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineTurf = function(args) {
    args = args || {};
    if (args.parent!==undefined) {
      var parent = HTomb.Things.templates[args.parent];
      for (var arg in parent) {
        if (args[arg]===undefined) {
          if (Object.keys(parent[arg]).length>0) {
            console.log("need to handle inheritance of " + arg);
            continue;
          }
          args[arg] = parent[arg];
        }
      }
    }
    var turf = {};
    args.behaviors = args.behaviors || {};
    args.behaviors.Turf = {};
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
            return c = HTomb.Utils.decoord(key);
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
    countAll: function(template) {
      var tally = 0;
      for (var i=0; i<this.length; i++) {
        if (this[i].template===template) {
          tally+=this[i].item.n;
        }
      }
      return tally;
    },
    getFirst: function(template) {
      for (var i=0; i<this.length; i++) {
        if (this[i].template===template) {
          return this[i];
        }
      }
      return null;
    },
    getLast: function(template) {
      for (var i=this.length-1; i>=0; i--) {
        if (this[i].template===template) {
          return this[i];
        }
      }
      return null;
    },
    takeOne: function(i_or_t) {
      if (typeof(i_or_t)!=="string" && i_or_t.template) {
        i_or_t = i_or_t.template;
      }
      if (HTomb.Things.templates[i_or_t].stackable!==true) {
        return this.getFirst(i_or_t);
      } else {
        var last = this.getLast(i_or_t);
        if (last.item.n===1) {
          return last;
        } else {
          last.item.n-=1;
          var single = HTomb.Things[last.template]();
          single.item.n = 1;
          return single;
        }
      }
    },
    take: function(i_or_t, n) {
      n = n || 1;
      if (typeof(i_or_t)!=="string" && i_or_t.template) {
        i_or_t = i_or_t.template;
      }
      if (HTomb.Things.templates[i_or_t].stackable!==true) {
        return this.getFirst(i_or_t);
      } else {
        var last = this.getLast(i_or_t);
        if (last.item.n<=n) {
          return last;
        } else {
          last.item.n-=n;
          var taken = HTomb.Things[last.template]();
          taken.item.n = n;
          return taken;
        }
      }
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
    },
    lineList: function(spacer) {
      var buffer = [];
      for (var i = 0; i<this.length; i++) {
        buffer.push([spacer,this[i].describe()]);
      }
      return buffer;
    },
    head: function() {
      return this[0];
    },
    tail: function() {
      return this[this.length-1];
    }
  };

return HTomb;
})(HTomb);
