function Entity(template) {
  this.components = [];
  for (var i = 0; i<template.length; i++) {
    this.components.push(template[i]);
  }
}
