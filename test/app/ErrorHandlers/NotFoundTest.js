'use strict';

const NotFound = require('../../../app/ErrorHandlers/NotFound.js');
const expect = require('chai').expect;

describe('NotFound error handler class tests', () => {
  it('should call logGenericError when log is called with notice log type and not_found message', () => {
    const notFound = new NotFound();
    notFound.logGenericError = (type, message) => {
      expect(type).to.equal('notice');
      expect(message).to.equal('not_found');
    };

    notFound.log();
  });

  it('should send a response with 404 status and error body when handle is called', () => {
    const notFound = new NotFound();
    let dataSets = [
      {
        error: {
          code: 404,
          message: 'resource not found',
          context: { key: false }
        },
        expectedJson: {
          error: {
            code: 404,
            message: 'resource not found',
            context: { key: false }
          }
        }
      },
      {
        error: {},
        expectedJson: {
          error: {
            code: 404,
            message: 'not found',
            context: {}
          }
        }
      }
    ];

    dataSets.forEach((dataSet) => {
      notFound.getError = () => dataSet.error;
      notFound.getResponse = () => {
        return {
          status: (code) => {
            expect(code).to.equal(404);
            return {
              json: (data) => {
                expect(data).to.deep.equal(dataSet.expectedJson);
              }
            };
          }
        };
      };

      notFound.handle();
    });
  });
});