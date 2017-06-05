'use strict';

const validator = require('validator');
module.exports = () => {
  return {
    path: '/users/',
    scopes: ['read:resource:users'],
    resourceSchema: [
      {
        key: 'id',
        type: 'integer',
        attributes: [
          'readonly',
          'primary',
          'sortable'
        ]
      },
      {
        key: 'email',
        type: 'string',
        attributes: [
          'required',
          'sortable',
          'unique'
        ],
        sanitize: [
          {
            callback: (value) => validator.normalizeEmail(value)
          }
        ],
        validate: [
          {
            callback: (value) => validator.isEmail(value),
            error: 'invalid email address'
          }
        ]
      },
      {
        key: 'forename',
        type: 'string',
        attributes: [
          'required',
          'sortable'
        ],
        validate: [
          {
            callback: (value) => value.match(/[0-9]/) === null,
            error: 'forename cannot contain numeric characters'
          }
        ]
      },
      {
        key: 'surname',
        type: 'string',
        attributes: [
          'required',
          'sortable'
        ],
        validate: [
          {
            callback: (value) => value.match(/[0-9]/) === null,
            error: 'surname cannot contain numeric characters'
          }
        ]
      },
      {
        key: 'createdAt',
        type: 'string',
        attributes: [
          'readonly',
          'sortable'
        ]
      },
      {
        key: 'updatedAt',
        type: 'string',
        attributes: [
          'readonly',
          'sortable'
        ]
      },
      {
        key: 'href',
        type: 'string',
        attributes: [
          'readonly'
        ]
      }
    ],
    getRoutes: () => {
      return [
        require('./Users/Collection.js')(),
        require('./Users/Item.js')()
      ];
    }
  };
};