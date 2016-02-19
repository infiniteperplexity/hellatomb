// ************ This submodule contains the most complex Behaviors related to creature activities
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;

  // The AI behavior allows creatures to choose actions

  // The Worker behavior allows a creature to build, dig, and perform other tasks
  // This might get split into sub-behaviors
  HTomb.Behavior.define({
    template: "Worker",
    name: "worker",
    dig: function(x,y,z) {
      var coord = x*LEVELW*LEVELH + y*LEVELH + z;
      var feature = HTomb.World.features[coord];
      if (feature) {
        // If there is an incomplete pit, work on completing it
        if (feature.template==="IncompletePit") {
          feature.construction.stepsLeft-=1;
          if (feature.construction.stepsLeft<=0) {
            // If the pit is completed, remove the incomplete pit
            feature.remove();
            // If the pit was dug in the ground...
            if (HTomb.World.levels[z].grid[x][y]===HTomb.Tiles.FLOORTILE) {
              // ...then place a pit and drop one level...
              //HTomb.Entity.create("Pit").place(x,y,z);
              z-=1;
            }
            // ...otherwise just empty out the current square
            HTomb.Tiles.emptySquare(x,y,z);
            // Explore the bottom of the pit
            HTomb.Tiles.explore(x,y,z);
            // Clean up the DigZone if there was one...bad place to do this
            var zone = HTomb.World.zones[coord];
            if (zone && zone.template==="DigZone") {
              zone.remove();
            }
          }
        } else {
          // Clear out an existing feature to make room for digging
          console.log(this.entity.describe() + " removes " + feature.describe() + " to make room for digging.");
          feature.remove();
        }
      } else {
        // Begin digging by creating an incomplete pit
        HTomb.Entity.create("IncompletePit").place(x,y,z);
      }
      // Spend action
      this.entity.ai.acted = true;
    },
    build: function(x,y,z) {
      var coord = x*LEVELW*LEVELH + y*LEVELH + z;
      var feature = HTomb.World.features[coord];
      if (feature) {
        // If there is an incomplete wall here, work on completing it
        if (feature.template==="IncompleteWall") {
          feature.construction.stepsLeft-=1;
          if (feature.construction.stepsLeft<=0) {
            // If it is completed, remove the incomplete wall...
            feature.remove();
            // ...and fill in the square
            HTomb.Tiles.fillSquare(x,y,z);
            // Remove the BuildZone...bad place to do this
            var zone = HTomb.World.zones[coord];
            if (zone && zone.template==="BuildZone") {
              zone.remove();
            }
          }
        } else {
          // Remove another feature to make room for building
          console.log(this.entity.describe() + " removes " + feature.describe() + " to make room for building.");
          feature.remove();
        }
      } else {
        // Begin constructing a wall
        HTomb.Entity.create("IncompleteWall").place(x,y,z);
      }
      // Spend action
      this.entity.ai.acted = true;
    }
  });

  return HTomb;
})(HTomb);
