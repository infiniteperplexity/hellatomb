// This module provides optional debugging functionality
HTomb = (function(HTomb) {
  "use strict";
  var Debug = HTomb.Debug;

  Debug.explored = true;
  Debug.visible = true;
  Debug.mobility = true;
  //not yet implemented
  Debug.showpaths = true;
  Debug.messages = true;
  Debug.pushMessage = function(msg) {
    if (Debug.messages===true) {
      HTomb.GUI.pushMessage(msg);
      console.log(msg);
    }
  };
  return HTomb;
})(HTomb);
