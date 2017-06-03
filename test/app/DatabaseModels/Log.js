'use strict';

const logDatabaseModelPath = '../../../app/DatabaseModels/Log.js';
const Sequelize = require('sequelize');
const expect = require('chai').expect;

describe('Log database model tests', () => {
  let logDatabaseModel;

  beforeEach(() => {
    logDatabaseModel = require(logDatabaseModelPath);
  });

  afterEach(() => {
    delete require.cache[require.resolve(logDatabaseModelPath)];
  });

  it('should define log on sequelize connection passed with correct column types and table name', (done) => {
    const expectedColumns = {
      logType: Sequelize.STRING,
      message: Sequelize.TEXT,
      context: Sequelize.TEXT
    };

    const sequelize = {
      define: (table, columns) => {
        expect(table).to.equal('log');
        expect(columns).to.deep.equal(expectedColumns);
        done();
      }
    }

    logDatabaseModel(sequelize);
  });

  it('should only define log once regardless of how many times the database model is retrieved', () => {
    let callCount = 0;
    const sequelize = {
      define: () => callCount++
    }

    const model = logDatabaseModel(sequelize);
    expect(model).to.equal(logDatabaseModel());
    expect(callCount).to.equal(1);
  });
});