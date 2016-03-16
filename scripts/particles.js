HTomb = (function(HTomb) {
  "use strict";
  var coord = HTomb.coord;

  HTomb.Particles.emitters = [];
  var emitter = {
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
    v: 0.25,
    vz: 0,
    vr: 0,
    // rate of emission
    tick: 0,
    rate: 1,
    //how many particles to emit before going away
    n: 10,
    // lifetime
    t: 1,
    tr: 1,
    fg: "#FF0000",
    // rgb randomness
    rr: 10,
    gr: 10,
    br: 10,
    alpha: 0.75,
    particles : null,
    chars: "abcdefghijlmnopqrstuvwxyz",
    emit: function() {
      if (this.n<=0) {
        return;
      } else {
        this.n-=1;
      }
      if (this.particles===null) {
        this.particles = [];
      }
      var p = {};
      //set a bunch of properties

      var a,r;
      //randomize starting position
      //assume no directional tendency for now
      a = ROT.RNG.getUniform()*2*Math.PI;
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
      //p.life = this.t+this.tr*ROT.RNG.getNormal(0,1);
      p.life = p.t;
      var s = this.fg;
      p.fg = ROT.Color.randomize(s,this.rr,this.gr,this.br);
      s = Math.floor(Math.random()*this.chars.length);
      p.symbol = this.chars[s];
      p.alpha = this.alpha;
      this.onEmit(p);
      this.particles.push(p);
    },
    update: function() {
      if (this.rate>1) {
        for (var t=0; t<this.rate; t++) {
          this.emit();
        }
      } else {
        this.tick+=1;
        if (this.tick>=1/this.rate) {
          this.tick = 0;
          this.emit();
        }
      }
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

  HTomb.Particles.addEmitter = function(x,y,z,args) {
    args = args || {};
    var e = Object.create(emitter);
    e.fg = ROT.Color.fromString(e.fg);
    e.x = x;
    e.y = y;
    e.z = z;
    for (var arg in args) {
      e.arg = args.arg;
    }
    e.particles = [];
    e.emit();
    HTomb.Particles.emitters.push(e);
    HTomb.startParticles();
  }


  return HTomb;
})(HTomb);
