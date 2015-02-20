jest.dontMock('../initializer');
jest.dontMock('react/lib/invariant');

describe('initializer', function () {
  var initializer, mockCb, mockState, Promise;
  beforeEach(function () {
    initializer = require('../initializer');
    Promise = require('promise');
    mockCb = jest.genMockFunction();
    mockState = {
      routes: [
        {
          handler: {
            initialize: jest.genMockFunction()
          }
        },
        {
          handler: {
            initialize: jest.genMockFunction()
          }
        }
      ]
    };
  });
  describe('generateMixin', function () {
    it('should generate a statics "initialize" method with the passed in cb', function () {
      var initializerMixin = initializer.generateMixin(mockCb);

      expect(Object.keys(initializerMixin).length).toBe(1);
      expect(Object.keys(initializerMixin.statics).length).toBe(1);
      expect(initializerMixin.statics.initialize).toBe(mockCb);
    });

    it('should throw an error if the passed in cb is not a function', function () {
      expect(function () {
        initializer.generateMixin();
      }).toThrow(new Error('Invariant Violation: generateMixin requires a callback function'));
    });
  });

  describe('register', function () {
    it('should do nothing if we are not initializing', function () {
      Array.prototype.push = jest.genMockFunction();
      initializer.register({});
      expect(Array.prototype.push).notToBeCalled();
    });
  });

  describe('exec', function () {
    it('should ');
  });
});
