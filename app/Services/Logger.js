'use strict';

const Service = require('../Framework/Service.js');
module.exports = class Logger extends Service {
  /**
   *  Write out a log, will write to database
   *
   *  @param {string} logType
   *  @param {string} messag
   *  @param {object} context
   *  @return {void}
   */
  write(logType, message, context) {
    this.getService('Database.js').getDatabaseModel('Log.js').create({
      logType: logType,
      message: message,
      context: JSON.stringify(context)
    });
  }
}