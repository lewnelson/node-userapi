'use strict';

const Service = require('../Framework/Service.js');
const fs = require('fs');
const Sequelize = require('sequelize');

module.exports = class Database extends Service {
  /**
   *  Get seqielize database connection
   *
   *  @return {sequelize}
   */
  getConnection() {
    if(this.connection === undefined) {
      let configService = this.getService('Config.js');
      this.connection = new Sequelize(
        configService.getConfig('db.database', 'main'),
        configService.getConfig('db.username', ''),
        configService.getConfig('db.password', ''),
        configService.getConfig('db.connectionOptions', {
          dialect: 'sqlite',
          storage: this.getService('Environment.js').getRootDir() + 'database.sqlite',
          logging: false
        })
      );
    }

    return this.connection;
  }

  /**
   *  Get a database model
   *
   *  @param {string} model
   *  @return {sequelize model}
   */
  getDatabaseModel(model) {
    return require(this.getService('Environment.js').getAppDir() + 'DatabaseModels/' + model)();
  }

  /**
   *  Will sync all database models to the database
   *
   *  @return {promise}
   */
  setup() {
    const models = fs.readdirSync(this.getService('Environment.js').getAppDir() + 'DatabaseModels').map((table) => {
      return require(this.getService('Environment.js').getAppDir() + 'DatabaseModels/' + table)(this.getConnection());
    });

    return this.getConnection().sync();
  }
}