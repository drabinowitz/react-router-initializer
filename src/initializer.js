var Promise = require('promise');
var invariant = require('react/lib/invariant');

var currentPromiseSet;
var isInitializing = false;
module.exports = {
  exec: function (state) {
    var handler;
    var registeredPromises = [];
    currentPromiseSet = registeredPromises;
    isInitializing = true;
    state.routes.forEach(function (route) {
      handler = route.handler;
      if (handler && handler.initialize) {
        handler.initialize(state.params);
      }
    });
    isInitializing = false;
    return Promise.all(registeredPromises);
  },

  generateMixin: function (callback) {
    invariant(typeof callback === 'function', 'generateMixin requires a callback function');
    return {
      statics: {
        initialize: callback
      }
    };
  },

  register: function (promiseToRegister) {
    if (isInitializing) {
      currentPromiseSet.push(promiseToRegister);
    }
  }
};
