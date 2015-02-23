jest.dontMock('../initializer');
jest.dontMock('react/lib/invariant');

describe('initializer', function () {
  var initializer, mockCb, mockState, Promise, mockPromise, mockComponents, nestedMockComponent;
  beforeEach(function () {
    initializer = require('../initializer');
    Promise = require('promise');
    Promise.all = jest.genMockFunction();
    mockCb = jest.genMockFunction();
    mockState = {
      params: {},
      routes: [
        {
          handler: {
            __rrInitialize__: jest.genMockFunction()
          }
        },
        {
          handler: {
            __rrInitialize__: jest.genMockFunction()
          }
        }
      ]
    };
    mockPromise = {
      then: jest.genMockFunction()
    };
    mockComponents = [
      {
        __rrInitialize__: jest.genMockFunction()
      },
      {
        __rrInitialize__: jest.genMockFunction()
      }
    ];
    nestedMockComponent = {
      __rrInitialize__: jest.genMockFunction()
    };
  });
  describe('generateMixin', function () {
    it('should generate a statics "__rrInitialize__" method with the passed in cb', function () {
      var initializerMixin = initializer.generateMixin(mockCb);
      expect(Object.keys(initializerMixin).length).toBe(1);
      expect(Object.keys(initializerMixin.statics).length).toBe(1);
      expect(initializerMixin.statics.__rrInitialize__).toBe(mockCb);
    });

    it('should throw an error if the passed in cb is not a function', function () {
      expect(function () {
        initializer.generateMixin();
      }).toThrow(new Error('Invariant Violation: generateMixin requires a callback function'));
    });
  });

  describe('register', function () {
    it('should do nothing if we are not initializing', function () {
      initializer.register({});
      expect(initializer.__currentPromiseSet__.length).toBe(0);
    });
  });

  describe('execute', function () {
    it('should execute all route handlers passing in state.params and state', function () {
      initializer.execute(mockState);

      expect(mockState.routes[0].handler.__rrInitialize__.mock.calls.length).toBe(1);
      expect(mockState.routes[0].handler.__rrInitialize__.mock.calls[0].length).toBe(2);
      expect(mockState.routes[0].handler.__rrInitialize__.mock.calls[0][0]).toBe(mockState.params);
      expect(mockState.routes[0].handler.__rrInitialize__.mock.calls[0][1]).toBe(mockState);

      expect(mockState.routes[1].handler.__rrInitialize__.mock.calls.length).toBe(1);
      expect(mockState.routes[1].handler.__rrInitialize__.mock.calls[0].length).toBe(2);
      expect(mockState.routes[1].handler.__rrInitialize__.mock.calls[0][0]).toBe(mockState.params);
      expect(mockState.routes[1].handler.__rrInitialize__.mock.calls[0][1]).toBe(mockState);
    });

    it('should allow the initializer.register method to add promises to the current promise set', function () {
      mockState.routes[0].handler.__rrInitialize__ = initializer.register.bind(initializer, mockPromise);
      initializer.exec(mockState);

      expect(initializer.__currentPromiseSet__.length).toBe(1);
      expect(initializer.__currentPromiseSet__[0]).toBe(mockPromise);
    });

    it('should throw an error if the passed in object is not a valid promise', function () {
      expect(function () {
        mockState.routes[0].handler.__rrInitialize__ = initializer.register.bind(initializer, {});
        initializer.exec(mockState);
      }).toThrow(new Error('Invariant Violation: attempted to register a non promise'));
    });
  });

  describe('handle', function () {
    it('should allow a handler to initialize an array of components', function () {
      mockState.routes[0].handler.__rrInitialize__ = function () {
        initializer.handle(mockComponents);
      };

      initializer.execute(mockState);

      expect(mockComponents[0].__rrInitialize__.mock.calls.length).toBe(1);
      expect(mockComponents[0].__rrInitialize__.mock.calls[0].length).toBe(2);
      expect(mockComponents[0].__rrInitialize__.mock.calls[0][0]).toBe(mockState.params);
      expect(mockComponents[0].__rrInitialize__.mock.calls[0][1]).toBe(mockState);

      expect(mockComponents[1].__rrInitialize__.mock.calls.length).toBe(1);
      expect(mockComponents[1].__rrInitialize__.mock.calls[0].length).toBe(2);
      expect(mockComponents[1].__rrInitialize__.mock.calls[0][0]).toBe(mockState.params);
      expect(mockComponents[1].__rrInitialize__.mock.calls[0][1]).toBe(mockState);

      expect(mockState.routes[1].handler.__rrInitialize__.mock.calls.length).toBe(1);
      expect(mockState.routes[1].handler.__rrInitialize__.mock.calls[0].length).toBe(2);
      expect(mockState.routes[1].handler.__rrInitialize__.mock.calls[0][0]).toBe(mockState.params);
      expect(mockState.routes[1].handler.__rrInitialize__.mock.calls[0][1]).toBe(mockState);
    });

    it('should properly handle deeply nested handle statements', function () {
      mockState.routes[0].handler.__rrInitialize__ = function () {
        initializer.handle(mockComponents);
      };

      mockComponents[0].__rrInitialize__ = function () {
        initializer.handle([nestedMockComponent]);
      };

      initializer.execute(mockState);

      expect(nestedMockComponent.__rrInitialize__.mock.calls.length).toBe(1);
      expect(nestedMockComponent.__rrInitialize__.mock.calls[0].length).toBe(2);
      expect(nestedMockComponent.__rrInitialize__.mock.calls[0][0]).toBe(mockState.params);
      expect(nestedMockComponent.__rrInitialize__.mock.calls[0][1]).toBe(mockState);

      expect(mockComponents[1].__rrInitialize__.mock.calls.length).toBe(1);
      expect(mockComponents[1].__rrInitialize__.mock.calls[0].length).toBe(2);
      expect(mockComponents[1].__rrInitialize__.mock.calls[0][0]).toBe(mockState.params);
      expect(mockComponents[1].__rrInitialize__.mock.calls[0][1]).toBe(mockState);

      expect(mockState.routes[1].handler.__rrInitialize__.mock.calls.length).toBe(1);
      expect(mockState.routes[1].handler.__rrInitialize__.mock.calls[0].length).toBe(2);
      expect(mockState.routes[1].handler.__rrInitialize__.mock.calls[0][0]).toBe(mockState.params);
      expect(mockState.routes[1].handler.__rrInitialize__.mock.calls[0][1]).toBe(mockState);
    });

    it('should do nothing if we are not initializing', function () {
      initializer.handle(mockComponents);

      expect(mockComponents[0].__rrInitialize__).not.toBeCalled();
      expect(mockComponents[1].__rrInitialize__).not.toBeCalled();
    });

    it('should throw an error if an array is not passed in', function () {
      expect(function () {
        initializer.handle(nestedMockComponent);
      }).toThrow(new Error('Invariant Violation: must pass in an array of components to handle'));
    });
  });
});
