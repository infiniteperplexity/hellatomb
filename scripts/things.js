HTomb = (function(HTomb) {
  "use strict";
  var coord = HTomb.Utils.coord;

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
    details: function() {
      return ["This is " + this.describe() + "."];
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
      t.onDefine(args);
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
