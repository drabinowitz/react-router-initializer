var Promise = require('promise');
var invariant = require('react/lib/invariant');

var isInitializing = false;
var triggerInitializer = function (component, state) {
  //if the component exists and it has an __rrInitialize__ method we invoke that method
  if (component && component.__rrInitialize__) {
    //invoke passing in params and full state object if it is needed
    component.__rrInitialize__(state.params, state);
  }
};

var initializer = {};
initializer.__currentPromiseSet__ = [];
initializer.__currentState__ = {};

initializer.exec = initializer.execute = function (state) {
  var handler;
  //share state for use in handle method
  this.__currentState__ = state;
  //create a new set of promises
  var registeredPromises = [];
  this.__currentPromiseSet__ = registeredPromises;
  //set is initializing to true to enable register method
  isInitializing = true;
  //for each route in state routes we need to try to initialize the route
  state.routes.forEach(function (route) {
    triggerInitializer(route.handler, state);
  });
  //set is initializing back to false
  isInitializing = false;
  //promise all will return a single promise from an array, since we have an arry of promises we want to wait for them all to resolve
  //registeredPromises will be pushed in by register method
  return Promise.all(registeredPromises);
};

initializer.generateMixin = function (callback) {
  //if an invalid function is passed in throw error
  invariant(typeof callback === 'function', 'generateMixin requires a callback function');
  //add the mixin to the react class for initializing
  return {
    statics: {
      __rrInitialize__: callback
    }
  };
};

initializer.register = function (promiseToRegister) {
  //are we initializing (this boolean will only be true during the for each loop of the exec method)
  if (isInitializing) {
    //since there are many promise libraries we perform the minimal check required to verify this is a promise
    invariant(typeof promiseToRegister.then === 'function', 'attempted to register a non promise');
    //push into set of registered promises for use in promise.all in exec method
    this.__currentPromiseSet__.push(promiseToRegister);
  }
};

initializer.handle = function (componentsToHandle) {
  //must pass in array of components
  invariant(Array.isArray(componentsToHandle), 'must pass in an array of components to handle');
  //trigger each component in array if we are initializing
  if (isInitializing) {
    componentsToHandle.forEach(function (component) {
      triggerInitializer(component, this.__currentState__);
    }.bind(this));
  }
};

module.exports = initializer;
