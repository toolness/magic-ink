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
    }
  };

  _.parseCollectionRule = _.parserFromRule("any item in COLLECTION");

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
    bindCollection: function(template, collection, where) {
      where = where || template;

      var self = this;
      var document = where.ownerDocument;
      var startNode = document.createComment("collection start");
      var endNode = document.createComment("collection end");
      var parentNode = where.parentNode;
      var nodes = [startNode, endNode];
      var onCollectionAdd = function(model, collection, options) {
        var newElement = template.cloneNode(true);
        parentNode.insertBefore(newElement, nodes[options.index + 1]);
        nodes.splice(options.index + 1, 0, newElement);
        self.bind(newElement, model);
      };
      var onCollectionRemove = function(model, collection, options) {
        parentNode.removeChild(nodes[options.index + 1]);
        nodes.splice(options.index + 1, 1);
        // TODO: unbind from model?
      };
      var onCollectionReset = function(collection, options) {
        var i;
        var oldLength = nodes.length - 2;

        for (i = 0; i < oldLength; i++)
          onCollectionRemove(null, collection, {index: 0});
        for (i = 0; i < collection.length; i++)
          onCollectionAdd(collection.at(i), collection, {index: i});
      };

      parentNode.replaceChild(startNode, where);
      if (startNode.nextSibling)
        parentNode.insertBefore(endNode, startNode.nextSibling);
      else
        parentNode.appendChild(endNode);
      collection.on("add", onCollectionAdd);
      collection.on("remove", onCollectionRemove);
      collection.on("reset", onCollectionReset);
      onCollectionReset(collection, {});
    },
    bind: function(root, model) {
      for (var i = 0; i < root.childNodes.length; i++) {
        var node = root.childNodes[i];
        if (node.nodeType == root.ELEMENT_NODE) {
          if (node.hasAttribute("data-ink-context")) {
            var context = node.getAttribute("data-ink-context");
            var parsed = _.parseCollectionRule(context);
            if (parsed) {
              var collection = model.get(parsed.COLLECTION);
              this.bindCollection(node, collection);
              i += collection.length + 1;
              continue;
            } else
              // TODO: Add support for nested models.
              _.err("no rule matches data-ink-context expresssion: " + 
                    context);
          }
          if (node.hasAttribute("data-ink")) {
            node.getAttribute("data-ink").split(",").forEach(function(expr) {
              expr = expr.trim();
              for (var i = 0; i < this._processors.length; i++)
                if (this._processors[i](expr, node, model))
                  return;
              _.err("no rule matches data-ink expression: " + expr);
            }, this);
          }
          this.bind(node, model);
        }
      }
    }
  };
  
  exports.engine = new exports.Engine(_.baseRules);
  
  if (window.define)
    define(function() { return exports; });
  else
    window.MagicInk = exports;
})(window);
