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
    behaviors: [],
    cleanup: function() {}
  };
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
    this._x = x;
    this._y = y;
    this._z = z;
    if (this.onPlace) {
      this.onPlace(x,y,z);
    }
  };
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
    this._x = null;
    this._y = null;
    this._z = null;
  };
  entity.getSquare = function() {
    return HTomb.World.getSquare(this._x,this._y,this._z);
  };
  var blockProperty = function(obj,prop) {
    Object.defineProperty(obj,prop, {
      get: function() {throw new Error("Use underscore when calling " + prop);},
      set: function(val) {throw new Error("Use 'place' instead of setting " + prop + " directly.");}
    });
  };
  entity.describe = function() {
    if (this.isItem && this.stack && this.stack.n>1) {
      return (this.stack.n + " " +this.name+"s");
    } else {
      var first = this.name[0];
      if (first==="a" || first==="e" || first==="i" || first==="o" || first==="u") {
        return ("an " + this.name);
      } else {
        return ("a " + this.name);
      }
    }
  }
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
          ent.addBehavior(properties.behaviors[beh]);
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
  entity.addBehavior = function(beh) {
    this[beh.name] = {entity: this};
    for (var p in beh) {
      if (p!=="name") {
        this[beh.name][p] = beh[p];
      }
    }
    if (this[beh.name].init) {
      this[beh.name].init();
    }
  };
  //http://unicode-table.com/en/
  //"\u02C4" is upward Slope, 5 is downward
  return HTomb;
})(HTomb);
