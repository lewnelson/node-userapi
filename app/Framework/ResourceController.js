'use strict';

const Controller = require('./Controller.js');

/**
 *  Resource based controllers
 */
module.exports = class ResourceController extends Controller {
  /**
   *  Set the resource collection limit
   */
  constructor() {
    super();
    this.limit = 100;
  }

  /**
   *  Get the requested page from the GET params, defaults to 1
   *
   *  @return {int}
   */
  getPage() {
    let page = parseInt(this.getRequest().query.page);
    return isNaN(page) ? 1 : page;
  }

  /**
   *  Get the limit used for collections of resources
   *
   *  @return {int}
   */
  getLimit() {
    return this.limit;
  }

  /**
   *  Get sorting array which contains sorting object containing a key and direction
   *  taken from the request query params and cross referenced against the resource
   *  schema
   *
   *  @return {array}
   */
  getSorting() {
    let sortableKeys = this.getCurrentRoute().resourceSchema.filter((field) => field.attributes.indexOf('sortable') > -1).map((item) => item.key),
        querySorting = this.getRequest().query.sort || '',
        sorting = [];

    querySorting.split(',').forEach((querySort) => {
      let matches = querySort.match(/^(ASC|DESC)_(.*)$/) || [],
          direction = matches[1],
          key = matches[2],
          index = sortableKeys.indexOf(key);
      
      if(index > -1 && direction !== undefined) {
        sorting.push({
          key: key,
          direction: direction
        });

        sortableKeys.splice(index, 1);
      }
    });

    return sorting;
  }

  /**
   *  Get the offset for fetching results on a collection
   *
   *  @return {int}
   */
  getOffset() {
    let page = this.getPage(),
        offset = 0;

    if(page > 0) {
      offset = this.getLimit() * (page - 1);
    }

    return offset;
  }

  /**
   *  Get the next page URL from the total amount of resources
   *
   *  @param {int} count
   *  @return {string|null}
   */
  getNextPageUrl(count) {
    let page = this.getPage(),
        offset = 0,
        queryParams = JSON.parse(JSON.stringify(this.getRequest().query));

    if(page > 0) {
      offset = this.getLimit() * (page);
      queryParams.page = page + 1;
    }

    return offset >= count || offset < 1 ? null : this.generateUrl(this.getCurrentRoute().name, this.getRequest().params, queryParams);
  }

  /**
   *  Get the previous page URL
   *
   *  @return {string|null}
   */
  getPreviousPageUrl() {
    let page = this.getPage(),
        queryParams = JSON.parse(JSON.stringify(this.getRequest().query));

    if(page > 0) {
      queryParams.page = page - 1;
    }

    return page > 1 ? this.generateUrl(this.getCurrentRoute().name, this.getRequest().params, queryParams) : null;
  }

  /**
   *  Format a resource from a data model object, adds href to the data model
   *  based on the routes resourceSchema or routeParams
   *
   *  @param {object} dataModel
   *  @param {string} routeName used for href
   *  @param {object} routeParams (optional) Params used to generate href if not
   *                              provided then will attempt to use primary key
   *                              from the routeNames resourceSchema.
   *                              
   *  @return {object}
   */
  formatResource(dataModel, routeName, routeParams) {
    if(routeParams === undefined) {
      let route = this.getRouteFromName(routeName);
      if(route !== undefined) {
        let primaryFields = route.resourceSchema.filter((field) => field.attributes.indexOf('primary') > -1);
        if(primaryFields.length > 0) {
          let key = primaryFields.shift().key;
          routeParams = {};
          routeParams[key] = dataModel[key] || ':' + key;
        }
      }
    }

    let id = dataModel.id !== undefined ? dataModel.id : ':id';
    routeParams = routeParams || {id: id};
    dataModel.href = this.generateUrl(routeName, routeParams);
    return dataModel;
  }

  /**
   *  Format a collection response
   *
   *  @param {array} resources
   *  @param {int} totalResources
   *  @return {object}
   */
  formatCollection(resources, totalResources) {
    return {
      count: totalResources,
      href: this.generateUrl(this.getCurrentRoute().name, this.getRequest().params, this.getRequest().query),
      currentPage: this.getPage(),
      nextPage: this.getNextPageUrl(totalResources),
      previousPage: this.getPreviousPageUrl(),
      results: resources
    };
  }

  /**
   *  Get params for creating resource
   *
   *  @return {object}
   */
  getCreateParams() {
    let fields = this.getCurrentRoute().resourceSchema.filter((field) => field.attributes.indexOf('readonly') === -1),
        params = {};

    while(fields.length > 0) {
      let field = fields.shift();
      if(this.getRequest().body[field.key] !== undefined) {
        params[field.key] = this.getRequest().body[field.key];
      }
    }

    return params;
  }

  /**
   *  Get params for updating resource
   *
   *  @return {object}
   */
  getUpdateParams() {
    return this.getCreateParams();
  }

  /**
   *  Creates a 404 error
   *
   *  @return {Error}
   */
  resourceNotFound() {
    let err = new Error('Resource not found');
    err.code = 404;
    err.status = 404;
    return err;
  }
}