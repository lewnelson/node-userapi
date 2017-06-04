'use strict';

const RequestResponseAware = require('../../../app/Framework/RequestResponseAware.js');
const expect = require('chai').expect;

describe('RequestResponseAware framework class tests', () => {
  it('should get the request set from setRequest when getRequest is called', () => {
    const req = {};
    const requestResponseAware = new RequestResponseAware();
    requestResponseAware.setRequest(req);
    expect(requestResponseAware.getRequest()).to.equal(req);
  });

  it('should get the response set from setResponse when getResponse is called', () => {
    const res = {};
    const requestResponseAware = new RequestResponseAware();
    requestResponseAware.setResponse(res);
    expect(requestResponseAware.getResponse()).to.equal(res);
  });
});