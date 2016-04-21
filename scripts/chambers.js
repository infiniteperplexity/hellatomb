HTomb = (function(HTomb) {
  "use strict";

  // Might like to have animations
  HTomb.Things.define({
    template: "Chamber",
    name: "chamber",
    height: 3,
    width: 3,
    features: [],
    symbols: [],
    fg: "white",
    fgs: [],
    ingredients: {},
    onDefine: function() {
      HTomb.Things.defineFeature({
        template: this.template+"Feature",
        name: this.name,
        chamber: null,
        onRemove: function() {
          this.chamber.remove();
        }
      })
    },
    onCreate: function() {
      this.features = [];
      for (let i=0; i<this.height*this.width; i++) {
        let f = HTomb.Things[this.template+"Feature"]({
          symbol: this.symbols[i],
          fg: this.fgs[i] || this.fg,
          chamber: this
        });
        this.features.push(f);
      }
    },
    place: function(x,y,z) {
      for (let j=0; j<this.height; j++) {
        for (let i=0; i<this.width; i++) {
          this.features[i].place(x+i,y+j,z);
        }
      }
    },
    remove: function() {
      for (let i=0; i<this.features.length; i++) {
        if (this.features[i].x!==null) {
          this.features[i].remove();
        }
      }
    }
  });

  HTomb.Things.defineChamber({
    template: "Mortuary",
    name: "mortuary",
    symbols: ["\u25A1","\u25A1","\u25A1","\u25A1","\u25A1","\u25A1","\u25A1","\u25A1","\u25A1"],
    fg: "#555555"
  });

return HTomb;
})(HTomb);
