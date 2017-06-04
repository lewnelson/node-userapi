'use strict';

const Database = require('../../../app/Services/Database.js');
const expect = require('chai').expect;
const Sequelize = require('sequelize');
const mockRequire = require('mock-require');

describe('Database service class tests', () => {
  it('should get a valid database connection and persist the connection on getConnection when config maps to valid database', () => {
    const database = new Database();
    const environmentService = { getRootDir: () => '' };
    const configService = {
      getConfig: (key, fallback) => {
        if(key === 'db.connectionOptions') {
          return {
            dialect: 'sqlite',
            storage: ':memory:'
          };
        } else {
          return fallback;
        }
      }
    };

    const serviceMap = { 'Config.js': configService, 'Environment.js': environmentService };
    database.getService = (key) => serviceMap[key] || null;
    const connection = database.getConnection();
    expect(connection).to.equal(database.getConnection());
    expect(connection).to.be.an.instanceof(Sequelize);
    connection.close();
  });

  it('should find and call the database model when a valid database model is found on getDatabaseModel', () => {
    const database = new Database();
    const modelReturnValue = {};
    const model = () => modelReturnValue;
    const environmentService = { getAppDir: () => '/' };
    const modelName = 'Model.js';
    mockRequire('/DatabaseModels/' + modelName, model);
    database.getService = (key) => key === 'Environment.js' ? environmentService : null;
    expect(database.getDatabaseModel(modelName)).to.equal(modelReturnValue);
    mockRequire.stopAll();
  });

  it('should load each database model onto the connection and then sync the database connection on setup', () => {
    const database = new Database();
    const tables = ['TableOne.js', 'TableTwo.js'];
    const environmentService = { getAppDir: () => '/' };
    const tablesCalled = [];
    let syncCount = 0;
    const connection = {
      sync: () => syncCount++
    };

    const fs = require('fs');
    const fsReaddirsyncOriginal = fs.readdirSync;
    fs.readdirSync = (path) => path === '/DatabaseModels' ? tables : fsReaddirsyncOriginal.apply(fs, arguments);
    tables.forEach((table) => {
      mockRequire('/DatabaseModels/' + table, (dbConnection) => {
        tablesCalled.push(table);
        expect(dbConnection).to.equal(connection);
      })
    });

    database.getService = (key) => key === 'Environment.js' ? environmentService : null;
    database.getConnection = () => connection;
    database.setup();
    expect(syncCount).to.equal(1);
    expect(tablesCalled).to.deep.equal(tables);
    mockRequire.stopAll();
    fs.readdirSync = fsReaddirsyncOriginal;
  });
});