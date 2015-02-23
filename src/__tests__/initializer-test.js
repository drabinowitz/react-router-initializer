jest.dontMock('../initializer');
jest.dontMock('react/lib/invariant');

describe('initializer', function () {
  var initializer, mockCb, mockState, Promise, mockPromise;
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

  describe('exec', function () {
    it('should execute all route handlers passing in state.params and state', function () {
      initializer.exec(mockState);

      expect(mockState.routes[0].handler.__rrInitialize__.mock.calls.length).toBe(1);
      expect(mockState.routes[0].handler.__rrInitialize__.mock.calls[0][0]).toBe(mockState.params);
      expect(mockState.routes[0].handler.__rrInitialize__.mock.calls[0][1]).toBe(mockState);

      expect(mockState.routes[1].handler.__rrInitialize__.mock.calls.length).toBe(1);
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
});
