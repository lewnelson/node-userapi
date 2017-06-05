'use strict';

module.exports = () => {
  return {
    path: '/:id',
    getRoutes: () => {
      return [
        {
          httpMethod: 'get',
          controller: {
            path: 'Resources/Users.js',
            method: 'getUser'
          },
          name: 'resource:users:get'
        },
        {
          httpMethod: 'put',
          controller: {
            path: 'Resources/Users.js',
            method: 'updateUser'
          },
          scopes: ['write:resource:users'],
          name: 'resource:users:overwrite'
        },
        {
          httpMethod: 'patch',
          controller: {
            path: 'Resources/Users.js',
            method: 'updateUser'
          },
          scopes: ['write:resource:users'],
          name: 'resource:users:update'
        },
        {
          httpMethod: 'delete',
          controller: {
            path: 'Resources/Users.js',
            method: 'deleteUser'
          },
          scopes: ['write:resource:users'],
          name: 'resource:users:delete'
        }
      ];
    }
  };
};