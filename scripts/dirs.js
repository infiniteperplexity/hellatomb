// this submodule handles permutations of "try a direction, then try adjacent"
HTomb = (function(HTomb) {
  "use strict";

  HTomb.dirs = {
    "26": [
      [1,0,0],
      [-1,0,0],
      [0,1,0],
      [0,-1,0],
      [1,1,0],
      [1,-1,0],
      [-1,1,0],
      [-1,-1,0],
      [0,0,1],
      [1,0,1],
      [-1,0,1],
      [0,1,1],
      [0,-1,1],
      [1,1,1],
      [1,-1,1],
      [-1,1,1],
      [-1,-1,1],
      [0,0,-1],
      [1,0,-1],
      [-1,0,-1],
      [0,1,-1],
      [0,-1,-1],
      [1,1,-1],
      [1,-1,-1],
      [-1,1,-1],
      [-1,-1,-1]
    ],
    E: [1,0,0],
    W: [-1,0,0],
    S: [0,1,0],
    N: [0,-1,0],
    SE: [1,1,0],
    NE: [1,-1,0],
    SW: [-1,1,0],
    NW: [-1,-1,0],
    ES: [1,1,0],
    EN: [1,-1,0],
    WS: [-1,1,0],
    WN: [-1,-1,0],
    U: [0,0,1],
    UN: [1,0,1],
    US: [-1,0,1],
    UE: [0,1,1],
    UW: [0,-1,1],
    USE: [1,1,1],
    UNE: [1,-1,1],
    USW: [-1,1,1],
    UNW: [-1,-1,1],
    UES: [1,1,1],
    UEN: [1,-1,1],
    UWS: [-1,1,1],
    UWN: [-1,-1,1],
    D: [0,0,-1],
    DN: [1,0,-1],
    DS: [-1,0,-1],
    DE: [0,1,-1],
    DW: [0,-1,-1],
    DSE: [1,1,-1],
    DNE: [1,-1,-1],
    DSW: [-1,1,-1],
    DNW: [-1,-1,-1],
    DES: [1,1,-1],
    DEN: [1,-1,-1],
    DWS: [-1,1,-1],
    DWN: [-1,-1,-1],
    toDir: function(x,y,z) {
      var dirCodes = ['UN','US','UE','UW','UNW','UNE','USE','USW',
      'N','S','E','W','NW','NE','SE','SW',
      'DN','DS','DE','DW','DNW','DNE','DSE','DSW',
      'D','U'];
      for (var i=0; i<dirCodes.length; i++) {
        var dir = HTomb.dirs[dirCodes[i]];
        if (x===dir[0] && y===dir[1] && z===dir[2]) {
          return dirCodes[i];
        }
      }
    },
    mappings: {
      'N': 'NESW',
      'E': 'ESWN',
      'S': 'SWNE',
      'W': 'WNES',
      'NE': 'NESW',
      'NW': 'NWSE',
      'SW': 'SWNE',
      'SE': 'SENW',
      'U' : 'UD',
      'D' : 'DU'
    },
    backoff: {
      X: [
        ['XA','XC','XB','XD','XAD','XAB','XCB','XCD'],
        ['A','C','B','D','AD','AB','CB','CD'],
        ['YA','YC','YB','YD','YAD','YAB','YCB','YCD'],
        ['Y']
      ],
      A: [
        ['XA','YA'],
        ['XAD','XAB','YAD','YAB','AD','AB'],
        ['X','Y'],
        ['XB','XD','YB','YD'],
        ['B','D'],
        ['CD','CB'],
        ['XCD','XCB','YCD','YCB','XC','YC'],
        ['C']
      ],
      AB: [
        ['XAB','YAB'],
        ['XB','YB','XA','YA'],
        ['X','Y'],
        ['A','B'],
        ['XCB','XAD','YCB','YAD'],
        ['CB','AD'],
        ['XC','XD','YC','YD'],
        ['C','D'],
        ['XCD','YCD'],
        ['CD']
      ],
      XA: [
        ['XAD','XAB'],
        ['X'],
        ['XD','XB'],
        ['XCD','XCB'],
        ['XC'],
        ['A'],
        ['AD','AB'],
        ['B','D'],
        ['CB','CD'],
        ['C'],
        ['YA'],
        ['YAD','YAB'],
        ['Y'],
        ['YB','YD'],
        ['YCB','YCD'],
        ['YC']
      ],
      XAB: [
        ['XB','XA'],
        ['X'],
        ['XAD','XCB'],
        ['XC','XD'],
        ['XCD'],
        ['AB'],
        ['B','A'],
        ['AD','CB'],
        ['C','D'],
        ['CD'],
        ['YAB'],
        ['YB','YA'],
        ['YAD','YCB'],
        ['Y'],
        ['YC','YD'],
        ['YCD']
      ]
    },
    getBackoffs: function(dx,dy,dz) {
      var arr = [dx,dy,dz];
      var order = [arr];
      var dir = HTomb.dirs.toDir(dx,dy,dz);
      if (dir===undefined) {
        console.log(["ud",dx,dy,dz]);
      }
      var backoff, mapping;
      if (['N','S','E','W'].indexOf(dir)>-1) {
        backoff = HTomb.dirs.backoff.A;
        mapping = HTomb.dirs.mappings[dir].concat(HTomb.dirs.mappings.U);
      } else if (dir==='U' || dir==='D') {
        backoff = HTomb.dirs.backoff.X;
        mapping = HTomb.dirs.mappings.N.concat(HTomb.dirs.mappings[dir]);
      } else if (['NE','SE','NW','SW'].indexOf(dir)>-1) {
        backoff = HTomb.dirs.backoff.AB;
        mapping = HTomb.dirs.mappings[dir].concat(HTomb.dirs.mappings.U);
      }  else if (['UN','US','UE','UW','DN','DS','DE','DW'].indexOf(dir)>-1) {
        backoff = HTomb.dirs.backoff.XA;
        mapping = HTomb.dirs.mappings[dir[1]].concat(HTomb.dirs.mappings[dir[0]]);
      } else {
        backoff = HTomb.dirs.backoff.XAB;
        mapping = HTomb.dirs.mappings[dir.substr(1,2)].concat(HTomb.dirs.mappings[dir[0]]);
      }
      for (var i=0; i<backoff.length; i++) {
        if (backoff[i]===undefined) {
          console.log(backoff);
          console.log(dir);
        }
        HTomb.shuffle(backoff[i]);
        for (var j=0; j<backoff[i].length; j++) {
          var str = backoff[i][j];
          for (var k=0; k<mapping.length; k++) {
            str = str.replace('ABCDXY'[k],mapping[k]);
          }
          arr = HTomb.dirs[str];
          order.push(arr);
        }
      }
      return order;
    }
  };

  return HTomb;
})(HTomb);
