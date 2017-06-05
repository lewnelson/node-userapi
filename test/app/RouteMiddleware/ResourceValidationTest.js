'use strict';

const ResourceValidation = require('../../../app/RouteMiddleware/ResourceValidation.js');
const expect = require('chai').expect;

describe('ResourceValidation route middleware class tests', () => {
  it('should validate scalar types on checkType', () => {
    let dataSets = [
      {
        value: '',
        type: 'string',
        valid: true
      },
      {
        value: false,
        type: 'string',
        valid: false
      },
      {
        value: false,
        type: 'boolean',
        valid: true
      },
      {
        value: 'false',
        type: 'boolean',
        valid: false
      },
      {
        value: [],
        type: 'array',
        valid: true
      },
      {
        value: {},
        type: 'array',
        valid: false
      },
      {
        value: {},
        type: 'object',
        valid: true
      },
      {
        value: [],
        type: 'object',
        valid: false
      },
      {
        value: 5,
        type: 'number',
        valid: true
      },
      {
        value: 5.2345,
        type: 'number',
        valid: true
      },
      {
        value: '5',
        type: 'number',
        valid: false
      }
    ];

    const resourceValidation = new ResourceValidation();
    dataSets.forEach((dataSet) => {
      expect(resourceValidation.checkType(dataSet.value, dataSet.type)).to.equal(dataSet.valid);
    });
  });

  it('should validate fields based on the request object and fields list and return an object of errors', () => {
    let dataSets = [
      {
        req: {
          body: {
            field: 'value',
            testing: [],
            key: 'value',
            valid: true
          }
        },
        fields: [
          {
            key: 'field',
            type: 'string',
            attributes: ['required'],
            validate: [
              {
                callback: (v) => true,
                error: 'error'
              }
            ],
            sanitize: [
              {
                callback: (v) => 'sanitized'
              }
            ]
          },
          {
            key: 'test',
            type: 'boolean',
            attributes: ['required']
          },
          {
            key: 'testing',
            type: 'object'
          },
          {
            key: 'valid',
            type: 'boolean'
          },
          {
            key: 'key',
            type: 'string',
            attributes: ['required'],
            validate: [
              {
                callback: (v) => false,
                error: 'error one'
              },
              {
                callback: (v) => false,
                error: 'error two'
              }
            ]
          }
        ],
        expectedErrors: {
          test: ['missing required value'],
          testing: ['invalid type, expecting object'],
          key: ['error one', 'error two']
        },
        expectedRequestBody: {
          field: 'sanitized',
          testing: [],
          key: 'value',
          valid: true
        }
      },
      {
        req: {
          body: {
            field: 'value'
          }
        },
        fields: [
          {
            key: 'field',
            type: 'string',
            attributes: ['required']
          },
          {
            key: 'optional',
            type: 'boolean'
          }
        ],
        expectedErrors: {},
        expectedRequestBody: {
          field: 'value'
        }
      }
    ];

    dataSets.forEach((dataSet) => {
      const resourceValidation = new ResourceValidation();
      const errors = resourceValidation.validateFields(dataSet.req, dataSet.fields);
      expect(errors).to.deep.equal(dataSet.expectedErrors);
      expect(dataSet.req.body).to.deep.equal(dataSet.expectedRequestBody);
    });
  });

  it('should exit from validateRequest when a routes resource schema is empty', () => {
    const resourceValidation = new ResourceValidation();
    expect(resourceValidation.validateRequest({}, { resourceSchema: [] })).to.be.undefined;
  });

  it('should not validate GET or DELETE requests', () => {
    let requestMethods = ['GET', 'DELETE'];
    requestMethods.map((method) => {
      const resourceValidation = new ResourceValidation();
      expect(resourceValidation.validateRequest({}, { httpMethod: method, resourceSchema: [{}] })).to.be.undefined;
    });
  });

  it('should remove readonly fields for validation on POST and PUT requests', () => {
    let dataSets = [
      {
        req: {},
        route: {
          httpMethod: 'PUT',
          resourceSchema: [
            {
              attributes: ['readonly']
            },
            {
              attributes: ['required']
            },
            {
              attributes: []
            }
          ]
        },
        expectedFields: [
          {
            attributes: ['required']
          },
          {
            attributes: []
          }
        ]
      },
      {
        req: {},
        route: {
          httpMethod: 'POST',
          resourceSchema: [
            {
              attributes: ['readonly']
            },
            {
              attributes: ['required']
            },
            {
              attributes: []
            }
          ]
        },
        expectedFields: [
          {
            attributes: ['required']
          },
          {
            attributes: []
          }
        ]
      }
    ];

    dataSets.forEach((dataSet) => {
      const resourceValidation = new ResourceValidation();
      resourceValidation.validateFields = (req, fields) => {
        expect(req).to.equal(dataSet.req);
        expect(fields).to.deep.equal(dataSet.expectedFields);
        return {};
      };

      expect(resourceValidation.validateRequest(dataSet.req, dataSet.route)).to.be.undefined;
    });
  });

  it('should remove readonly fields for validation on PATCH requests and remove required attributes from fields', () => {
    let dataSets = [
      {
        req: {},
        route: {
          httpMethod: 'patch',
          resourceSchema: [
            {
              attributes: ['readonly']
            },
            {
              attributes: ['required']
            },
            {
              attributes: []
            }
          ]
        },
        expectedFields: [
          {
            attributes: []
          },
          {
            attributes: []
          }
        ]
      }
    ];

    dataSets.forEach((dataSet) => {
      const resourceValidation = new ResourceValidation();
      resourceValidation.validateFields = (req, fields) => {
        expect(req).to.equal(dataSet.req);
        expect(fields).to.deep.equal(dataSet.expectedFields);
        return {};
      };

      expect(resourceValidation.validateRequest(dataSet.req, dataSet.route)).to.be.undefined;
    });
  });

  it('should throw a bad request error when there are validation errors', () => {
    let methods = ['put', 'post', 'patch'];
    methods.map((method) => {
      const errors = { key: ['invalid value'] };
      const resourceValidation = new ResourceValidation();
      resourceValidation.validateFields = (req, fields) => errors;
      try {
        resourceValidation.validateRequest({}, { httpMethod: method, resourceSchema: [{}] });
      } catch(err) {
        expect(err.status).to.equal(400);
        expect(err.context).to.equal(errors);
      }
    });
  });
});