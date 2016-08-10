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
      xhttp.onreadystatechange = function() {
        if (xhttp.readyState == XMLHttpRequest.DONE) {
          if (xhttp.status == 200) {
            console.log(xhttp.responseText);
          } else if (xhttp.status == 400) {
            console.log("There was an error 400");
          } else {
            console.log("Something other than 200 was returned.");
          }
        }
      };
      xhttp.open("GET","saves/test.json",true);
      xhttp.send();
  };

  return HTomb;

})(HTomb);
