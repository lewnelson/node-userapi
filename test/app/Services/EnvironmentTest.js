'use strict';

const Environment = require('../../../app/Services/Environment.js');
const expect = require('chai').expect;
const path = require('path');

describe('Environment service class tests', () => {
  it('should get the path to /app/ for getAppDir', () => {
    let expectedPath = path.normalize(__dirname + '/../../../app/'),
        env = new Environment();

    expect(path.normalize(env.getAppDir())).to.equal(expectedPath);
  });

  it('should get the path to / for getRootDir', () => {
    let expectedPath = path.normalize(__dirname + '/../../../'),
        env = new Environment();

    expect(path.normalize(env.getRootDir())).to.equal(expectedPath);
  });

  it('should get the path to /app/Controllers/ for getControllerDir', () => {
    let expectedPath = path.normalize(__dirname + '/../../../app/Controllers/'),
        env = new Environment();

    expect(path.normalize(env.getControllerDir())).to.equal(expectedPath);
  });
});