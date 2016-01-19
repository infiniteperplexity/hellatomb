HTomb = (function(HTomb) {
  "use strict";
  var creatures = HTomb.World.creatures;
  var items = HTomb.World.items;
  var features = HTomb.World.features;
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;

  HTomb.Entity.templates = {};
  HTomb.Entity.define = function(properties) {
    if (!properties || !properties.template) {
      console.log("invalid template definition");
      return;
    }
    var template = {};
    for (var prop in properties) {
      template[prop] = properties[prop];
    }
    HTomb.Entity.templates[properties.template] = template;
  };
  //fully generic entity
  var entity = {
    isCreature: false,
    isItem: false,
    isFeature: false,
    _x: null,
    _y: null,
    _z: null,
    symbol: ' ',
    behaviors: []
  };
  entity.place = function(x,y,z) {
    if (this.isCreature) {
      delete creatures[this._x*LEVELW*LEVELH + this._y*LEVELH + this._z];
      creatures[x*LEVELW*LEVELH + y*LEVELH + z] = this;
      //assume creatures are always actors for now
      if (HTomb.World.actors.indexOf(this)!==-1) {
        HTomb.World.actors.push(this);
      }
    }
    if (this.isItem) {
      var pile = items[this._x*LEVELW*LEVELH + this._y*LEVELH + this._z];
      if (pile) {
        pile.splice(pile.indexOf(this));
        if (pile.length===0) {
          delete items[this._x*LEVELW*LEVELH + this._y*LEVELH + this._z];
        }
      }
      pile = items[x*LEVELW*LEVELH + y*LEVELH + z];
      if (pile===undefined) {
        pile = items[x*LEVELW*LEVELH + y*LEVELH + z] = [];
      }
      pile.push(this);
    }
    if (this.isFeature) {
      delete features[this._x*LEVELW*LEVELH + this._y*LEVELH + this._z];
      features[x*LEVELW*LEVELH + y*LEVELH + z] = this;
    }
    this._x = x;
    this._y = y;
    this._z = z;
  };

  var blockProperty = function(obj,prop) {
    Object.defineProperty(obj,prop, {
      get: function() {throw new Error("Use underscore when calling " + prop);},
      set: function(val) {throw new Error("Use 'place' instead of setting " + prop + " directly.");}
    });
  };
  blockProperty(entity,'x');
  blockProperty(entity,'y');
  blockProperty(entity,'z');

  HTomb.Entity.create = function(tname) {
    var ent = Object.create(entity);
    ent.behaviors = [];
    var properties = HTomb.Entity.templates[tname];
    for (var prop in properties) {
      if (prop==="behaviors") {
        ent.behaviors = [];
        for (var beh in properties.behaviors) {
          HTomb.Entity.addBehavior(properties.behaviors[beh], ent);
        }
      } else {
        ent[prop] = properties[prop];
      }
    }
    return ent;
  };

  // behaviors
  HTomb.Behavior.templates = {};
  HTomb.Behavior.define = function(properties) {
    if (!properties || !properties.template) {
      console.log("invalid template definition");
      return;
    }
    HTomb.Behavior[properties.template] = function(options) {
      options = options || {};
      var beh = {};
      for (var p in properties) {
        beh[p] = properties[p];
      }
      for (var o in options) {
        beh[o] = options[o];
      }
      return beh;
    };
  };
  HTomb.Entity.addBehavior = function(beh, ent) {
    ent[beh.name] = {entity: ent};
    for (var p in beh) {
      if (p!=="name") {
        ent[beh.name][p] = beh[p];
      }
    }
    if (ent[beh.name].init) {
      ent[beh.name].init();
    }
  };
  //http://unicode-table.com/en/
  //"\u02C4" is upward Slope, 5 is downward

  return HTomb;
})(HTomb);
