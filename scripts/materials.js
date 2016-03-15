HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;
  var coord = HTomb.coord;

  //***********Types of material
  HTomb.Types.define({
  	template: "Material",
  	name: "material"
  });

  HTomb.Types.defineMaterial({
  	template: "FleshMaterial",
  	name: "flesh"
  });

  HTomb.Types.defineMaterial({
  	template: "BoneMaterial",
  	name: "bone"
  });

  //******Types of damage
  HTomb.Types.define({
  	template: "Damage",
  	name: "damage",
  });

  HTomb.Types.defineDamage({
  	template: "SlashingDamage",
  	name: "slashing"
  });

  HTomb.Types.defineDamage({
  	template: "PiercingDamage",
  	name: "piercing"
  });


  HTomb.Types.defineDamage({
    template: "CrushingDamage",
    name: "crushing"
  });



  return HTomb;
})(HTomb);
