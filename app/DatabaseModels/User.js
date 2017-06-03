'use strict';

const Sequelize = require('sequelize');
let User;
module.exports = (sequelize) => {
  if(User !== undefined) {
    return User;
  }

  User = sequelize.define('user', {
    email: {
      type: Sequelize.STRING,
      unique: true
    },
    forename: Sequelize.STRING,
    surname: Sequelize.STRING
  });

  return User;
};