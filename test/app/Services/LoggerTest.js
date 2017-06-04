'use strict';

const Logger = require('../../../app/Services/Logger.js');
const expect = require('chai').expect;

describe('Logger service class tests', () => {
  it('should write the log to the database Log.js model when write is called', () => {
    const logType = 'testing';
    const message = 'test';
    const context = { additional: [0, 1, 2] };
    const logDatabaseModel = {
      create: (params) => {
        expect(params).to.deep.equal({
          logType: logType,
          message: message,
          context: JSON.stringify(context)
        });
      }
    };

    const databaseService = {
      getDatabaseModel: (model) => model === 'Log.js' ? logDatabaseModel : null
    };

    const logger = new Logger();
    logger.getService = (key) => key === 'Database.js' ? databaseService : null;
    logger.write(logType, message, context);
  });
});