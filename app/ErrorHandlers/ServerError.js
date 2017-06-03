'use strict';

const ErrorHandler = require('../Framework/ErrorHandler.js');
module.exports = class ServerError extends ErrorHandler {
  /**
   *  Handles the error
   *
   *  @return {void}
   */
  handle() {
    let stack = this.getError().stack !== undefined ? this.getError().stack.split('\n') : [];
    this.getResponse().status(500).json({
      error: {
        code: this.getError().code !== undefined ? this.getError().code : -1,
        message: this.getError().message,
        trace: {
          fileName: this.getError().fileName || '',
          lineNumber: this.getError().lineNumber !== undefined ? this.getError().lineNumber : -1,
          name: this.getError().name || '',
          stack: stack
        },
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
    let stack = this.getError().stack !== undefined ? this.getError().stack.split('\n') : [];
    this.getService('Logger.js').write('error', 'server_error', {
      url: this.getRequest().originalUrl,
      hostname: this.getRequest().hostname,
      protocol: this.getRequest().protocol,
      code: this.getError().code !== undefined ? this.getError().code : -1,
      message: this.getError().message,
      trace: {
        fileName: this.getError().fileName || '',
        lineNumber: this.getError().lineNumber !== undefined ? this.getError().lineNumber : -1,
        name: this.getError().name || '',
        stack: stack
      },
      context: this.getError().context !== undefined ? this.getError().context : {}
    });
  }
}