define(['underscore',
    'js/components/transition'
    ],
  function(
    _,
    Transition
    ) {


    var TransitionCatalog = function (options) {
      this._catalog = {};
    };
    _.extend(Transition.prototype, {
      add: function(name, transition) {
        if (transition instanceof Transition) {
          throw new Exception("You can add only Transition objects");
        }
        this._catalog[name] = transition;
      },
      get: function(name) {
        return this._catalog[name];
      },
      remove: function(name) {
        delete this._catalog[name];
      }
    });

    return TransitionCatalog;
  }
);
