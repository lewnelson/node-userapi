'use strict';

const ErrorHandler = require('../Framework/ErrorHandler.js');
module.exports = class ResourceConflict extends ErrorHandler {
  /**
   *  Handles the error
   *
   *  @return {void}
   */
  handle() {
    this.getResponse().status(409).json({
      error: {
        code: this.getError().code !== undefined ? this.getError().code : 409,
        message: this.getError().message !== undefined ? this.getError().message : 'resource conflict',
        context: this.getError().context !== undefined ? this.getError().context : {}
      }
    });
  }

  /**
   *  Logs the error
   *
   *  @return {void}
   */
  log() {
    this.logGenericError('warning', 'resource_conflict');
  }
}