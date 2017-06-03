'use strict';

const userDatabaseModelPath = '../../../app/DatabaseModels/User.js';
const Sequelize = require('sequelize');
const expect = require('chai').expect;

describe('User database model tests', () => {
  let userDatabaseModel;

  beforeEach(() => {
    userDatabaseModel = require(userDatabaseModelPath);
  });

  afterEach(() => {
    delete require.cache[require.resolve(userDatabaseModelPath)];
  });

  it('should define user on sequelize connection passed with correct column types and table name', (done) => {
    const expectedColumns = {
      email: {
        type: Sequelize.STRING,
        unique: true
      },
      forename: Sequelize.STRING,
      surname: Sequelize.STRING
    };

    const sequelize = {
      define: (table, columns) => {
        expect(table).to.equal('user');
        expect(columns).to.deep.equal(expectedColumns);
        done();
      }
    }

    userDatabaseModel(sequelize);
  });

  it('should only define user once regardless of how many times the database model is retrieved', () => {
    let callCount = 0;
    const sequelize = {
      define: () => callCount++
    }

    const model = userDatabaseModel(sequelize);
    expect(model).to.equal(userDatabaseModel());
    expect(callCount).to.equal(1);
  });
});