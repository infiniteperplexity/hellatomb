HTomb = (function(HTomb) {
  "use strict";
  let coord = HTomb.Utils.coord;

  // Might like to have animations
  HTomb.Things.define({
    template: "Chamber",
    name: "chamber",
    x: null,
    y: null,
    z: null,
    height: 3,
    width: 3,
    features: [],
    symbols: [],
    fg: "white",
    fgs: [],
    ingredients: {},
    active: false,
    onDefine: function() {
      HTomb.Things.defineFeature({
        template: this.template+"Feature",
        name: this.name,
        position: null,
        onRemove: function() {
          let c = this.chamber;
          c.features.splice(c.features.indexOf(this),0);
          this.chamber.deactivate();
          if (c.features.length<=0) {
            c.despawn();
          }
        }
      });
    },
    onCreate: function() {
      this.features = [];
      return this;
    },
    activate: function() {
      this.active = true;
    },
    deactivate: function() {
      this.active = false;
    }
  });

  HTomb.Things.defineChamber({
    template: "Mortuary",
    name: "mortuary",
    symbols: ["\u2744","\u25AD","\u2744","\u25AD","\u2744","\u25AD","\u2744","\u25AD","\u2744"],
    fgs: ["#AAAAFF","#999999","#AAAAFF","#999999","#AAAAFF","#999999","#AAAAFF","#999999","#AAAAFF"]
  });

  HTomb.Things.defineChamber({
    template: "BoneCarvery",
    name: "bone carvery",
    symbols: ["\u2692","\u2620","\u2692","\u2620","\u2699","\u2620","\u2692","\u2620","\u2692"],
    fgs: ["#BBBBBB","#BBBBBB","#BBBBBB","#BBBBBB","#BBBBBB","#BBBBBB","#BBBBBB","#BBBBBB","#BBBBBB"]
  });

  HTomb.Things.defineChamber({
    template: "Carpenter",
    name: "carpenter",
    symbols: ["\u2261","/","\u2261","\u2699","\u2637","/","\u2261","/","\u2261"],
    fgs: ["#BB9922","#BB9922","#BB9922","#BB9922","#BB9922","#BB9922","#BB9922","#BB9922","#BB9922"]
  });

  HTomb.Things.defineChamber({
    template: "Library",
    name: "library",
    symbols: ["\u270D","\u270E","\u2710","/","\u25AD","\u26B4/","\u2261","/","\u2261"],
    fgs: ["#BB9922","#BB9922","#BB9922","#BB9922","#BB9922","#BB9922","#BB9922","#BB9922","#BB9922"]
  });

  HTomb.Things.defineChamber({
    template: "Laboratory",
    name: "library",
    symbols: ["\u2609","\u263F","\u2640","\u263D,""\u2641","\u2697","\u2642","\u2643","\u26A9"],
    fgs: ["#BB9922","#BB9922","#BB9922","#BB9922","#BB9922","#BB9922","#BB9922","#BB9922","#BB9922"]
  });



  HTomb.Things.defineTask({
    template: "ChamberTask",
    name: "create chamber",
    zoneTemplate: {
      template: "ChamberZone",
      name: "create chamber",
      bg: "#553300",
      position: null
    },
    makes: null,
    chambers: ["Mortuary","BoneCarvery","LumberMill"],
    designate: function(assigner) {
      var arr = [];
      for (var i=0; i<this.chambers.length; i++) {
        arr.push(HTomb.Things.templates[this.chambers[i]]);
      }
      var that = this;
      HTomb.GUI.choosingMenu("Choose a chamber:", arr, function(chamber) {
        function placeBox(squares, options) {
          let failed = false;
          let cham = null;
          for (let i=0; i<squares.length; i++) {
            let crd = squares[i];
            let f = HTomb.World.features[coord(crd[0],crd[1],crd[2])];
            if (HTomb.World.tiles[crd[2]][crd[0]][crd[1]]!==HTomb.Tiles.FloorTile) {
              failed = true;
            // a completed, partial version of the same chamber
            } else if (f && f.template===chamber.template+"Feature") {
              cham = f.chamber;
              // if it's already active, or misplaced
              if (cham.active===true || cham.x!==squares[0][0] || cham.y!==squares[0][1]) {
                failed = true;
              }
            // an incomplete version of the same chamber
          } else if (f && (f.template!=="IncompleteFeature" || f.makes!==chamber.template+"Feature")) {
              failed = true;
            }
          }
          if (failed===true) {
            HTomb.GUI.pushMessage("Can't build there.");
            return;
          }
          let ch;
          if (cham!==null) {
            ch = cham;
          } else {
            ch = HTomb.Things[chamber.template]();
            ch.x = squares[0][0];
            ch.y = squares[0][1];
            ch.z = squares[0][2];
          }
          for (let i=0; i<squares.length; i++) {
            let crd = squares[i];
            if (HTomb.World.features[coord(crd[0],crd[1],crd[2])] && HTomb.World.features[coord(crd[0],crd[1],crd[2])].template===ch.template+"Feature") {
              continue;
            }
            let zone = this.placeZone(crd[0],crd[1],crd[2],assigner);
            if (zone) {
              zone.task.chamber = ch;
              zone.task.makes = chamber.template+"Feature";
              zone.task.ingredients = HTomb.Utils.clone(ch.ingredients);
              zone.position = i;
            }
          }
        }
        return function() {
          HTomb.GUI.selectBox(chamber.width, chamber.height, assigner.z,that.designateBox,{
            assigner: assigner,
            context: that,
            callback: placeBox
          });
        };
      });
    },
    designateBox: function(squares, options) {
      options = options || {};
      var assigner = options.assigner;
      var callb = options.callback;
      callb.call(options.context,squares,assigner);
    },
    onComplete: function() {
      let x = this.zone.x;
      let y = this.zone.y;
      let z = this.zone.z;
      let f = HTomb.World.features[coord(x,y,z)];
      f.chamber = this.chamber;
      this.chamber.features.push(f);
      f.fg = this.chamber.fgs[this.zone.position];
      f.symbol = this.chamber.symbols[this.zone.position];
      if (this.chamber.features.length===this.chamber.height*this.chamber.width) {
        this.chamber.activate();
      }
    }
  });


return HTomb;
})(HTomb);
