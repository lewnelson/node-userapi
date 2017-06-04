'use strict';

const Users = require('../../../../app/Controllers/Resources/Users.js');
const expect = require('chai').expect;
const Promise = require('bluebird');

describe('Users resources controller tests', () => {
  it('should return a promise for getUsers', () => {
    const users = new Users();
    users.getPage = () => 0;
    const result = users.getUsers().catch((error) => error);
    expect(result).to.be.an.instanceof(Promise);
  });

  it('should reject the promise with resource not found when page is less than 0 for getUsers', (done) => {
    const users = new Users();
    users.getPage = () => 0;

    const error = new Error();
    users.resourceNotFound = () => error;

    const result = users.getUsers().catch((reason) => {
      expect(reason).to.equal(error);
      done();
    });
  });

  it('should reject the promise with resource not found when page is greater than one and no results were found', (done) => {
    const users = new Users();
    const getUsersResult = [];
    const getUsersPromise = Promise.resolve(getUsersResult);
    const getTotalUsersPromise = Promise.resolve(0);
    const error = new Error();
    const userModel = {
      getUsers: () => getUsersPromise,
      getTotalUsers: () => getTotalUsersPromise
    };

    users.getPage = () => 2;
    users.getModel = (model) => model === 'Users.js' ? userModel : undefined;
    users.formatResource = (item) => item;
    users.resourceNotFound = () => error;
    users.getSorting = () => [{ key: 'key', direction: 'ASC' }];

    users.getUsers().catch((err) => {
      expect(err).to.equal(error);
      done();
    });
  });

  it('should return an empty result set when the page is 1 and no results were found', (done) => {
    const users = new Users();
    const getUsersResult = [];
    const getUsersPromise = Promise.resolve(getUsersResult);
    const getTotalUsersPromise = Promise.resolve(0);
    const error = new Error();
    const formatCollectionResult = [];
    const response = {
      json: (data) => {
        expect(data).to.equal(formatCollectionResult);
        done();
      }
    };

    const userModel = {
      getUsers: () => getUsersPromise,
      getTotalUsers: () => getTotalUsersPromise
    };

    users.getPage = () => 1;
    users.getModel = (model) => model === 'Users.js' ? userModel : undefined;
    users.formatResource = (item) => item;
    users.resourceNotFound = () => error;
    users.getSorting = () => [];
    users.formatCollection = (results, total) => formatCollectionResult;
    users.getResponse = () => response;

    users.getUsers();
  });

  it('should return list of formatted users collection when there are users found', (done) => {
    const users = new Users();
    const user = {id: 1};
    const getUsersResult = [user];
    const getUsersPromise = Promise.resolve(getUsersResult);
    const getTotalUsersPromise = Promise.resolve(0);
    const error = new Error();
    const formatCollectionResult = [user];
    const response = {
      json: (data) => {
        expect(data).to.equal(formatCollectionResult);
        done();
      }
    };

    const userModel = {
      getUsers: () => getUsersPromise,
      getTotalUsers: () => getTotalUsersPromise
    };

    users.getPage = () => 1;
    users.getModel = (model) => model === 'Users.js' ? userModel : undefined;
    users.formatResource = (item) => item;
    users.resourceNotFound = () => error;
    users.getSorting = () => [];
    users.formatCollection = (results, total) => formatCollectionResult;
    users.getResponse = () => response;

    users.getUsers();
  });
});