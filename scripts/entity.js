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
      this.x = x;
      this.y = y;
      this.z = z;
      if (this.onPlace) {
        this.onPlace(x,y,z);
      }
      var beh = this.getBehaviors();
      for (var i=0; i<beh.length; i++) {
        if (beh[i].onPlace) {
          beh[i].onPlace();
        }
      }
      return this;
    },
    getBehaviors: function() {
      var behaviors = [];
      for (var b in HTomb.Things.behaviors) {
        if (this[b]!==undefined) {
          behaviors.push(this[b]);
        }
      }
      return behaviors;
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
      this.reference = null;
      HTomb.Events.publish({type: "Destroy", entity: this});
      var beh = this.getBehaviors();
      for (var i=0; i<beh.length; i++) {
        var b = beh[i];
        b.despawn();
      }
      this.despawn();
    },
    onDespawn: function() {
      if (this.x!==null) {
        this.remove();
      }
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
    },
    onDefine: function() {
      HTomb.Things.behaviors.push(this.name);
    },
    each: ["entity"]
  });
  HTomb.Things.behaviors = [];

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
        }
        if (pile.length===0) {
          delete HTomb.World.items[c];
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

  HTomb.Things.defineCreature = function(args) {
    args = args || {};
    args.behaviors = args.behaviors || {};
    args.behaviors.Creature = {};
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineItem = function(args) {
    args = args || {};
    var parent = HTomb.Things.templates[args.parent] || {};
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
    } else if (args.stackable===undefined || parent.stackable) {
      item.stackable = parent.stackable;
      if (parent.n) {
        item.n = parent.n;
      }
      if (parent.maxn) {
        item.maxn = parent.maxn;
      }
    }
    args.behaviors.Item = item;
    HTomb.Things.defineEntity(args);

  };
  HTomb.Things.defineFeature = function(args) {
    args = args || {};
    // this should work since it uses inheritance
    var parent = HTomb.Things.templates[args.parent]  || {};
    args.behaviors = args.behaviors || {};
    var feature = {};
    feature.yields = args.yields || HTomb.Utils.clone(parent.yields) || null;
    args.behaviors.Feature = feature;
    HTomb.Things.defineEntity(args);
  };
  HTomb.Things.defineZone = function(args) {
    args = args || {};
    args.behaviors = args.behaviors || {};
    args.behaviors.Zone = {};
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
          this.remove(last);
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
          this.remove(last);
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
        this.splice(indx,1);
        // should this only happen if it's on the ground?
        item.remove();
        return item;
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
