HTomb = (function(HTomb) {
  "use strict";

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

  var AIBehavior = {
    name: "ai",
    target: null,
    mood: null,
    init: function(){this.path = [];},
    go: function() {console.log(this.name + " is thinking...");}
  };
  var MovementBehavior = {
    name: "movement",
    walks: true,
    canPass: function(x,y,z) {
      if (x<0 || x>=LEVELW || y<0 || y>=LEVELH) {
        return false;
      }
      var square = HTomb.World.getSquare(x,y,z);
      if (square.terrain.solid===true && this.movement.phases===undefined) {
        return false;
      } else if (square.terrain.fallable===true && this.movement.flies===undefined) {
        if (square.feature!==undefined && square.feature.template==="DownSlope") {
          return true;
        } else {
          return false;
        }
      } else if (this.movement.walks===true) {
        return true;
      } else {
        return false;
      }
    }
  };
  var StackableBehavior = {
    name: "stack",
    maxn: 10,
    n: 1
  };
  HTomb.Entity.addBehavior = function(beh, ent) {
    ent[beh.name] = {};
    for (var p in beh) {
      if (typeof(beh[p])==="function") {
        ent[beh.name][p] = beh[p].bind(ent);
      } else if (p!=="name") {
        ent[beh.name][p] = beh[p];
      }
    }
  };
  //http://unicode-table.com/en/
  //"\u02C4" is upward Slope, 5 is downward
  HTomb.Entity.define({
      template: "Necromancer",
      name: "the player",
      isCreature: true,
      symbol: "@",
      fg: "#D888FF",
      behaviors: [AIBehavior, MovementBehavior]
  });

  HTomb.Entity.define({
      template: "UpSlope",
      name: "upward slope",
      isFeature: true,
      symbol: "\u02C4"
  });
  HTomb.Entity.define({
      template: "DownSlope",
      name: "downward slope",
      isFeature: true,
      symbol: "\u02C5"
  });
  HTomb.Entity.define({
    template: "Rock",
    name: "rock",
    isItem: true,
    symbol: "*",
    behaviors: [StackableBehavior]
  });
  HTomb.Entity.define({
    template: "Zombie",
    name: "zombie",
    isCreature: true,
    symbol: "z",
    fg: "green",
    behaviors: [AIBehavior, MovementBehavior]
  });

  return HTomb;
})(HTomb);
