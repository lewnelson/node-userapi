'use strict';

// Proceed with caution this will reset the database on the database connection
const randomWord = require('random-word');
const randomItem = require('random-item');
const randomName = require('node-random-name');
const Promise = require('bluebird');
const App = require('./app/App.js');
const app = new App();

/**
 *  Get amount of records to seed from command line args
 *
 *  @return {int} Unsigned integer
 */
function getAmount() {
  let amount = global.process.argv[2];
  return isNaN(parseInt(amount)) ? 500 : Math.abs(parseInt(amount));
}

/**
 *  Get a random tld string used for email
 *
 *  @return {string}
 */
function getTld() {
  return randomItem(['org', 'com', 'co.uk', 'io']);
}

/**
 *  Get random data object used to create database record
 *
 *  @return {object}
 */
function getData() {
    let forename = randomName({ random: Math.random, first: true }),
        surname = randomName({ random: Math.random, last: true });

    return {
      email: forename.toLowerCase() + '.' + surname.toLowerCase() + '@' + randomWord() + '.' + getTld(),
      forename: forename,
      surname: surname
    };
}

/**
 *  Seed the database users table
 *
 *  @param {User} userDatabaseModel
 *  @return {void}
 */
function seed(userDatabaseModel) {
  let promises = [],
      amount = getAmount();

  console.log('seeding database ...');
  for(let i = 0; i < amount; i++) {
    promises.push(userDatabaseModel.create(getData()));
  }

  Promise.all(promises).then(() => {
    console.log('seeded database with ' + amount + ' records');
    global.process.exit(0);
  }).catch((err) => {
    console.log('error seeding database :(');
    global.process.exit(1);
  });
}

// Setup app with services then setup database, clear database and seed
app.registerServices();
app.setupDatabase().then(() => {
  const db = app.getService('Database.js');
  db.getConnection().sync({ force: true }).then(() => {
    seed(db.getDatabaseModel('User.js'));
  });
});