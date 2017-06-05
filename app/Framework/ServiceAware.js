'use strict';

module.exports = class ServiceAware {
  /**
   *  Set the service container object
   *
   *  @param {Container} serviceContainer
   *  @return {void}
   */
  setServiceContainer(serviceContainer) {
    this.serviceContainer = serviceContainer;
  }

  /**
   *  Get the service container object
   *
   *  @return {Container}
   */
  getServiceContainer() {
    return this.serviceContainer;
  }

  /**
   *  Get a service from the service container
   *
   *  @param {string} key
   *  @return {Service|null}
   */
  getService(key) {
    return this.getServiceContainer() ? this.getServiceContainer().get(key) : null;
  }
};