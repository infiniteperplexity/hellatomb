HTomb = (function(HTomb) {
  "use strict";

HTomb.Types.defineCrop({
  template: "Wolfsbane",
  name: "wolfsbane",
  fg: "#AA55DD",
  randomColor: 10
});

HTomb.Types.defineCrop({
  template: "Mandrake",
  name: "mandrake",
  fg: "#DDAA66",
  Herb: {
    name: "mandrake root",
    symbol: "\u2767"
  },
  randomColor: 10
});

HTomb.Types.defineCrop({
  template: "Wormwood",
  name: "wormwood",
  fg: "#55DDBB",
  Herb: {
    name: "wormwood leaf",
    symbol: "\u2766"
  },
  randomColor: 10
});

HTomb.Types.defineCrop({
  template: "Amanita",
  name: "amanita",
  fg: "#DD5566",
  Plant: {
    symbol: "\u2763"
  },
  Herb: {
    symbol: "\u2763",
    name: "amanita cap"
  },
  Seed: {
    name: "amanita spore"
  },
  randomColor: 10
});

HTomb.Types.defineCrop({
  template: "Bloodwort",
  name: "bloodwort",
  fg: "#BBAAAA",
  Herb: {
    name: "bloodwort root",
    symbol: "\u2767"
  },
  randomColor: 10
});

return HTomb;
})(HTomb);
