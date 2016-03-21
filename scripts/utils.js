// The Events submodule, thus far unused, handles events and messaging
HTomb = (function(HTomb) {
  "use strict";
  var LEVELW = HTomb.Constants.LEVELW;
  var LEVELH = HTomb.Constants.LEVELH;
  var NLEVELS = HTomb.Constants.NLEVELS;

  HTomb.Utils.where = function(obj,callb) {
    var result = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && callb(obj[key],key,obj)) {
        result.push(obj[key]);
      }
    }
    return result;
  };

  HTomb.Utils.shuffle = function(arr) {
    //Fisher-Yates
    var i = arr.length;
    if ( i == 0 ) return false;
    while ( --i ) {
       var j = Math.floor( Math.random() * ( i + 1 ) );
       var tempi = arr[i];
       var tempj = arr[j];
       arr[i] = tempj;
       arr[j] = tempi;
     }
     return arr;
  };

  HTomb.Utils.coord = function(x,y,z) {
    return z*LEVELH*LEVELW + x*LEVELH + y;
  }
  //useful for parsing
  HTomb.Utils.decoord = function(c) {
    var x=0, y=0, z=0;
    while(c-LEVELH*LEVELW>=0) {
      c-=LEVELH*LEVELW;
      z+=1;
    }
    while(c-LEVELH>=0) {
      c-=LEVELH;
      x+=1;
    }
    y = parseInt(c);
    return [x,y,z];
  }

  HTomb.Utils.dicePlusMinus = function(d) {
    return Math.floor(Math.random()*d)-Math.floor(Math.random()*d);
  };

  HTomb.Utils.dice = function(n,d) {
    var tally = 0;
    for (var i=0; i<n; i++) {
      tally+=Math.floor(Math.random()*d)+1;
    }
    return tally;
  };

  HTomb.Utils.diceUntil = function(d,n) {
    if (n>d) {
      return 0;
    }
    var tally = 0;
    while (true) {
      var roll=Math.floor(Math.random()*d)+1;
      if (roll>=n) {
        break;
      } else {
        tally+=1;
      }
    }
    return tally;
  };

  HTomb.Utils.arrayInArray = function(c, a) {
    var match;
    var mis;
    for (var i=0; i<a.length; i++) {
      match = true;
      for (var j=0; j<c.length; j++) {
        if (c[j]!==a[i][j]) {
          match = false;
        }
      }
      if (match===true) {
        return i;
      }
    }
    return -1;
  };

  HTomb.Utils.alphaHex = function(newc,oldc,alpha) {
    var combined = [];
    for (var i=0; i<3; i++) {
      combined[i] = alpha*newc[i]+(1-alpha)*oldc[i];
    }
    return combined;
  }

  HTomb.Utils.alphaString = function(newc,oldc,alpha) {
    var oldc = ROT.Color.fromString(oldc);
    var newc = ROT.Color.fromString(newc);
    var combined = [];
    for (var i=0; i<3; i++) {
      combined[i] = alpha*newc[i]+(1-alpha)*oldc[i];
    }
    combined = ROT.Color.toHex(combined);
    return combined;
  }


  return HTomb;
})(HTomb);
