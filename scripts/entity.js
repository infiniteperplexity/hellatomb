HTomb = (function(HTomb) {
  "use strict";

  HTomb.Entity.templates = {};
  HTomb.Entity.define = function(properties) {
    if (!properties || !properties.name) {
      console.log("invalid template definition");
      return;
    }
    var template = {};
    for (var prop in properties) {
      template[prop] = properties[prop];
    }
    HTomb.Entity.templates[properties.name] = template;
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
    components: []
  };

  var creatures = HTomb.World.creatures;
  var items = HTomb.World.items;
  var features = HTomb.World.features;
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
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
      pile = items[x*LEVELW*LEVELH + y*LEVELH + z] || [];
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
    ent.components = [];
    var properties = HTomb.Entity.templates[tname];
    for (var prop in properties) {
      if (prop==="components") {
        ent.components = [];
        for (var comp in properties.components) {
          ent.components[comp] = properties.components[comp];
        }
      } else {
        ent[prop] = properties[prop];
      }
    }
    return ent;
  };

  HTomb.Entity.define({
      name: "Necromancer",
      isCreature: true,
      symbol: "@",
      fg: "lavender"
  });

  return HTomb;
})(HTomb);
