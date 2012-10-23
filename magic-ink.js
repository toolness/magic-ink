"use strict";

(function(window) {
  var exports = {};

  var _ = exports._impl = {
    parserFromRule: function(rule) {
      var regexp = [];
      var matchNames = [];
      rule.split(" ").forEach(function(term) {
        if (term[0].match(/[a-z]/)) {
          regexp.push(term);
        } else {
          regexp.push('([A-Za-z0-9_\-]+)');
          matchNames.push(term);
        }
      });

      regexp = new RegExp(regexp.join(' '));

      return function(expr) {
        var match = expr.match(regexp);
        var result = {};
        if (!match)
          return null;
        for (var i = 0; i < matchNames.length; i++)
          result[matchNames[i]] = match[i+1];
        return result;
      };
    },
    baseRules: {
      "content is PROPERTY": function(node, model, options) {
        model.on("change:" + options.PROPERTY, function(model, value) {
          node.textContent = value;
        });
        node.textContent = model.get(options.PROPERTY);
      }
    },
    err: function(msg) {
      if (window.console && window.console.error)
        window.console.error(msg);
    },
    toArray: function(arraylike) {
      return Array.prototype.slice.call(arraylike);
    }
  };

  exports.Engine = function(rules) {
    this._processors = [];
    this.add(rules);
  };
  
  exports.Engine.prototype = {
    add: function(rules) {
      Object.keys(rules).forEach(function(rule) {
        var parser = _.parserFromRule(rule);
        var execute = rules[rule];

        this._processors.push(function(expr, node, model) {
          var options = parser(expr);
          if (!options)
            return false;
          execute(node, model, options);
          return true;
        });
      }, this);
    },
    bind: function(root, model) {
      _.toArray(root.querySelectorAll("[data-ink]")).forEach(function(node) {
        node.getAttribute("data-ink").split(",").forEach(function(expr) {
          expr = expr.trim();
          for (var i = 0; i < this._processors.length; i++)
            if (this._processors[i](expr, node, model))
              return;
          _.err("no rule matches expression: " + expr);
        }, this);
      }, this);
    }
  };
  
  exports.engine = new exports.Engine(_.baseRules);
  
  if (window.define)
    define(function() { return exports; });
  else
    window.MagicInk = exports;
})(window);
