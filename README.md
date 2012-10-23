Magic Ink is a simple alternative to bindings-aware HTML templating.

Template systems have a number of problems. Among them are:

* They add yet another layer of processing to HTML that can result in annoying escaping problems, especially when one needs to compose multiple template systems.

* They generally aren't HTML-aware, which makes it very easy to accidentally create a template that accidentally generates malformed HTML, or doesn't escape unsafe data.

* Only the most advanced/heavyweight ones are bindings-aware, which means that developers are usually burdened with having to watch their models for changes and re-render their views as necessary.

Magic Ink has no dependencies; it uses a browser's DOM to do most of its heavy lifting, and it relies on a minimal subset of the [Backbone.Model][] API to automatically update the DOM based on model changes.

  [Backbone.Model]: http://documentcloud.github.com/backbone/#Model
