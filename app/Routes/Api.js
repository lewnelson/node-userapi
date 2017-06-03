'use strict';

module.exports = () => {
  return {
    path: '/api/',
    getRoutes: () => {
      return [
        require('./Api/V1.js')()
      ];
    }
  }
}