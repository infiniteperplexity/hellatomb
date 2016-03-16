HTomb = (function(HTomb) {
  "use strict";
  var coord = HTomb.coord;

  HTomb.Particles.emitters = [];

  HTomb.Particles.Emitter = function(args) {
    args = args || {};
    for (var arg in args) {
      this.arg = args.arg;
    }
    HTomb.Particles.emitters.push(this);
  }
  HTomb.Particles.Emitter.prototype = {
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
    fg: [88,88,88],
    // rgb randomness
    rr: 10,
    gr: 10,
    br: 10,
    alpha: 1.0,
    particles : null,
    chars: "abcdefghijlmnopqrstuvwxyz",
    emit: function() {
      if (particles===null) {
        particles = [];
      }
      var p = {};
      //set a bunch of properties

      var a,r;
      //randomize starting position
      //assume no directional tendency for now
      a = ROT.RNG.getUniform()*Math.PI;
      r = this.distr*ROT.RNG.getNormal(0,1); //this can drop below zero
      p.x = this.x+r*Math.cos(a);
      p.y = this.y+r*Math.sin(a);
      p.z = this.z+0;
      //assume no z coordinate
      //randomize starting velocity
      // actually for now just have them spew outward
      //a = ROT.RNG.getUniform()*Math.PI;
      r = this.v+this.vr*ROT.RNG.getNormal(0,1);
      p.vx = r*Math.cos(a);
      p.vy = r*Math.sin(a);
      p.vz = 0;
      p.ax = 0;
      p.ay = 0;
      p.az = 0;
      p.life = this.t+this.tr*ROT.RNG.getNormal(0,1);
      var s = this.fg;
      s = ROT.Color.randomize(fg,this.rr,this.gr,this.br);
      p.fg = ROT.Color.toString(fg);
      s = Math.floor(Math.random()*this.chars.length);
      p.symbol = this.chars[s];
      p.alpha = this.alpha;
      this.onEmit(p);
      particles.push(p);
    },
    update: function() {
      // or maybe afterwards?
      this.preUpdate();
      if (this.particles) {
        var expired = [];
        for (var i=0; i<this.particles.length; i++) {
          var p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.z += p.vz;
          p.vx += p.ax;
          p.vy += p.ay;
          p.vz += p.az;
          p.t-=1;
          if (p.t<=0) {
            expired.push(p);
          }
          this.eachUpdate(p);
          //do something with each particle
        }
        //
        for (var j=0; j<expired.length; j++) {
          if (this.particles.indexOf(expired[j])!==-1) {
            this.particles.splice(this.particles.indexOf(expired[j]),1);
          }
        }
      }
      this.postUpdate();
      if (this.particles.length===0) {
        HTomb.Particles.emitters.splice(HTomb.Particles.emitters.indexOf(this));
      }
    },
    onEmit: function(p) {},
    preUpdate: function() {},
    postUpdate: function() {},
    eachUpdate: function(p) {}
  };

  HTomb.Particles.update = function() {
    for (var i=0; i<HTomb.Particles.emitters.length; i++) {
      HTomb.Particles.emitters[i].update();
    }
  };


  return HTomb;
})(HTomb);
