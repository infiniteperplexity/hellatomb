// This submodule handles saving the game
HTomb = (function(HTomb) {
  "use strict";
  let LEVELW = HTomb.Constants.LEVELW;
  let LEVELH = HTomb.Constants.LEVELH;
  let NLEVELS = HTomb.Constants.NLEVELS;

  var xhttp;
  if (window.XMLHttpRequest) {
      xhttp = new XMLHttpRequest();
      } else {
      // code for IE6, IE5
      xhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }

  //xhttp.open("POST","ajax_test.asp",true);
  //xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  //xhttp.send(JSON.stringify({foo: "bar", hello: "world"}));

  HTomb.Save.getFile = function() {
      xhttp.open("GET","saves/test.json");
      xhttp.send();
      setTimeout(function() {console.log(xhttp.responseText);},5000);
  }

  return HTomb;

})(HTomb);
