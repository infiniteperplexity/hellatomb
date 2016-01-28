
HTomb.GUI.selectSquareZone = function(z, callb, options) {
  options = options || {};
  HTomb.GUI.pushMessage("Select the first corner.");
  var context = new ControlContext({VK_ESCAPE: GUI.reset});
  HTomb.Controls.context = context;
  context.clickAt = function (x,y) {
    HTomb.pushMessage("Select the second corner.");
    context.clickAt = secondSquare(x,y);
  };
  var secondSquare = function(x0,y0) {
    return function(x1,y1) {
      var xs, ys;
      if (x0===x1) {
        xs = [x0];
      } else if (options.outline===true) {
        xs=[x0,x1];
      } else {
        xs = [];
        for (var i=0; i<Math.abs(x1-x0)+1; i++) {
          xs[i] = [x0+i*Math.sign(x1-x0)];
        }
      }
      if (y0===y1) {
        y = [y0];
      } else if (options.outline===true) {
        ys=[y0,y1];
      } else {
        ys = [];
        for (var j=0; j<Math.abs(y1-y0)+1; j++) {
          ys[j] = [y0+j*Math.sign(y1-y0)];
        }
      }
      var squares = [];
      for (var x=0; x<xs.length; x++) {
        for (var y=0; y<ys.length; y++) {
          squares.push([x,y,z]);
        }
      }
      callb(squares, options);
      GUI.reset();
    };
  };
};
