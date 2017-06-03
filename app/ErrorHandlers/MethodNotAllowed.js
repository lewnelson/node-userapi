'use strict';

const ErrorHandler = require('../Framework/ErrorHandler.js');
module.exports = class MethodNotAllowed extends ErrorHandler {
  /**
   *  Handles the error
   *
   *  @return {void}
   */
  handle() {
    this.getResponse()
      .status(405)
      .append('Allow', this.getError().methodsAllowed.map((m) => m.toUpperCase()).join(','))
      .json({
        error: {
          code: this.getError().code !== undefined ? this.getError().code : -1,
          message: this.getError().message,
          context: {
            methodsAllowed: this.getError().methodsAllowed
          }
        }
      });
  }

  /**
   *  Logs the error
   *
   *  @return {void}
   */
  log() {
    this.logGenericError('warning', 'method_not_allowed');
  }
}