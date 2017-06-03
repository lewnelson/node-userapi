"use strict";

const ErrorHandler = require('../Framework/ErrorHandler.js');
module.exports = class NotFound extends ErrorHandler {
  /**
   *  Handles the error
   *
   *  @return {void}
   */
  handle() {
    this.getResponse().status(404).json({
      error: {
        code: this.getError().code !== undefined ? this.getError().code : -1,
        message: this.getError().message,
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
    this.logGenericError('notice', 'not_found');
  }
}