'use strict';

const ResourceController = require('../../../app/Framework/ResourceController.js');
const expect = require('chai').expect;

describe('ResourceController framework class tests', () => {
  it('should set limit property to 100 by default when instantiated', () => {
    const resourceController = new ResourceController();
    expect(resourceController.getLimit()).to.equal(100);
  });

  it('should return getPage from the request query as an integer when it is defined on the request query or 1 when it is NaN or undefined', () => {
    let dataSets = [['1', 1], ['-5', -5], ['test', 1], [undefined, 1]];
    const resourceController = new ResourceController();
    dataSets.forEach((dataSet) => {
      let request = {
        query: {
          page: dataSet[0]
        }
      };

      resourceController.getRequest = () => request;
      expect(resourceController.getPage()).to.equal(dataSet[1]);
    });
  });

  it('will return the correct sorting array based on the current routes resource schema and the sort query on the request', () => {
    let dataSets = [
      {
        getResourceSchema: () => {
          return [{ key: 'test', attributes: ['sortable'] }, { key: 'field', attributes: [] }];
        },
        getSortQuery: () => 'ASC_test,DESC_field',
        getExpectedSortArray: () => {
          return [{ key: 'test', direction: 'ASC' }];
        }
      },
      {
        getResourceSchema: () => {
          return [{ key: 'test', attributes: ['sortable'] }];
        },
        getSortQuery: () => 'ASC_test,DESC_test',
        getExpectedSortArray: () => {
          return [{ key: 'test', direction: 'ASC' }];
        }
      },
      {
        getResourceSchema: () => {
          return [{ key: 'test', attributes: ['sortable'] }, { key: 'created_at', attributes: ['sortable'] }];
        },
        getSortQuery: () => 'DESCENDING_test,ASC_created_at',
        getExpectedSortArray: () => {
          return [{ key: 'created_at', direction: 'ASC' }];
        }
      },
      {
        getResourceSchema: () => {
          return [{ key: 'test', attributes: ['sortable'] }];
        },
        getSortQuery: () => undefined,
        getExpectedSortArray: () => {
          return [];
        }
      }
    ];

    dataSets.forEach((dataSet) => {
      let currentRoute = {
            resourceSchema: dataSet.getResourceSchema()
          },
          request = {
            query: {
              sort: dataSet.getSortQuery()
            }
          };

      const resourceController = new ResourceController();
      resourceController.getCurrentRoute = () => currentRoute;
      resourceController.getRequest = () => request;
      expect(resourceController.getSorting()).to.deep.equal(dataSet.getExpectedSortArray());
    });
  });

  it('should get the offset based on the page number and limit, but only when the page is greated than 0, defaulting to an offset of 0', () => {
    let dataSets = [[-1, 0], [0, 0], [1, 0], [2, 100], [5, 400]];
    const resourceController = new ResourceController();
    dataSets.forEach((dataSet) => {
      resourceController.getPage = () => dataSet[0];
      expect(resourceController.getOffset()).to.equal(dataSet[1]);
    });
  });

  it('should get the url for the next page on getNextPageUrl when there are more results after the current result set', () => {
    let dataSets = [[3, 600, 4], [1, 200, 2]];
    const resourceController = new ResourceController();
    resourceController.getCurrentRoute = () => {
      return {name: ''};
    };

    dataSets.forEach((dataSet) => {
      let callCount = 0;
      resourceController.getPage = () => dataSet[0];
      const request = {
        query: {},
        params: {}
      };

      resourceController.generateUrl = (route, params, query) => {
        callCount++;
        expect(query).to.deep.equal({page: dataSet[2]});
      };

      resourceController.getRequest = () => request;
      resourceController.getNextPageUrl(dataSet[1]);
      expect(callCount).to.equal(1);
    });
  });

  it('should return null for getNextPageUrl when there are no more results to display', () => {
    const resourceController = new ResourceController();
    const request = {
      query: {},
    };

    resourceController.getRequest = () => request;
    resourceController.getPage = () => 1;
    expect(resourceController.getNextPageUrl(1)).to.be.null;
    resourceController.getPage = () => 0;
    expect(resourceController.getNextPageUrl(1)).to.be.null;
  });

  it('should return the url for the previous page on getPreviousPageUrl when the current page > 1', () => {
    let dataSets = [[3, 2], [2, 1]];
    const resourceController = new ResourceController();
    resourceController.getCurrentRoute = () => {
      return {name: ''};
    };

    dataSets.forEach((dataSet) => {
      let callCount = 0;
      resourceController.getPage = () => dataSet[0];
      const request = {
        query: {},
        params: {}
      };

      resourceController.generateUrl = (route, params, query) => {
        callCount++;
        expect(query).to.deep.equal({page: dataSet[1]});
      };

      resourceController.getRequest = () => request;
      resourceController.getPreviousPageUrl();
      expect(callCount).to.equal(1);
    });
  });

  it('should return null for getPreviousPageUrl when the current page is <= 1', () => {
    const resourceController = new ResourceController();
    const request = {
      query: {},
    };
    
    resourceController.getRequest = () => request;
    resourceController.getPage = () => 1;
    expect(resourceController.getPreviousPageUrl()).to.be.null;
    resourceController.getPage = () => 0;
    expect(resourceController.getPreviousPageUrl()).to.be.null;
  });

  it('should format resource based on routeParams when routeParams is passed to formatResource', () => {
    const resourceController = new ResourceController();
    let dataModel = {},
        href = '/path/to/resource/1',
        routeName = 'route',
        routeParams = {};

    resourceController.generateUrl = (name, params) => {
      return name === routeName && params === routeParams ? href : '';
    };

    dataModel = resourceController.formatResource(dataModel, routeName, routeParams);
    expect(dataModel.href).to.equal(href);
  });

  it('should attempt to generate the href from id for formatResource when no routeParams as passed and no route is found from the route name', () => {
    const resourceController = new ResourceController();
    let dataModel = {id: 1},
        routeName = 'route';

    resourceController.generateUrl = (name, params) => {
      expect(params).to.deep.equal({id: 1});
      return '';
    };

    resourceController.formatResource(dataModel, routeName);
  });

  it('should attempt to generate the href from id for formatResource when no routeParams and resourceSchema does not contain primary field', () => {
    const resourceController = new ResourceController();
    let route = {
          resourceSchema: [
            {
              key: 'primary',
              attributes: []
            }
          ]
        },
        dataModel = {id: 4, primary: 'key'},
        routeName = 'route';

    resourceController.getRouteFromName = (name) => name === routeName ? route : {};
    resourceController.generateUrl = (name, params) => {
      expect(params).to.deep.equal({id: 4});
      return '';
    };

    resourceController.formatResource(dataModel, routeName);
  });

  it('should use the primary key from the routes resource schema when no routeParams as passed to formatResource and a route is found from routeName', () => {
    const resourceController = new ResourceController();
    let route = {
          resourceSchema: [
            {
              key: 'primary',
              attributes: ['primary']
            }
          ]
        },
        dataModel = {primary: 'key'},
        routeName = 'route';

    resourceController.getRouteFromName = (name) => name === routeName ? route : {};
    resourceController.generateUrl = (name, params) => {
      expect(params).to.deep.equal({primary: 'key'});
      return '';
    };

    resourceController.formatResource(dataModel, routeName);
  });

  it('should use the primary key from the routes resource schema when no routeParams as passed to formatResource and a route is found from routeName and when the data model has no data for that key it will be set to \':primarykey\'', () => {
    const resourceController = new ResourceController();
    let route = {
          resourceSchema: [
            {
              key: 'primary',
              attributes: ['primary']
            }
          ]
        },
        dataModel = {},
        routeName = 'route';

    resourceController.getRouteFromName = (name) => name === routeName ? route : {};
    resourceController.generateUrl = (name, params) => {
      expect(params).to.deep.equal({primary: ':primary'});
      return '';
    };

    resourceController.formatResource(dataModel, routeName);
  });

  it('should return the correct format of object from formatCollection using the resources provided and totalResources', () => {
    const resourceController = new ResourceController();
    let dataSets = [
      {
        currentRoute: {
          name: 'test'
        },
        request: {
          params: {},
          query: {}
        },
        url: '/path/to/resources/',
        currentPage: 1,
        nextPage: null,
        previousPage: null,
        results: [],
        count: 0
      },
      {
        currentRoute: {
          name: 'testing'
        },
        request: {
          params: {},
          query: {page: 5}
        },
        url: '/path/to/resources/?page=5',
        currentPage: 5,
        nextPage: '/path/to/resources/?page=6',
        previousPage: '/path/to/resources/?page=4',
        results: [{}, {}, {}],
        count: 1000
      }
    ];

    dataSets.forEach((dataSet) => {
      resourceController.getCurrentRoute = () => dataSet.currentRoute;
      resourceController.getRequest = () => dataSet.request;
      resourceController.generateUrl = (name, params, query) => {
        return name === dataSet.currentRoute.name && params === dataSet.request.params && query === dataSet.request.query ? dataSet.url : false;
      }

      resourceController.getNextPageUrl = (resources) => resources === dataSet.count ? dataSet.nextPage : false;
      resourceController.getPreviousPageUrl = () => dataSet.previousPage;
      resourceController.getPage = () => dataSet.currentPage;
      expect(resourceController.formatCollection(dataSet.results, dataSet.count)).to.deep.equal({
        count: dataSet.count,
        href: dataSet.url,
        currentPage: dataSet.currentPage,
        nextPage: dataSet.nextPage,
        previousPage: dataSet.previousPage,
        results: dataSet.results
      });
    });
  });

  it('should cross reference incoming request body with the current route resourceSchema to build list for getCreateParams', () => {
    let dataSets = [
      {
        overwriteValues: false,
        getResourceSchema: () => {
          return [{ key: 'test', attributes: ['readonly'] }, { key: 'field', attributes: [] }];
        },
        getRequestBody: () => {
          return {
            test: 'value',
            field: true
          };
        },
        getExpectedCreateParams: () => {
          return { field: true };
        }
      },
      {
        overwriteValues: false,
        getResourceSchema: () => {
          return [{ key: 'test', attributes: ['readonly'] }, { key: 'field', attributes: [] }];
        },
        getRequestBody: () => {
          return {
            test: 'value'
          };
        },
        getExpectedCreateParams: () => {
          return {};
        }
      },
      {
        overwriteValues: true,
        getResourceSchema: () => {
          return [{ key: 'test', attributes: ['readonly'] }, { key: 'field', attributes: [] }];
        },
        getRequestBody: () => {
          return {
            test: 'value'
          };
        },
        getExpectedCreateParams: () => {
          return {field: null};
        }
      }
    ];

    const resourceController = new ResourceController();
    dataSets.forEach((dataSet) => {
      resourceController.getCurrentRoute = () => {
        return  {resourceSchema: dataSet.getResourceSchema() };
      };

      resourceController.getRequest = () => {
        return { body: dataSet.getRequestBody() };
      };

      expect(resourceController.getCreateParams(dataSet.overwriteValues)).to.deep.equal(dataSet.getExpectedCreateParams());
    });
  });

  it('should call getCreateParams with argument 0 as true when request is PUT from getUpdateParams', () => {
    const resourceController = new ResourceController();
    resourceController.getRequest = () => {
      return {
        method: 'PUT'
      };
    };

    resourceController.getCreateParams = (arg) => {
      expect(arg).to.be.true;
    };

    resourceController.getUpdateParams();
  });

  it('should call getCreateParams with argument 0 as false when request is not PUT from getUpdateParams', () => {
    const resourceController = new ResourceController();
    resourceController.getRequest = () => {
      return {
        method: 'PATCH'
      };
    };

    resourceController.getCreateParams = (arg) => {
      expect(arg).to.be.false;
    };

    resourceController.getUpdateParams();
  });

  it('should return an Error from resourceNotFound with a code and status of 404 and a message of `Resource not found`', () => {
    const resourceController = new ResourceController();
    const error = resourceController.resourceNotFound();
    expect(error.status).to.equal(404);
    expect(error.code).to.equal(404);
    expect(error.message).to.equal('Resource not found');
  });
});