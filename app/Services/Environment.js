'use strict';

const Service = require('../Framework/Service.js');
module.exports = class Environment extends Service {
  /**
   *  Get the system path to the app directory
   *
   *  @return {string}
   */
  getAppDir() {
    return __dirname + '/../';
  }

  /**
   *  Get the system path to the root directory
   *
   *  @return {string}
   */
  getRootDir() {
    return this.getAppDir() + '../';
  }

  /**
   *  Get the system path to the controllers directory
   *
   *  @return {string}
   */
  getControllerDir() {
    return this.getAppDir() + 'Controllers/';
  }

  /**
   *  Get environment variable
   *
   *  @param {string} key
   *  @return {mixed}
   */
  getEnvVar(key) {
    return global.process.env[key];
  }
}