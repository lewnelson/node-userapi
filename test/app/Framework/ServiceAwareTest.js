'use strict';

const ServiceAware = require('../../../app/Framework/ServiceAware.js');
const expect = require('chai').expect;

describe('ServiceAware framework class tests', () => {
  it('should get the service container set from setServiceContainer when getServiceContainer is called', () => {
    const serviceContainer = {};
    const serviceAware = new ServiceAware();
    serviceAware.setServiceContainer(serviceContainer);
    expect(serviceAware.getServiceContainer()).to.equal(serviceContainer);
  });

  it('should get a service from the service container when it exists on the service container', () => {
    const service = {};
    const serviceContainer = {
      get: () => service
    };

    const serviceAware = new ServiceAware();
    serviceAware.setServiceContainer(serviceContainer);
    expect(serviceAware.getService('test')).to.equal(service);
  });

  it('should return null when no service container has been set when getService is called', () => {
    const serviceAware = new ServiceAware();
    expect(serviceAware.getService('test')).to.be.null;
  });
});