HTomb = (function(HTomb) {
  "use strict";
  var coord = HTomb.coord;

  function ParticleEmitter() {}
  ParticleEmitter.prototype = {
    // position of origin
    x: null,
    y: null,
    z: null,
    // directional tendency
    dirx: 0,
    diry: 0,
    dirz: 0,
    // directional randomness
    dirr: 0,
    // distance from origin
    dist: 0,
    distz: 0,
    distr: 1,
    // velocity
    v: 1,
    vz: 0,
    vr: 0,
    // rate of emission
    rate: 1,
    // lifetime
    t: 3,
    tr: 2,
    fg: "#888888",
    // rgb randomness
    rr: 10,
    gr: 10,
    br: 10,
    particles : null,
    chars: "abcdefghijlmnopqrstuvwxyz",
    emit: function() {
      if (particles===null) {
        particles = [];
      }
      var p = {};
      //set a bunch of properties
      this.onEmit(p);
      particles.push(p);
    },
    update: function() {
      // or maybe afterwards?
      this.onUpdate();
      if (particles) {
        for (var i=0; i<particles.length; i++) {
          var p = particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
          p.t-=1;
          this.eachUpdate(p);
          //do something with each particle
        }
      }
    },
    onEmit: function(p) {},
    onUpdate: function() {},
    eachUpdate: function(p) {}
  };


  return HTomb;
})(HTomb);
