// The Entity submodule defines the basic functionality for entities
HTomb = (function(HTomb) {
  "use strict";
  var creatures = HTomb.World.creatures;
  var items = HTomb.World.items;
  var features = HTomb.World.features;
  var zones = HTomb.World.zones;
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;

  HTomb.Entity.templates = {};
  // Define a new template
  HTomb.Entity.define = function(properties) {
    if (!properties || !properties.template) {
      HTomb.Debug.pushMessage("invalid template definition");
      return;
    }
    var template = {};
    for (var prop in properties) {
      template[prop] = properties[prop];
    }
    // Maybe instead of .create() we should just provide named methods?
    HTomb.Entity.templates[properties.template] = template;
  };
  //fully generic entity
  var entity = {
    isCreature: false,
    isItem: false,
    isFeature: false,
    isZone: false,
    _x: null,
    _y: null,
    _z: null,
    symbol: ' ',
    behaviors: [],
    cleanup: function() {}
  };
  // Place an entity in the play area according to its type flags
  entity.place = function(x,y,z) {
    if (this.isCreature) {
      delete creatures[this._x*LEVELW*LEVELH + this._y*LEVELH + this._z];
      creatures[x*LEVELW*LEVELH + y*LEVELH + z] = this;
    }
    if (this.isItem) {
      var pile = items[this._x*LEVELW*LEVELH + this._y*LEVELH + this._z];        // remove it from the old pile
      if (pile) {
        pile.splice(pile.indexOf(this));
        if (pile.length===0) {
          delete items[this._x*LEVELW*LEVELH + this._y*LEVELH + this._z];
        }
      }
      // put it on the new pile
      pile = items[x*LEVELW*LEVELH + y*LEVELH + z];
      if (pile===undefined) {
        pile = items[x*LEVELW*LEVELH + y*LEVELH + z] = [];
      }
      if (this.stack) {
        this.stack.stackInto(pile);
      } else {
        pile.push(this);
      }
    }
    if (this.isFeature) {
      delete features[this._x*LEVELW*LEVELH + this._y*LEVELH + this._z];
      features[x*LEVELW*LEVELH + y*LEVELH + z] = this;
    }
    if (this.isZone) {
      delete zones[this._x*LEVELW*LEVELH + this._y*LEVELH + this._z];
      zones[x*LEVELW*LEVELH + y*LEVELH + z] = this;
    }
    this._x = x;
    this._y = y;
    this._z = z;
    // Fire off the onPlace method, if applicable
    if (this.onPlace) {
      this.onPlace(x,y,z);
    }
  };
  // Remove the entity from the playing area
  // Eventually this should split from actually destroying an entity
  entity.remove = function() {
    var x = this._x;
    var y = this._y;
    var z = this._z;
    //eventually need to clean up listeners
    if (this.isCreature) {
      delete creatures[this._x*LEVELW*LEVELH + this._y*LEVELH + this._z];
      creatures[x*LEVELW*LEVELH + y*LEVELH + z] = this;
    }
    if (this.isItem) {
      var pile = items[x*LEVELW*LEVELH + y*LEVELH + z];
      // remove it from the old pile
      if (pile) {
        pile.splice(pile.indexOf(this),1);
        if (pile.length===0) {
          delete items[this._x*LEVELW*LEVELH + this._y*LEVELH + this._z];
        }
      }
    }
    if (this.isFeature) {
      delete features[this._x*LEVELW*LEVELH + this._y*LEVELH + this._z];
    }
    if (this.isZone) {
      var tsk = this.task;
      if (tsk.assignee) {
        tsk.unassign();
      }
      HTomb.Tasks.taskList.splice(HTomb.Tasks.taskList.indexOf(tsk),1);
      delete zones[this._x*LEVELW*LEVELH + this._y*LEVELH + this._z];
    }
    this._x = null;
    this._y = null;
    this._z = null;
  };
  // Return the square the entity is on
  entity.getSquare = function() {
    return HTomb.Tiles.getSquare(this._x,this._y,this._z);
  };
  // This silly function blocks you from directly accessing x, y, and z...why did I do this?
  var blockProperty = function(obj,prop) {
    Object.defineProperty(obj,prop, {
      get: function() {throw new Error("Use underscore when calling " + prop);},
      set: function(val) {throw new Error("Use 'place' instead of setting " + prop + " directly.");}
    });
  };
  blockProperty(entity,'x');
  blockProperty(entity,'y');
  blockProperty(entity,'z');

  // Describe the entity as a human-readable string
  entity.describe = function() {
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
  };

  // Create an entity using a template...should it just be a named method like behaviors use?
  HTomb.Entity.create = function(tname) {
    // There should be a way to pass some additional options
    var ent = Object.create(entity);
    ent.behaviors = [];
    var properties = HTomb.Entity.templates[tname];
    for (var prop in properties) {
      // Add all the default behaviors
      if (prop==="behaviors") {
        ent.behaviors = [];
        for (var beh in properties.behaviors) {
          ent.addBehavior(properties.behaviors[beh]);
        }
      } else if (prop==="fg") {
        var c;
        if (Array.isArray(properties.fg)) {
          c = properties.fg[Math.floor(Math.random()*properties.fg.length)];
        } else {
          c = properties.fg;
        }
        c = ROT.Color.fromString(properties.fg);
        if (properties.randomColor>0) {
          c = ROT.Color.randomize(c,[properties.randomColor,properties.randomColor,properties.randomColor]);
        }
        c = ROT.Color.toHex(c);
        ent.fg = c;
      } else if (prop==="symbol") {
        if (Array.isArray(properties.symbol)) {
          ent.symbol = properties.symbol[Math.floor(Math.random()*properties.symbol.length)];
        } else {
          ent.symbol = properties.symbol;
        }
      } else {
        ent[prop] = properties[prop];
      }
    }
    HTomb.World.Things.assign(ent);
    return ent;
  };

  // Behaviors define special activities and properties of entities
  HTomb.Behavior.templates = {};
  // Define a behavior template
  HTomb.Behavior.define = function(properties) {
    if (!properties || !properties.template) {
      HTomb.Debug.pushMessage("invalid template definition");
      return;
    }
    HTomb.Behavior[properties.template] = function(options) {
      var beh = {};
      for (var p in properties) {
        beh[p] = properties[p];
      }
      // should be a way to pass options?
      //for (var o in options) {
      //  beh[o] = options[o];
      //}
      beh.options = options;
      return beh;
    };
  };
  // Add a Behavior to an Entity
  entity.addBehavior = function(beh) {
    var options = beh.options || {};
    this[beh.name] = {entity: this};
    for (var p in beh) {
      if (p!=="name") {
        this[beh.name][p] = beh[p];
      }
    }
    if (this[beh.name].init) {
      this[beh.name].init(options);
    }
  };
  // Describe the entity as a menu options
  HTomb.Entity.menuItem = function(template) {
    var item = {};
    for (var p in HTomb.Entity.templates[template]) {
      item[p] = HTomb.Entity.templates[template][p];
    }
    item.describe = function() {return entity.describe.call(item);};
    return item;
  };
  //http://unicode-table.com/en/
  //"\u02C4" is upward Slope, 5 is downward
  return HTomb;
})(HTomb);
