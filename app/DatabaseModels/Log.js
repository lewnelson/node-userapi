'use strict';

const Sequelize = require('sequelize');
let Log;
module.exports = (sequelize) => {
  if(Log !== undefined) {
    return Log;
  }

  Log = sequelize.define('log', {
    logType: Sequelize.STRING,
    message: Sequelize.TEXT,
    context: Sequelize.TEXT
  });

  return Log;
};