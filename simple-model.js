"use strict";

// This is a minimal subset of Backbone.Model's interface for Magic Ink
// to work with.

function SimpleModel(properties) {
  this._listeners = {};
  this._properties = properties || {};
}

SimpleModel.prototype = {
  get: function(property) {
    return this._properties[property];
  },
  set: function(property, value) {
    this._properties[property] = value;
    (this._listeners["change:" + property] || []).forEach(function(fn) {
      fn(this, value);
    }, this);
  },
  on: function(event, fn) {
    if (!(event in this._listeners))
      this._listeners[event] = [];
    this._listeners[event].push(fn);
  }
};
