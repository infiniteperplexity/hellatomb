HTomb = (function(HTomb) {
  "use strict";

  var b = HTomb.Behavior;

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

  return HTomb;
})(HTomb);
