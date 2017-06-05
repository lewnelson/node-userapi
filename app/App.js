'use strict';

const ServiceAware = require('./Framework/ServiceAware.js');
const Container = require('./Framework/Container.js');
const ResourceValidation = require('./RouteMiddleware/ResourceValidation.js');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const clone = require('clone');

/**
 *  Application instance, will setup services, routes and error handlers
 */
module.exports = class App extends ServiceAware {
  /**
   *  Setup instance with a new dependency container for services
   */
  constructor() {
    super();
    this.setServiceContainer(new Container());
    this.routes = [];
  }

  /**
   *  Will recursivley parse a directory for items and call itemCallback for each
   *  item found. Will stop when max levels is reached.
   *
   *  @param {string} directory Directory path to scan
   *  @param {int} maxLevels Maximum levels to scan into, 0 for top level, -1 for infinite
   *  @param {function} itemCallback Function called for each item with the
   *                                 following arguments
   *                                  - itemPath {string} Path to the item
   *                                  - value {string} Filename
   *                                  - namespace {string} Preceeding namespace i.e.
   *                                    directory path relative to starting directory
   *                                 the resulting value of the callback is appended
   *                                 to the list of items
   *
   *  @param {array} items (optional) array of items
   *  @param {string} namespace (optional) namespace of current directory
   *  @param {integer} level What level of directory is being scanned
   *  @return {array} items array retrieved via itemCallback
   */
  recursivelyScanDirectory(directory, maxLevels, itemCallback, items, namespace, level) {
    items = items || [];
    namespace = namespace || '';
    level = level || 0;

    let scanItems = fs.readdirSync(directory);
    scanItems.forEach((value) => {
      let itemPath = directory + '/' + value,
          stat = fs.statSync(itemPath);

      if(stat.isDirectory() && (level < maxLevels || maxLevels < 0)) {
        this.recursivelyScanDirectory(itemPath, maxLevels, itemCallback, items, this.resolveNamespace(value, namespace), level + 1);
      } else if(stat.isFile()) {
        items.push(itemCallback(itemPath, value, namespace));
      }
    });

    return items;
  }

  /**
   *  Concats item onto namespace string separated by '/' where namespace is
   *  an empty string then the item alone is returned
   *
   *  @param {string} item
   *  @param {string} namespace
   *  @return {string}
   */
  resolveNamespace(item, namespace) {
    return namespace.length > 0 ? namespace + '/' + item : item;
  }

  /**
   *  Registers all service objects onto the service container
   *
   *  @return {void}
   */
  registerServices() {
    this.recursivelyScanDirectory(__dirname + '/Services', -1, (itemPath, value, namespace) => {
      this.getServiceContainer().register(this.resolveNamespace(value, namespace), () => {
        let serviceClass = require(itemPath),
            service = new serviceClass();

        service.setServiceContainer(this.getServiceContainer());
        return service;
      });
    });
  }

  /**
   *  Validates a request method against a route and will throw a method not
   *  allowed error if the method is not allowed.
   *
   *  @param {Request} req Express request
   *  @param {Route} route
   *  @param {array} routes All routes
   *  @throws {Error} If method is not allowed
   *  @return {void}
   */
  validateRequestMethod(req, route, routes) {
    let availableMethods = routes.filter((r) => r.path === route.path).map((r) => r.httpMethod.toUpperCase());
    if(availableMethods.indexOf(req.method.toUpperCase()) < 0) {
      let error = new Error();
      error.code = 405;
      error.status = 405;
      error.methodsAllowed = availableMethods;
      throw error;
    }
  }

  /**
   *  Binds a route onto the express instance
   *
   *  @param {object} route The route object to bind
   *  @return {void}
   */
  bindRoute(route) {
    this.routes.push(route);
    this.getApp().all(route.path, (req, res, next) => {
      this.validateRequestMethod(req, route, this.routes);
      if(req.method.toUpperCase() !== route.httpMethod.toUpperCase()) {
        next();
        return;
      }

      let controllerClass = require(this.getService('Environment.js').getControllerDir() + route.controller.path),
          controller = new controllerClass();

      controller.setServiceContainer(this.getServiceContainer());
      controller.setRequest(req).setResponse(res);
      controller.setCurrentRoute(clone(route));
      controller.setRoutes(clone(this.routes));
      try {
        const validation = new ResourceValidation();
        validation.validateRequest(req, clone(route));
        controller[route.controller.method]().then(() => {
          next();
        }, (err) => {
          next(err);
        }).catch((err) => {
          next(err);
        });
      } catch(err) {
        next(err);
      }
    });
  }

  /**
   *  Join two route paths together
   *
   *  @param {string} prefixPath
   *  @param {string} suffixPath
   *  @return {string}
   */
  concatRoutePath(prefixPath, suffixPath) {
    return prefixPath.concat(suffixPath).replace(/\/{2,}/g, '/');
  }

  /**
   *  Register a route, a route is treated as a route group or a route object
   *  route groups contain more routes and route groups, whereas routes are final
   *  and contain reference to a controller and method on that controller.
   *
   *  @param {object} route
   *  @param {object} path
   *  @param {array} scopes
   *  @param {object} resourceSchema Resource schema for the route, cascades through
   *                                 groups.
   *
   *  @throws {Error} If the route item is neither a route or a route group as defined
   *                  by the objects properties
   *                  
   *  @return {object} Return the route
   */
  registerRoute(route, path, scopes, resourceSchema) {
    scopes = scopes || [];
    path = path || '';
    resourceSchema = resourceSchema || [];
    if(typeof route.getRoutes === 'function') {
      route.getRoutes().map((r) => this.registerRoute(
        r,
        this.concatRoutePath(path, r.path || ''),
        scopes.concat(route.scopes || []),
        route.resourceSchema || resourceSchema
      ));
    } else if(route.controller !== undefined) {
      route.resourceSchema = route.resourceSchema || resourceSchema;
      route.scopes = scopes.concat(route.scopes || []);
      route.path = this.concatRoutePath(path, route.path || '');
      this.bindRoute(route);
    } else {
      throw new Error('route `' + path + '` is invalid and does not contain sub routes or a callback');
    }

    return route;
  }

  /**
   *  Registers all routes inside ./Routes on the top level, route objects reference
   *  controllers or other routes within Routes
   *
   *  @return {void}
   */
  registerRoutes() {
    this.routes = [];
    this.recursivelyScanDirectory(__dirname + '/Routes', 0, (itemPath) => this.registerRoute(require(itemPath)()));
  }

  /**
   *  Registers the not found handler to the app instance, if no route is found
   *  i.e. no response sent then it can be assumed that a 404 response is justified
   *
   *  @return {void}
   */
  registerNotFoundHandler() {
    this.getApp().use((req, res, next) => {
      if(res.headersSent === false) {
        let err = new Error();
        err.status = 404;
        next(err);
      }
    });
  }

  /**
   *  Register the error handler which will catch errors and invoke the correct
   *  handler based on the error status
   *
   *  @return {void}
   */
  registerErrorHandlers() {
    let handlers = {
          400: './ErrorHandlers/BadRequest.js',
          404: './ErrorHandlers/NotFound.js',
          405: './ErrorHandlers/MethodNotAllowed',
          409: './ErrorHandlers/ResourceConflict.js',
          500: './ErrorHandlers/ServerError.js'
        },
        defaultError = 500;

    this.getApp().use((err, req, res, next) => {
      let status = err.status !== undefined ? err.status : defaultError;
      if(Object.keys(handlers).indexOf(status.toString()) < 0) {
        status = defaultError;
      }

      let handlerClass = require(handlers[status]),
          handler = new handlerClass();

      handler.setServiceContainer(this.getServiceContainer());
      handler.setError(err);
      handler.setRequest(req).setResponse(res);
      if(res.headersSent === false) {
        handler.handle();
      }

      handler.log();
      next();
    });
  }

  /**
   *  Get the express instance
   *
   *  @return {express}
   */
  getApp() {
    if(this.app === undefined) {
      this.app = new express();
      this.app.use(bodyParser.json());
      this.app.use(bodyParser.urlencoded({ extended: true }));
    }

    return this.app;
  }

  /**
   *  Setup database schema from reading database models
   *
   *  @return void
   */
  setupDatabase() {
    return this.getService('Database.js').setup();
  }

  /**
   *  Will bind services, routes and error handlers then run the server via express
   *
   *  @return {void}
   */
  run() {
    this.registerServices();
    this.registerRoutes();
    this.registerNotFoundHandler();
    this.registerErrorHandlers();
    this.setupDatabase().then(() => {
      const port = this.getService('Config.js').getConfig('port', 8080);
      this.getApp().listen(port, () => {
        console.log('Server listening on port ' + port);
      });
    });
  }
};