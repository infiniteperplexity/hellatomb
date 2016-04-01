
var promise = new Promise(function(resolve,reject)) {
  //do a thing, possibly asynch
  if (/**/) {
    resolve("stuff worked");
  } else {
    reject(Error("It broke!"));
  }
});

var promise = new Promise(function(resolve, reject) {
  resolve(1);
});

promise.then(function(val) {
  console.log(val);
  return val+2;
}).then(function(val) {
  console.log(val);
});



HTomb.Save.testing = function() {
  var list = ['"['];
  for (var i=0; i<HTomb.World.things.length; i++) {
      console.log(i);
      if (i>0) {
        list.push(",");
      }
      list.push(HTomb.Save.stringify(HTomb.World.things[i],true));
      //if (i>1000) {
      //  break;
      //}
    }
  list.push(']"');
  var json = list.join('');
  return json;
};

var fewer = HTomb.World.things.splice(0,10);
HTomb.Save.promises = function() {
  var list = [];
  var sequence = Promise.resolve();
  fewer.forEach(function(e,i,a) {
    sequence = sequence.then(function() {
      console.log(i);
      list.push(HTomb.Save.stringify(e));
    });
  });
};

var i=0;
(function () {
    for (; i < 6000000; i++) {
        /*
            Normal processing here
        */

        // Every 100,000 iterations, take a break
        if ( i > 0 && i % 100000 == 0) {
            // Manually increment `i` because we break
            i++;
            console.log(i);
            // Set a timer for the next iteration
            window.setTimeout(arguments.callee);
            break;
        }
    }
})();




var i=0;
list = [];

var i=0;
list = [];
function save () {
  for (; i<HTomb.World.things.length; i++) {
    list.push(HTomb.Save.stringify(HTomb.World.things[i]));
    if (i>0 && i%1000===0) {
      console.log(i);
      i++;
      setTimeout(save);
      break;
    }
  }
}

function splitter(prep, fun) {

}

})();
