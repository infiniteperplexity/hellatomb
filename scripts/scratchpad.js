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
    var particle = {};
    //set a bunch of properties
    this.onEmit(particle);
    particles.push(particle);
  },
  update: function() {
    // or maybe afterwards?
    this.onUpdate();
    if (particles) {
      for (var i=0; i<particles.length; i++) {
        var particle = particles[i];
        this.eachUpdate(particle);
        //do something with each particle
      }
    }
  },
  onEmit: function(particle) {},
  onUpdate: function() {},
  eachUpdate: function(particle) {}
};
