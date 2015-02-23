var Promise = require('promise');
var invariant = require('react/lib/invariant');

var isInitializing = false;
module.exports = {
  __currentPromiseSet__: [],
  exec: function (state) {
    var handler;
    //create a new set of promises
    var registeredPromises = [];
    this.__currentPromiseSet__ = registeredPromises;
    //set to true to enable register method
    isInitializing = true;
    //fo reach route in state routes
    state.routes.forEach(function (route) {
      handler = route.handler;
      //if the route has a handler and it has an __rrInitialize__ method
      if (handler && handler.__rrInitialize__) {
        //invoke passing in params and state if it is needed
        handler.__rrInitialize__(state.params, state);
      }
    });
    isInitializing = false;
    return Promise.all(registeredPromises);
  },

  generateMixin: function (callback) {
    invariant(typeof callback === 'function', 'generateMixin requires a callback function');
    return {
      statics: {
        __rrInitialize__: callback
      }
    };
  },

  register: function (promiseToRegister) {
    if (isInitializing) {
      //since there are many promise libraries we perform the minimal check required to verify this is a promise
      invariant(typeof promiseToRegister.then === 'function', 'attempted to register a non promise');
      this.__currentPromiseSet__.push(promiseToRegister);
    }
  }
};
