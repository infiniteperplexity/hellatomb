HTomb = (function(HTomb) {
  "use strict";

  var standardPurple = {
    WALLFG: "#BBBBFF",
    FLOORFG: "#AAAAEE",
    BELOWFG: "#8888DD",
    TWOBELOWFG: "#444499",
    SHADOWFG: "#444455",
    WALLBG: "#333355",
    FLOORBG: "#111133",
    BELOWBG: "#000022"
  };

  var monochrome = {
    WALLFG: "#BBBBBB",
    FLOORFG: "#AAAAAA",
    BELOWFG: "#888888",
    TWOBELOWFG: "#444444",
    SHADOWFG: "#444444",
    WALLBG: "#555555",
    FLOORBG: "#333333",
    BELOWBG: "#111111"
  };

  var dullGreen  = {
    WALLFG: "#BBBBBBB",
    FLOORFG: "#AAEEAA",
    BELOWFG: "#88DDDD",
    TWOBELOWFG: "#444444",
    SHADOWFG: "#445544",
    WALLBG: "#555555",
    FLOORBG: "#333333",
    BELOWBG: "#111111"
  };

  var grassy  = {
    WALLFG: "#AAAAAA",
    FLOORFG: "#668844",
    //BELOWFG: "#554466",
    BELOWFG: "#553355",
    SHADOWFG: "#333344",
    TWOBELOWFG: "#221122",
    WALLBG: "#777777",
    FLOORBG: "#445533",
    BELOWBG: "#111122"
  };

  //var scheme = standardPurple;
  var scheme = grassy;

  for (var c in scheme) {
    HTomb.Constants[c] = scheme[c];
  }

  return HTomb;
})(HTomb);
