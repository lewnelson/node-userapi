'use strict';

const ResourceConflict = require('../../../app/ErrorHandlers/ResourceConflict.js');
const expect = require('chai').expect;

describe('ResourceConflict error handler class tests', () => {
  it('should call logGenericError when log is called with warning log type and resource_conflict message', () => {
    const resourceConflict = new ResourceConflict();
    resourceConflict.logGenericError = (type, message) => {
      expect(type).to.equal('warning');
      expect(message).to.equal('resource_conflict');
    };

    resourceConflict.log();
  });

  it('should send a response with 409 status and error body when handle is called', () => {
    const resourceConflict = new ResourceConflict();
    let dataSets = [
      {
        error: {
          code: 409,
          message: 'resource conflict error',
          context: { duplicate: ['email'] }
        },
        expectedJson: {
          error: {
            code: 409,
            message: 'resource conflict error',
            context: { duplicate: ['email'] }
          }
        }
      },
      {
        error: {},
        expectedJson: {
          error: {
            code: 409,
            message: 'resource conflict',
            context: {}
          }
        }
      }
    ];

    dataSets.forEach((dataSet) => {
      resourceConflict.getError = () => dataSet.error;
      resourceConflict.getResponse = () => {
        return {
          status: (code) => {
            expect(code).to.equal(409);
            return {
              json: (data) => {
                expect(data).to.deep.equal(dataSet.expectedJson);
              }
            };
          }
        };
      };

      resourceConflict.handle();
    });
  });
});