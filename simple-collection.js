"use strict";

// This is a minimal subset of Backbone.Collection's interface for Magic Ink
// to work with.

function SimpleCollection(models) {
  this._listeners = {};
  this._models = models || [];
  this.length = this._models.length;
}

SimpleCollection.prototype = {
  _trigger: function(event, args, options) {
    if (options.silent)
      return;
    (this._listeners[event] || []).forEach(function(fn) {
      fn.apply(undefined, args);
    }, this);
  },
  at: function(index) {
    return this._models[index];
  },
  add: function(models, options) {
    options = options || {};
    var at = options.at;
    if (typeof(at) != "number")
      at = this.length;
    this._models.splice.apply(this._models, [at, 0].concat(models));
    this.length += models.length;
    models.forEach(function(model) {
      var index = this._models.indexOf(model);
      if (index == -1)
        throw new Error("model not found");
      this._trigger("add", [model, this, {index: index}], options);
    }, this);
  },
  remove: function(models, options) {
    options = options || {};
    models.forEach(function(model) {
      var index = this._models.indexOf(model);
      if (index == -1)
        throw new Error("model not found");
      this._models.splice(index, 1);
      this.length--;
      this._trigger("remove", [model, this, {index: index}], options);
    }, this);
  },
  reset: function(models, options) {
    while (this.length)
      this.remove([this._models[0]], {silent: true});
    this.add(models, {silent: true});
    this._trigger("reset", [this, {}], options || {});
  },
  on: function(event, fn) {
    if (!(event in this._listeners))
      this._listeners[event] = [];
    this._listeners[event].push(fn);
  }
};
