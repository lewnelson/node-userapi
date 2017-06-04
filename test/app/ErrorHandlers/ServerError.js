'use strict';

const ServerError = require('../../../app/ErrorHandlers/ServerError.js');
const expect = require('chai').expect;

describe('ServerError error handler class tests', () => {
  it('should call log on the logger service when log is called with error log type, server_error message and error object from getDebugErrorObject', () => {
    const serverError = new ServerError();
    const debugErrorObject = {};
    const logger = {
      write: (type, message, context) => {
        expect(type).to.equal('error');
        expect(message).to.equal('server_error');
        expect(context).to.equal(debugErrorObject);
      }
    };

    serverError.getService = (key) => key === 'Logger.js' ? logger : null;
    serverError.getDebugErrorObject = () => debugErrorObject;
    serverError.log();
  });

  it('should return correctly formatted error object from getDebugErrorObject', () => {
    const serverError = new ServerError();
    const request = {
      originalUrl: '/',
      hostname: 'example.org',
      protocol: 'http'
    };

    serverError.getRequest = () => request;
    let dataSets = [
      {
        error: {
          code: 500,
          message: 'error',
          fileName: 'file.js',
          lineNumber: 30,
          name: 'undefined property',
          stack: 'line one\nline two',
          context: {}
        },
        expectedError: {
          code: 500,
          message: 'error',
          trace: {
            fileName: 'file.js',
            lineNumber: 30,
            name: 'undefined property',
            stack: ['line one', 'line two']
          },
          context: {}
        }
      },
      {
        error: {},
        expectedError: {
          code: 500,
          message: 'server error',
          trace: {
            fileName: '',
            lineNumber: -1,
            name: '',
            stack: []
          },
          context: {}
        }
      }
    ];

    dataSets.forEach((dataSet) => {
      dataSet.expectedError.url = request.originalUrl;
      dataSet.expectedError.hostname = request.hostname;
      dataSet.expectedError.protocol = request.protocol;
      serverError.getError = () => dataSet.error;
      expect(serverError.getDebugErrorObject()).to.deep.equal(dataSet.expectedError);
    });
  });

  it('should return a 500 status response with full debug object when debug is enabled in config', () => {
    const serverError = new ServerError();
    const debugErrorObject = {};
    serverError.getDebugErrorObject = () => debugErrorObject;

    const config = {
      getConfig: (key, fallback) => key === 'debug'
    };

    serverError.getService = (key) => key === 'Config.js' ? config : null;
    const response = {
      status: (code) => {
        expect(code).to.equal(500);
        return {
          json: (data) => {
            expect(data).to.deep.equal({
              error: debugErrorObject
            });
          }
        };
      }
    };

    serverError.getResponse = () => response;
    serverError.handle();
  });

  it('should return a 500 status response with minimal error info when debug is disabled in config', () => {
    const serverError = new ServerError();
    const config = {
      getConfig: (key, fallback) => key !== 'debug'
    };

    serverError.getService = (key) => key === 'Config.js' ? config : null;
    const response = {
      status: (code) => {
        expect(code).to.equal(500);
        return {
          json: (data) => {
            expect(data).to.deep.equal({
              error: {
                code: 500,
                message: 'server error',
                context: {}
              }
            });
          }
        };
      }
    };

    serverError.getResponse = () => response;
    serverError.handle();
  });
});