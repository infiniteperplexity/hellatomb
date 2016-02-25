HTomb = (function(HTomb) {
  "use strict";
  var coord = HTomb.coord;

  var thing = {
    template: "Thing",
    spawn: function() {
      // Add to the global things table
      HTomb.World.things.push(this);
      if (this.onSpawn) {
        this.onSpawn();
      }
    },
    despawn: function() {
    // remove from the global things table
      HTomb.World.things.splice(this.thingId,1);
      if (this.onDespawn) {
        this.onDespawn();
      }
    },
    get thingId () {
      // Calculate thingId dynamically
      return HTomb.World.things.indexOf(this);
    },
    set thingId (arg) {
      // not allowed
      HTomb.Debug.pushMessage("Not allowed to set thingId");
    },
    // Describe for an in-game message
    describe: function() {
      return this.name;
    },
    // Describe for an in-game list
    onList: function() {
      return this.describe();
    },
    // list any properties that are specific to eachs, such as current hit points
    each: ["template"]
  };
  // The global list of known templates
  HTomb.Things.templates = {Thing: thing};

  // define a template for creating things
  HTomb.Things.define = function(args) {
    if (args===undefined || args.template===undefined) {
      //HTomb.Debug.pushMessage("invalid template definition");
      return;
    }
    // Create based on generic thing
    var t;
    if (args.parent===undefined || (args.parent!=="Thing" && HTomb.Things.templates[args.parent]===undefined)) {
      args.parent = "Thing";
      HTomb.Debug.pushMessage("Warning: No or invalid parent type given.");
    }
    if (args.parent==="Thing") {
      t = Object.create(thing);
      // Create a new function...maybe not the best way to do this
      HTomb.Things["define" + args.template] = function(opts) {
        opts.parent = args.template;
        return HTomb.Things.define(opts);
      };
    } else {
      t = Object.create(HTomb.Things.templates[args.parent]);
      HTomb.Things[args.template] = function(opts) {
        // Create a shortcut function to create it
        return HTomb.Things.create(args.template, opts);
      };
    }
    // Add the arguments to the template
    for (var arg in args) {
      t[arg] = args[arg];
    }
    // concatenate "each" instead of overriding it
    if (t.hasOwnProperty("each")===false) {
      t.each = [];
    }
    if (t.parent && HTomb.Things.templates[t.parent]) {
      var par = HTomb.Things.templates[t.parent].each;
      for (var i=0; i<par.length; i++) {
        if (t.each.indexOf(par[i])===-1) {
          t.each.push(par[i]);
        }
      }
    }
    // Add to the list of templates
    HTomb.Things.templates[args.template] = t;
    // Don't fire onDefine for the top-level thing
    if (t.onDefine && args.parent!=="Thing") {
      t.onDefine();
    }
  };



  // Create a new object based on the template
  HTomb.Things.create = function(template, args) {
    if (HTomb.Things.templates[template]===undefined) {
      console.log([template,args]);
    }
    var t = Object.create(HTomb.Things.templates[template]);
    for (var i=0; i<t.each.length; i++) {
      t[t.each[i]] = HTomb.Things.templates[template][t.each[i]];
    }
    t.template = template;
    // Copy the arguments onto the thing
    // here's where we went wrong...
    for (var arg in args) {
      t[arg] = args[arg];
    }
    // Do all "on spawn" tasks
    t.spawn();
    if (t.onCreate) {
      t.onCreate(args);
    }
    // return the thing
    return t;
  };


  // Define a generic entity that occupies a tile space
  HTomb.Things.define({
    template: "Entity",
    name: "entity",
    parent: "Thing",
    isCreature: false,
    isItem: false,
    isFeature: false,
    isZone: false,
    x: null,
    y: null,
    z: null,
    symbol: "X",
    fg: "white",
    bg: "black",
    behaviors: {},
    each: ["x","y","z"],
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
        var pile = items[c];        // remove it from the old pile
        if (pile) {
          pile.splice(pile.indexOf(this),1);
          if (pile.length===0) {
            delete items[c];
          }
        }
        // put it on the new pile
        pile = items[c];
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
      if (this.init) {
        this.init(this.options);
      }
    },
    each: ["entity"]
  });

  // Define a generic task that gets workers assigned
  HTomb.Things.define({
    template: "Task",
    name: "task",
    parent: "Thing",
    assigner: null,
    assignee: null,
    zone: null,
    each: ["assigner","assignee"],
    onDefine: function() {
      if (this.zone) {
        var z = this.zone;
        z.isZone = true;
        // is this how we define an entity?
        HTomb.Things.define(z);
      }
    },
    tryAssign: function(cr) {
      HTomb.Debug.pushMessage("Probably shouldn't use default tryAssign()");
      this.assignTo(cr);
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
    }
  });

return HTomb;
})(HTomb);
