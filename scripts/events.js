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
    var listeners = Events[event.type] || [];
    for (var j=0; j<listeners.length; j++) {
      listeners[j].onEvent(event);
    }
  };
  Events.unsubscribe = function(listener, etype) {
    Events[etype].splice(Events[etype].indexOf(listener));
  };
  return HTomb;
})(HTomb);
