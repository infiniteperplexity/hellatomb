HTomb = (function(HTomb) {
  "use strict";
  var coord = HTomb.coord;


  // The global list of known things
  HTomb.World.things = [];
  // The global list of known templates
  HTomb.Things.templates = {};
  HTomb.Things.static = [];



  var thing = {
    spawn: function() {
      // Add to the global things table
      HTomb.World.Things.push(this);
      if (this.onSpawn) {
        this.onSpawn();
      }
    },
    despawn: function() {
    // remove from the global things table
      HTomb.World.Things.splice(this.thingId,0);
      if (this.onDespawn) {
        this.onDespawn();
      }
    },
    stringify: function() {
      var json = JSON.stringify(this, function(key, val) {
        // Fully stringify if it is a top-level item on the global things list
        if (this===HTomb.World.things) {
          return val;
        // If it is a static thing than stringify it as a number only...will this work?
        } else if (val.static===true) {
          return HTomb.Things.static.indexOf(val);
        } else {
          // Otherwise serialize only the ID
          return {thingId: this.thingId};
        }
      });
      return json;
    },
    get thingId () {
      // Calculate thingId dynamically
      return HTomb.World.Things.indexOf(this);
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
    each: []
  };



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
    // Add to the list of templates
    HTomb.Things.templates[args.template] = t;
    // Don't fire onDefine for the top-level thing
    if (t.onDefine && args.parent!=="Thing") {
      t.onDefine();
    }
    if (t.static===true) {
      HTomb.Things.static.push(t);
    }
  };



  // Create a new object based on the template
  HTomb.Things.create = function(template, args) {
    var t = Object.create(HTomb.Things.templates[template]);
    if (t.static===true) {
      HTomb.Debug.pushMessage("Can't create a static thing");
      return;
    }
    for (var prim in HTomb.Things.templates[template]) {
      if (t.each.indexOf(prim)>=0) {
      // if the property is listed as dynamic then copy it
        t[prim] = HTomb.Things.template[template];
      }
    }
    // Copy the arguments onto the thing
    for (var arg in args) {
      t[arg] = args[arg];
    }
    // Do all "on spawn" tasks
    t.spawn();
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
    behaviors: [],
    each: ["x","y","z","behaviors"],
    place: function(x,y,z) {
      var c = coord(x,y,z);
      if (this.isCreature) {
        delete creatures[c];
        creatures[c] = this;
      }
      if (this.isItem) {
        var pile = items[c];        // remove it from the old pile
        if (pile) {
          pile.splice(pile.indexOf(this));
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
      if (this.isFeature) {
        delete features[c];
        features[c] = this;
      }
      if (this.isZone) {
        delete zones[c];
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
      if (this.isCreature) {
        delete creatures[c];
        creatures[c] = this;
      }
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
      if (this.isFeature) {
        delete features[c];
      }
      if (this.isZone) {
        var tsk = this.task;
        if (tsk.assignedTo) {
          tsk.unassign();
        }
        //HTomb.Tasks.taskList.splice(HTomb.Tasks.taskList.indexOf(tsk),1);
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
    onCreate: function(ent) {
      var beh;
      // Add behaviors to entity
      for (var i=0; i<ent.behaviors.length; i++) {
        ent.behaviors[i].addToEntity(ent);
      }
      // Randomly choose symbol if necessary
      if (Array.isArray(ent.symbol)) {
        ent.symbol = ent.symbol[Math.floor(Math.random()*ent.symbol.length)];
      }
      // Randomly choose  color if necessary
      if (Array.isArray(ent.fg)) {
        ent.fg = ent.fg[Math.floor(Math.random()*ent.fg.length)];
      }
      // Randomly perturb color, if necessary
      if (ent.randomColor>0 && ent.fg) {
        if (ent.fg) {
          var c = ROT.Color.fromString(ent.fg);
          c = ROT.Color.randomize(c,[ent.randomColor, ent.randomColor, ent.randomColor]);
          c = ROT.Color.toHex(c);
          ent.fg = c;
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
      // spin off a descendent of this object
      var beh = Object.create(this);
      ent[this.name] = beh;
      var options = this.options || {};
      for (var i=0; i<this.each.length; i++) {
        beh[this.each[i]] = this[this.each[i]];
      }
      beh.entity = ent;
      if (beh.init) {
        beh.init(options);
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
      var cr = this.assignedTo;
      if (cr.minion===undefined) {
        HTomb.Debug.pushMessage("Problem unassigning task");
      } else {
        this.assignedTo = null;
        cr.minion.unassign();
      }
    }
  });

return HTomb;
})(HTomb);