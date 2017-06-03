'use strict';

const RequestResponseAware = require('./RequestResponseAware.js');
module.exports = class ErrorHandler extends RequestResponseAware {
  /**
   *  Set the error to be handled
   *
   *  @param {Error} error
   *  @return {void}
   */
  setError(error) {
    this.error = error;
  }

  /**
   *  Get the error to be handled
   *
   *  @return {Error}
   */
  getError() {
    return this.error;
  }

  /**
   *  Handle the error
   *
   *  @return {void}
   */
  handle() {}

  /**
   *  Logs an error in a common format
   *
   *  @param {string} type The log type
   *  @param {string} message The log message
   *  @return {void}
   */
  logGenericError(type, message) {
    this.getService('Logger.js').write(type, message, {
      url: this.getRequest().originalUrl,
      hostname: this.getRequest().hostname,
      protocol: this.getRequest().protocol,
      code: this.getError().code !== undefined ? this.getError().code : -1,
      message: this.getError().message,
      context: this.getError().context !== undefined ? this.getError().context : {}
    });
  }

  /**
   *  Logs the error
   *
   *  @return {void}
   */
  log() {}
}