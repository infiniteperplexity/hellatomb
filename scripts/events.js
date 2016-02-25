// The Events submodule, thus far unused, handles events and messaging
HTomb = (function(HTomb) {
  "use strict";

  var events = ["TURNEVENT"];
  var Events = HTomb.Events;
  Events.subscribe = function(listener, etype) {
    if (Events[etype] === undefined) {
      Events[etype] = [];
    }
    Events[etype].push(listener);
  };
  Events.publish = function(event) {
    if (Events[event.type] === undefined) {
      Events[event.type] = [];
    }
    var listeners = Events[event.type] || [];
    for (var j=0; j<listeners.length; j++) {
      listeners[j]["on"+event.type](event);
      //listeners[j].onEvent(event);
    }
  };
  Events.unsubscribe = function(listener, etype) {
    if (Events[etype] === undefined) {
      Events[etype] = [];
    }
    Events[etype].splice(Events[etype].indexOf(listener),1);
  };
  return HTomb;
})(HTomb);
