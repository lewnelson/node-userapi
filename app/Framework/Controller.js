'use strict';

const RequestResponseAware = require('./RequestResponseAware.js');

/**
 *  All controller classes should extend from the controller
 */
module.exports = class Controller extends RequestResponseAware {
  /**
   *  Set all routes on the controller
   *
   *  @param {array} routes Array of Route objects
   *  @return {void}
   */
  setRoutes(routes) {
    this.routes = routes;
  }

  /**
   *  Set the current route
   *
   *  @param {object} route Route object
   *  @return {void}
   */
  setCurrentRoute(route) {
    this.currentRoute = route;
  }

  /**
   *  Gets the current route
   *
   *  @return {object} Route object
   */
  getCurrentRoute() {
    return this.currentRoute;
  }

  /**
   *  Attempt to get a route from route name
   *
   *  @param {string} routeName
   *  @return {Route|undefined}
   */
  getRouteFromName(routeName) {
    let routes = this.routes !== undefined ? this.routes.slice() : [],
        route;

    while(routes.length > 0 && route === undefined) {
      let nextRoute = routes.shift();
      if(nextRoute.name === routeName) {
        route = nextRoute;
      }
    }

    return route;
  }

  /**
   *  Generate a url from a route name and inject params for path references as
   *  well as appending query params
   *
   *  @param {string} routeName
   *  @param {object} params (optional)
   *  @param {object} queryParams (optional)
   *  @return {string}
   */
  generateUrl(routeName, params, queryParams) {
    params = params || {};
    queryParams = queryParams || {};
    let route = this.getRouteFromName(routeName);
    
    if(route === undefined) {
      let error = new Error('Unable to find route with name `' + routeName + '`');
      error.status = 500;
      throw error;
    }

    let path = route.path.replace(/\:([^\/]+)/g, (match, identifier) => {
      return params[identifier] || match;
    });

    if(Object.keys(queryParams).length > 0) {
      path = path.concat('?').concat(Object.keys(queryParams).map((key) => {
        return key + '=' + queryParams[key];
      }).join('&'));
    }

    return path;
  }

  /**
   *  Get a model object from the Models directory, will setup object with service
   *  container
   *
   *  @param {string} model
   *  @return {Model}
   */
  getModel(model) {
    let path = this.getService('Environment.js').getAppDir() + 'Models/' + model,
        modelClass = require(path);

    model = new modelClass();
    model.setServiceContainer(this.getServiceContainer());
    return model;
  }
};