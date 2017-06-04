'use strict';

const ErrorHandler = require('../../../app/Framework/ErrorHandler.js');
const expect = require('chai').expect;
const assert = require('chai').assert;

describe('ErrorHandler framework class tests', () => {
  it('should return the set error from getError when setError has been called', () => {
    const errorHandler = new ErrorHandler();
    const error = new Error();
    errorHandler.setError(error);
    expect(errorHandler.getError()).to.equal(error);
  });

  it('should have handle defined as a function', () => {
    const errorHandler = new ErrorHandler();
    assert.isFunction(errorHandler.handle);
    errorHandler.handle();
  });

  it('should have log defined as a function', () => {
    const errorHandler = new ErrorHandler();
    assert.isFunction(errorHandler.log);
    errorHandler.log();
  });

  it('should log using the log service when logGenericError is called', () => {
    const errorHandler = new ErrorHandler();
    let callCount = 0;
    errorHandler.getService = (service) => {
      if(service === 'Logger.js') {
        return {
          write: (type, message, context) => {
            callCount++;
          }
        };
      } else {
        return null;
      }
    };

    errorHandler.setError({});
    errorHandler.getRequest = () => {
      return {};
    };

    errorHandler.logGenericError();
    expect(callCount).to.equal(1);
  });

  it('should set the correct context values when logGenericError is called', () => {
    let dataSets = [
      {
        getError: () => {
          let error = new Error('server error');
          error.code = 500;
          error.context = {
            type: 'unhandled promise rejection'
          };

          return error;
        },
        getRequest: () => {
          return {
            originalUrl: '/path/to/resource',
            hostname: 'example.org',
            protocol: 'http'
          };
        },
        getExpectedContext: () => {
          return {
            url: '/path/to/resource',
            hostname: 'example.org',
            protocol: 'http',
            code: 500,
            message: 'server error',
            context: {
              type: 'unhandled promise rejection'
            }
          };
        }
      },
      {
        getError: () => {
          return new Error('');
        },
        getRequest: () => {
          return {
            originalUrl: '/',
            hostname: 'example.org',
            protocol: 'https'
          };
        },
        getExpectedContext: () => {
          return {
            url: '/',
            hostname: 'example.org',
            protocol: 'https',
            code: -1,
            message: '',
            context: {}
          };
        }
      }
    ];

    dataSets.forEach((dataSet) => {
      let errorHandler = new ErrorHandler();
      errorHandler.getService = (service) => {
        if(service === 'Logger.js') {
          return {
            write: (type, message, context) => {
              expect(dataSet.getExpectedContext()).to.deep.equal(context);
            }
          };
        } else {
          return null;
        }
      };

      errorHandler.setError(dataSet.getError());
      errorHandler.getRequest = dataSet.getRequest;
      errorHandler.logGenericError();
    });
  });
});