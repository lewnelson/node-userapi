'use strict';

const ServiceAware = require('./ServiceAware.js');
module.exports = class RequestResponseAware extends ServiceAware {
  /**
   *  Set the request object
   *
   *  @param {Request} req
   *  @return {this}
   */
  setRequest(req) {
    this.request = req;
    return this;
  }

  /**
   *  Get the request object
   *
   *  @return {Request}
   */
  getRequest() {
    return this.request;
  }

  /**
   *  Set the response object
   *
   *  @param {Response} res
   *  @return {this}
   */
  setResponse(res) {
    this.response = res;
    return this;
  }

  /**
   *  Get the response object
   *
   *  @return {Response}
   */
  getResponse() {
    return this.response;
  }
};