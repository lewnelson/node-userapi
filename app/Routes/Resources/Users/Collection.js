'use strict';

module.exports = () => {
  return {
    getRoutes: () => {
      return [
        {
          httpMethod: 'get',
          controller: {
            path: 'Resources/Users.js',
            method: 'getUsers'
          },
          name: 'resource:users:getAll'
        },
        {
          httpMethod: 'post',
          controller: {
            path: 'Resources/Users.js',
            method: 'createUser'
          },
          scopes: ['write:resource:users'],
          name: 'resource:users:create'
        }
      ];
    }
  }
};