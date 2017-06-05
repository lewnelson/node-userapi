'use strict';

const ErrorHandler = require('../Framework/ErrorHandler.js');
module.exports = class ServerError extends ErrorHandler {
  /**
   *  Handles the error
   *
   *  @return {void}
   */
  handle() {
    let error;
    if(this.getService('Config.js').getConfig('debug', false) === true) {
      error = {
        error: this.getDebugErrorObject()
      };
    } else {
      error = {
        error: {
          code: 500,
          message: 'server error',
          context: {}
        }
      };
    }

    this.getResponse().status(500).json(error);
  }

  /**
   *  Get error object for debug and logging
   *
   *  @return {object}
   */
  getDebugErrorObject() {
    return {
      url: this.getRequest().originalUrl,
      hostname: this.getRequest().hostname,
      protocol: this.getRequest().protocol,
      code: this.getError().code !== undefined ? this.getError().code : 500,
      message: this.getError().message !== undefined ? this.getError().message : 'server error',
      trace: {
        fileName: this.getError().fileName !== undefined ? this.getError().fileName : '',
        lineNumber: this.getError().lineNumber !== undefined ? this.getError().lineNumber : -1,
        name: this.getError().name !== undefined ? this.getError().name : '',
        stack: this.getError().stack !== undefined ? this.getError().stack.split('\n') : []
      },
      context: this.getError().context !== undefined ? this.getError().context : {}
    };
  }

  /**
   *  Logs the error
   *
   *  @return {void}
   */
  log() {
    this.getService('Logger.js').write('error', 'server_error', this.getDebugErrorObject());
  }
};