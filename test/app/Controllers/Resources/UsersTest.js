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
    users.getSorting = () => [];
    users.formatCollection = (results, total) => formatCollectionResult;
    users.getResponse = () => response;

    users.getUsers();
  });

  it('should reject the promise returned from getUsers when an error is caught on one of the user model promises', (done) => {
    const users = new Users();
    const error = new Error();
    const getUsersPromise = Promise.reject(error);
    const getTotalUsersPromise = Promise.resolve(0);

    const userModel = {
      getUsers: () => getUsersPromise,
      getTotalUsers: () => getTotalUsersPromise
    };

    users.getPage = () => 1;
    users.getModel = (model) => model === 'Users.js' ? userModel : undefined;
    users.getSorting = () => [];

    users.getUsers().catch((err) => {
      expect(err).to.equal(error);
      done();
    });
  });

  it('should reject the promise returned from createUser when creating a user fails', (done) => {
    const users = new Users();
    const error = new Error();
    const createUserPromise = Promise.reject(error);

    const userModel = {
      createUser: () => createUserPromise
    };

    users.getModel = (model) => model === 'Users.js' ? userModel : undefined;
    users.getCreateParams = () => [];
    users.createUser().catch((err) => {
      expect(err).to.equal(error);
      done();
    });
  });

  it('should resolve the promise returned from createUser when creating a user is successful and it should respond with the resulting user object', (done) => {
    const users = new Users();
    const error = new Error();
    const user = {
      dataValues: {}
    };

    const createUserPromise = Promise.resolve(user);
    const userModel = {
      createUser: () => createUserPromise
    };

    users.getModel = (model) => model === 'Users.js' ? userModel : undefined;
    users.formatResource = (values) => values === user.dataValues ? user.dataValues : {};
    users.getCreateParams = () => [];
    users.getResponse = () => {
      return {
        json: (data) => {
          expect(data).to.equal(user.dataValues);
          done();
        }
      };
    };

    users.createUser();
  });

  it('should reject the promise returned from getUser when getting a user fails', (done) => {
    const users = new Users();
    const error = new Error();
    const getUserPromise = Promise.reject(error);

    const userModel = {
      getUser: () => getUserPromise
    };

    users.getModel = (model) => model === 'Users.js' ? userModel : undefined;
    users.getRequest = () => {
      return {
        params: { id: 1 }
      };
    };

    users.getUser().catch((err) => {
      expect(err).to.equal(error);
      done();
    });
  });

  it('should resolve the promise returned from getUser when getting a user is successful and should respond with the user object', (done) => {
    const users = new Users();
    const user = {
      dataValues: {}
    };

    const getUserPromise = Promise.resolve(user);
    const userModel = {
      getUser: () => getUserPromise
    };

    users.getModel = (model) => model === 'Users.js' ? userModel : undefined;
    users.getRequest = () => {
      return {
        params: { id: 1 }
      };
    };

    users.formatResource = (values) => values === user.dataValues ? user.dataValues : {};
    users.getResponse = () => {
      return {
        json: (data) => {
          expect(data).to.equal(user.dataValues);
          done();
        }
      };
    };

    users.getUser();
  });

  it('should reject the promise returned from getUser when getting a user returns null with a resourceNotFound error', (done) => {
    const users = new Users();
    const error = new Error();
    const user = null;
    const getUserPromise = Promise.resolve(user);
    const userModel = {
      getUser: () => getUserPromise
    };

    users.getModel = (model) => model === 'Users.js' ? userModel : undefined;
    users.resourceNotFound = () => error;
    users.getRequest = () => {
      return {
        params: { id: 1 }
      };
    };

    users.getUser().catch((err) => {
      expect(err).to.equal(error);
      done();
    });
  });

  it('should reject the promise returned by updateUser when updating the user fails', (done) => {
    const users = new Users();
    const error = new Error();
    const updateUserPromise = Promise.reject(error);
    const userModel = {
      updateUser: () => updateUserPromise
    };

    users.getModel = (model) => model === 'Users.js' ? userModel : undefined;
    users.getUpdateParams = () => {};
    users.getRequest = () => {
      return {
        params: { id: 1 }
      };
    };

    users.updateUser().catch((err) => {
      expect(err).to.equal(error);
      done();
    });
  });

  it('should resolve the promise returned by updateUser when updating a user is successful and respond with the updated user object', (done) => {
    const users = new Users();
    const user = {
      dataValues: {}
    };

    const updateUserPromise = Promise.resolve(user);
    const userModel = {
      updateUser: () => updateUserPromise
    };

    users.getModel = (model) => model === 'Users.js' ? userModel : undefined;
    users.getUpdateParams = () => {};
    users.resourceNotFound = () => error;
    users.formatResource = (data) => data === user.dataValues ? data: {};
    users.getRequest = () => {
      return {
        params: { id: 1 }
      };
    };

    users.getResponse = () => {
      return {
        json: (data) => {
          expect(data).to.equal(user.dataValues);
          done();
        }
      };
    };

    users.updateUser();
  });

  it('should reject the promise returned by updateUser with resourceNotFound when trying to update a user which does not exist', (done) => {
    const users = new Users();
    const error = new Error();
    error.status = 404;
    
    const updateUserPromise = Promise.reject(error);
    const userModel = {
      updateUser: () => updateUserPromise
    };

    users.getModel = (model) => model === 'Users.js' ? userModel : undefined;
    users.getUpdateParams = () => {};
    users.resourceNotFound = () => error;
    users.getRequest = () => {
      return {
        params: { id: 1 }
      };
    };

    users.updateUser().catch((err) => {
      expect(err).to.equal(error);
      done();
    });
  });

  it('should reject the promise returned by deleteUser when deleting a user fails', (done) => {
    const users = new Users();
    const error = new Error();
    const deleteUserPromise = Promise.reject(error);
    const userModel = {
      deleteUser: () => deleteUserPromise
    };

    users.getModel = (model) => model === 'Users.js' ? userModel : undefined;
    users.getRequest = () => {
      return {
        params: { id: 1 }
      };
    };

    users.deleteUser().catch((err) => {
      expect(err).to.equal(error);
      done();
    });
  });

  it('should resolve the promise returned by deleteUser and send a successful response when delete user is successful', (done) => {
    const users = new Users();
    const deleteUserPromise = Promise.resolve();
    const userModel = {
      deleteUser: () => deleteUserPromise
    };

    users.getModel = (model) => model === 'Users.js' ? userModel : undefined;
    users.getRequest = () => {
      return {
        params: { id: 1 }
      };
    };

    users.getResponse = () => {
      return {
        status: (code) => {
          expect(code).to.equal(200);
          done();
          return {
            end: () => {}
          };
        }
      };
    };

    users.deleteUser();
  });
});