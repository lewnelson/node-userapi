'use strict';

const Users = require('../../../app/Models/Users.js');
const expect = require('chai').expect;
const Promise = require('bluebird');
const Sequelize = require('sequelize');

describe('Users model class tests', () => {
  it('should return a promise from getTotalUsers', () => {
    const users = new Users();
    const userDatabaseModel = {
      count: () => new Promise.resolve()
    };

    const db = {
      getDatabaseModel: (model) => model === 'User.js' ? userDatabaseModel : undefined
    };

    users.getService = (key) => key === 'Database.js' ? db : null;
    expect(users.getTotalUsers()).to.be.an.instanceof(Promise);
  });

  it('should call findAll on the users database model with the correct options when getUsers is called and it should return a promise', () => {
    let dataSets = [
      {
        expectedOptions: { order: [] }
      },
      {
        limit: 10,
        offset: 5,
        ordering: [{ key: 'name', direction: 'ASC' }],
        expectedOptions: { order: [{ key: 'name', direction: 'ASC' }], limit: 10, offset: 5 }
      }
    ];

    dataSets.forEach((dataSet) => {
      const users = new Users();
      const userDatabaseModel = {
        findAll: (opts) => {
          expect(opts).to.deep.equal(dataSet.expectedOptions);
          return new Promise.resolve();
        }
      };

      const db = {
        getDatabaseModel: (model) => model === 'User.js' ? userDatabaseModel : undefined
      };

      users.getService = (key) => key === 'Database.js' ? db : null;
      expect(users.getUsers(dataSet.limit, dataSet.offset, dataSet.ordering)).to.be.an.instanceof(Promise);
    });
  });

  it('should reject the promise returned by createUser with a resource conflict error when there is a resource conflict', (done) => {
    const users = new Users();
    const resourceConflictError = new Error();
    users.resourceConflict = () => resourceConflictError;

    const connection = {
      UniqueConstraintError: new Sequelize.UniqueConstraintError()
    };

    const db = {
      getConnection: () => connection
    };

    const userDatabaseModel = {
      create: () => new Promise.reject(connection.UniqueConstraintError)
    };

    db.getDatabaseModel = (model) => model === 'User.js' ? userDatabaseModel : undefined;
    users.getService = (key) => key === 'Database.js' ? db : null;
    users.createUser().catch((err) => {
      expect(err).to.equal(resourceConflictError);
      done();
    });
  });

  it('should reject the promise returned by createUser with the error rejected from the database models create', (done) => {
    const users = new Users();
    const error = {};
    const connection = {
      UniqueConstraintError: new Sequelize.UniqueConstraintError()
    };

    const db = {
      getConnection: () => connection
    }

    const userDatabaseModel = {
      create: () => new Promise.reject(error)
    };

    db.getDatabaseModel = (model) => model === 'User.js' ? userDatabaseModel : undefined;
    users.getService = (key) => key === 'Database.js' ? db : null;
    users.createUser().catch((err) => {
      expect(err).to.equal(error);
      done();
    });
  });

  it('should resolve the promise returned by createUser with the user object from database models create and it should pass params to create', (done) => {
    const users = new Users();
    const error = {};
    const connection = {
      UniqueConstraintError: new Sequelize.UniqueConstraintError()
    };

    const db = {
      getConnection: () => connection
    }

    const params = {};
    const user = {};
    const userDatabaseModel = {
      create: (parameters) =>{
        expect(parameters).to.equal(params);
        return new Promise.resolve(user);
      }
    };

    db.getDatabaseModel = (model) => model === 'User.js' ? userDatabaseModel : undefined;
    users.getService = (key) => key === 'Database.js' ? db : null;
    users.createUser(params).then((result) => {
      expect(result).to.equal(user);
      done();
    });
  });

  it('should return a promise from getUser as query where id is passed id value', () => {
    const users = new Users();
    const id = 1;
    const params = {
      where: { id: id }
    };

    const userDatabaseModel = {
      findOne: (parameters) => {
        expect(parameters).to.deep.equal(params);
        return new Promise.resolve()
      }
    };

    const db = {
      getDatabaseModel: (model) => model === 'User.js' ? userDatabaseModel : undefined
    };

    users.getService = (key) => key === 'Database.js' ? db : null;
    expect(users.getUser(id)).to.be.an.instanceof(Promise);
  });

  it('should reject the promise returned by updateUser with a resource conflict error when there is a resource conflict', (done) => {
    const users = new Users();
    const resourceConflictError = new Error();
    users.resourceConflict = () => resourceConflictError;
    const userId = 1;

    const connection = {
      UniqueConstraintError: new Sequelize.UniqueConstraintError()
    };

    const db = {
      getConnection: () => connection
    };

    const userDatabaseModel = {
      update: () => new Promise.reject(connection.UniqueConstraintError)
    };

    users.getUser = (id) => {
      expect(id).to.equal(userId);
      return new Promise.resolve(userDatabaseModel);
    };

    users.getService = (key) => key === 'Database.js' ? db : null;
    users.updateUser(userId).catch((err) => {
      expect(err).to.equal(resourceConflictError);
      done();
    });
  });

  it('should reject the promise returned by createUser with the error rejected from the database models create', (done) => {
    const users = new Users();
    const error = {};
    const userId = 1;

    const connection = {
      UniqueConstraintError: new Sequelize.UniqueConstraintError()
    };

    const db = {
      getConnection: () => connection
    };

    const userDatabaseModel = {
      update: () => new Promise.reject(error)
    };

    users.getUser = (id) => {
      expect(id).to.equal(userId);
      return new Promise.resolve(userDatabaseModel);
    };

    users.getService = (key) => key === 'Database.js' ? db : null;
    users.updateUser(userId).catch((err) => {
      expect(err).to.equal(error);
      done();
    });
  });

  it('should reject the promise returned by createUser with a resource not found error when getUser fails to get the user', (done) => {
    const users = new Users();
    const connection = {
      UniqueConstraintError: new Sequelize.UniqueConstraintError()
    };

    users.getUser = () => Promise.resolve(null);
    users.getService = (key) => key === 'Database.js' ? {} : null;
    users.updateUser().catch((err) => {
      expect(err.status).to.equal(404);
      done();
    });
  });

  it('should resolve the promise returned by createUser with the user object from database models create and it should pass params to create', (done) => {
    const users = new Users();
    const error = {};
    const userId = 1;
    const params = {};
    const user = {};

    const connection = {
      UniqueConstraintError: new Sequelize.UniqueConstraintError()
    };

    const db = {
      getConnection: () => connection
    };

    const userDatabaseModel = {
      update: (parameters) => {
        expect(parameters).to.equal(params);
        return new Promise.resolve(user);
      }
    };

    users.getUser = (id) => {
      expect(id).to.equal(userId);
      return new Promise.resolve(userDatabaseModel);
    };

    users.getService = (key) => key === 'Database.js' ? db : null;
    users.updateUser(userId, params).then((data) => {
      expect(data).to.equal(user);
      done();
    });
  });

  it('should reject the promise returned by updateUser when getUser fails', (done) => {
    const users = new Users();
    const error = new Error();
    const connection = {
      UniqueConstraintError: new Sequelize.UniqueConstraintError()
    };

    users.getUser = () => Promise.reject(error);
    users.getService = (key) => key === 'Database.js' ? {} : null;
    users.updateUser().catch((err) => {
      expect(err).to.equal(error);
      done();
    });
  });

  it('should return a promise from deleteUser as query where id is passed id value', () => {
    const users = new Users();
    const id = 1;
    const params = {
      where: { id: id }
    };

    const userDatabaseModel = {
      destroy: (parameters) => {
        expect(parameters).to.deep.equal(params);
        return new Promise.resolve()
      }
    };

    const db = {
      getDatabaseModel: (model) => model === 'User.js' ? userDatabaseModel : undefined
    };

    users.getService = (key) => key === 'Database.js' ? db : null;
    expect(users.deleteUser(id)).to.be.an.instanceof(Promise);
  });
});