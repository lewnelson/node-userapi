'use strict';

const ServiceAware = require('./ServiceAware.js');
module.exports = class Model extends ServiceAware {
  /**
   *  Creates a resource conflict error
   *
   *  @param {array|object} context Errors context
   *  @return {Error}
   */
  resourceConflict(context) {
    let error = new Error('Resource conflict');
    error.code = 409;
    error.status = 409;
    error.context = context;
    return error;
  }
};