'use strict';

const Model = require('../../../app/Framework/Model.js');
const expect = require('chai').expect;

describe('Model framework class tests', () => {
  it('should return an Error from resourceConflict with a code and status of 409 and a message of `Resource conflict`', () => {
    const model = new Model();
    const error = model.resourceConflict();
    expect(error.status).to.equal(409);
    expect(error.code).to.equal(409);
    expect(error.message).to.equal('Resource conflict');
  });
});