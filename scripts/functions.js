// The Events submodule, thus far unused, handles events and messaging
HTomb = (function(HTomb) {
  "use strict";

  HTomb.Utils.where = function(obj,callb) {
    var result = [];
    for (var key in obj) {
      if (obj.hasOwnProperty(key) && callb(obj[key],key,obj)) {
        result.push(obj[key]);
      }
    }
    return result;
  };

  HTomb.Utils.shuffle(arr) {
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

  HTomb.Utils.dicePlusMinus(d) {
    return Math.floor(Math.random()*d)-Math.floor(Math.random()*d);
  };

  HTomb.Utils.dice(n,d) {
    var tally = 0;
    for (var i=0; i<n; i++) {
      tally+=Math.floor(Math.random()*d)+1;
    }
    return tally;
  };

  HTomb.Utils.diceUntil(d,n) {
    if (n>d) {
      return 0;
    }
    var tally = 0;
    while (true) {
      var roll=Math.floor(Math.random()*d)+1;
      if (roll>=n) {
        break;
      } else {
        tally+=roll;
      }
    }
    return tally;
  };


  return HTomb;
})(HTomb);
