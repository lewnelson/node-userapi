'use strict';

module.exports = () => {
  return {
    path: '/v1/',
    getRoutes: () => {
      return [
        require('../Resources/Users.js')()
      ];
    }
  };
};