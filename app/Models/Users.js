'use strict';

const Model = require('../Framework/Model.js');
const Promise = require('bluebird');

module.exports = class Users extends Model {
  /**
   *  Get total number of users
   *
   *  @return {int}
   */
  getTotalUsers() {
    return this.getService('Database.js').getDatabaseModel('User.js').count();
  }

  /**
   *  Gets users with a limit and offset to paginate
   *
   *  @param {int} limit
   *  @param {int} offset
   *  @param {array} ordering
   *  @return {array} Array of user database models
   */
  getUsers(limit, offset, ordering) {
    let options = {
      order: ordering || []
    };

    if(limit !== undefined) {
      options.limit = limit;
    }

    if(offset !== undefined) {
      options.offset = offset;
    }

    return this.getService('Database.js').getDatabaseModel('User.js').findAll(options);
  }

  /**
   *  Create a user from params object
   *
   *  @param {object} params
   *  @return {User} user database model
   */
  createUser(params) {
    return new Promise((resolve, reject) => {
      this.getService('Database.js').getDatabaseModel('User.js').create(params).then((user) => {
        resolve(user);
      }).catch(this.getService('Database.js').getConnection().UniqueConstraintError, (err) => {
        reject(this.resourceConflict(err.errors));
      }).catch((err) => {
        reject(err);
      });
    });
  }

  /**
   *  Get a user by id
   *
   *  @param {int} id
   *  @return {User|null}
   */
  getUser(id) {
    return this.getService('Database.js').getDatabaseModel('User.js').findOne({
      where: {
        id: id
      }
    });
  }

  /**
   *  Update a user
   *
   *  @param {int} id
   *  @param {object} params
   *  @return {User}
   */
  updateUser(id, params) {
    return new Promise((resolve, reject) => {
      this.getUser(id).then((user) => {
        if(user === null) {
          let err = new Error();
          err.status = 404;
          reject(err);
        } else {
          user.update(params).then((user) => {
            resolve(user);
          }).catch(this.getService('Database.js').getConnection().UniqueConstraintError, (err) => {
            reject(this.resourceConflict(err.errors));
          }).catch((err) => {
            reject(err);
          });
        }
      });
    });
  }

  /**
   *  Delete a user
   *
   *  @param {int} id
   *  @return {void}
   */
  deleteUser(id) {
    let user = this.getUser(id);
    if(user !== null) {
      user.destroy();
    }
  }
}