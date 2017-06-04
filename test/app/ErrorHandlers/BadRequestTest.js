'use strict';

const BadRequest = require('../../../app/ErrorHandlers/BadRequest.js');
const expect = require('chai').expect;

describe('BadRequest error handler class tests', () => {
  it('should call logGenericError when log is called with warning log type and bad_request message', () => {
    const badRequest = new BadRequest();
    badRequest.logGenericError = (type, message) => {
      expect(type).to.equal('warning');
      expect(message).to.equal('bad_request');
    };

    badRequest.log();
  });

  it('should send a response with 400 status and error body when handle is called', () => {
    const badRequest = new BadRequest();
    let dataSets = [
      {
        error: {
          code: 400,
          message: 'bad request data',
          context: { key: false }
        },
        expectedJson: {
          error: {
            code: 400,
            message: 'bad request data',
            context: { key: false }
          }
        }
      },
      {
        error: {},
        expectedJson: {
          error: {
            code: 400,
            message: 'bad request',
            context: {}
          }
        }
      }
    ];

    dataSets.forEach((dataSet) => {
      badRequest.getError = () => dataSet.error;
      badRequest.getResponse = () => {
        return {
          status: (code) => {
            expect(code).to.equal(400);
            return {
              json: (data) => {
                expect(data).to.deep.equal(dataSet.expectedJson);
              }
            };
          }
        };
      };

      badRequest.handle();
    });
  });
});