'use strict';

const MethodNotAllowed = require('../../../app/ErrorHandlers/MethodNotAllowed.js');
const expect = require('chai').expect;

describe('MethodNotAllowed error handler class tests', () => {
  it('should call logGenericError when log is called with warning log type and method_not_allowed message', () => {
    const methodNotAllowed = new MethodNotAllowed();
    methodNotAllowed.logGenericError = (type, message) => {
      expect(type).to.equal('warning');
      expect(message).to.equal('method_not_allowed');
    };

    methodNotAllowed.log();
  });

  it('should send a response with 405 status and error body when handle is called', () => {
    const methodNotAllowed = new MethodNotAllowed();
    let dataSets = [
      {
        error: {
          code: 405,
          message: 'invalid request method',
          methodsAllowed: ['GET']
        },
        expectedJson: {
          error: {
            code: 405,
            message: 'invalid request method',
            context: { methodsAllowed : ['GET'] }
          }
        },
        expectedAllowHeader: 'GET'
      },
      {
        error: {
          methodsAllowed: ['GET', 'POST']
        },
        expectedJson: {
          error: {
            code: 405,
            message: 'method not allowed',
            context: { methodsAllowed : ['GET', 'POST'] }
          }
        },
        expectedAllowHeader: 'GET, POST'
      }
    ];

    dataSets.forEach((dataSet) => {
      methodNotAllowed.getError = () => dataSet.error;
      methodNotAllowed.getResponse = () => {
        return {
          status: (code) => {
            expect(code).to.equal(405);
            return {
              append: (header, value) => {
                expect(header).to.equal('Allow');
                expect(value).to.equal(dataSet.expectedAllowHeader);
                return {
                  json: (data) => {
                    expect(data).to.deep.equal(dataSet.expectedJson);
                  }
                };
              }
            };
          }
        };
      };

      methodNotAllowed.handle();
    });
  });
});