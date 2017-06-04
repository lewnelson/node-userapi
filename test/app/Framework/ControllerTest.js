'use strict';

const Controller = require('../../../app/Framework/Controller.js');
const expect = require('chai').expect;
const Container = require('../../../app/Framework/Container.js');
const sinon = require('sinon');
const mockRequire = require('mock-require');

describe('Framework container class tests', () => {
  it('should set routes property when setRoutes is called', () => {
    const routes = [{key: 'value1'}, {key: 'value2'}];
    const controller = new Controller();
    controller.setRoutes(routes);
    expect(controller.routes).to.equal(routes);
  });

  it('should get the current route object when it has been set on getCurrentRoute', () => {
    const controller = new Controller();
    const currentRoute = {key: 'value'};
    controller.setCurrentRoute(currentRoute);
    expect(controller.getCurrentRoute()).to.equal(currentRoute);
  });

  it('should return undefined when a route cannot be found on getRouteFromName', () => {
    const controller = new Controller();
    const routes = [{name: 'route_1'}, {name: 'route_2'}];
    controller.setRoutes(routes);
    expect(controller.getRouteFromName('test')).to.be.undefined;
  });

  it('should return the route when it is found on getRouteFromName', () => {
    let routes = [{name: 'route_1'}, {name: 'route_2'}],
        routeToFind = {name: 'route_3'};

    routes.push(routeToFind);
    const controller = new Controller();
    controller.setRoutes(routes);
    expect(controller.getRouteFromName(routeToFind.name)).to.deep.equal(routeToFind);
  });

  it('should throw a server error when trying to generateUrl for a route which doesn\'t exist', () => {
    const controller = new Controller();
    controller.setRoutes([]);
    try {
      controller.generateUrl('test');
    } catch(e) {
      expect(e.status).to.equal(500);
    }
  });

  it('should swap parameters from the parameters object into the route path', () => {
    let route = {
          path: '/path/to/:resource/:id/:nonexistant',
          name: 'test'
        },
        params = {resource: 'resource', id: 1},
        expectedPath = '/path/to/resource/1/:nonexistant';

    const controller = new Controller();
    controller.setRoutes([route]);
    expect(controller.generateUrl(route.name, params)).to.equal(expectedPath);
  });

  it('should append query parameters to the path found on the route when query params object is set', () => {
    let route = {
          path: '/path/to/resource/',
          name: 'test'
        },
        queryParams = {page: 5, sort: 'ASC_id'},
        expectedPath = '/path/to/resource/?page=5&sort=ASC_id';

    const controller = new Controller();
    controller.setRoutes([route]);
    expect(controller.generateUrl(route.name, {}, queryParams)).to.equal(expectedPath);
  });

  it('should return a model class setup with the service container when getModel is called for a valid model', () => {
    const controller = new Controller();
    controller.getService = (key) => {
      if(key === 'Environment.js') {
        return {
          getAppDir: () => '/'
        };
      } else {
        return null;
      }
    };

    let modelSetServiceContainerSpy = sinon.spy(),
        modelClass = class ModelClass {
          setServiceContainer() {
            modelSetServiceContainerSpy();
          }
        };

    mockRequire('/Models/Test.js', modelClass);
    controller.getModel('Test.js');
    expect(modelSetServiceContainerSpy.callCount).to.equal(1);
  });
});