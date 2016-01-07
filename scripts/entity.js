var Entity = function(template) {
  var entity = {symbol: "@", fg: undefined, bg: undefined, x: null, y: null, z: null, components: []};
  for (var i = 0; i<template.length; i++) {
    entity.components.push(template[i]);
  }
  return entity;
};
var CreatureTemplate = function() {return [ActorComponent()];};
var ActorComponent = function() {return {actor: null, speed: 1};};
var Necromancer = function() {return CreatureTemplate();};
var PlayerActor = {
  act: function() {
    //wait for input
  }
};
