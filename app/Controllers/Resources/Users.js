"use strict";

const ResourceController = require('../../Framework/ResourceController.js');
const Promise = require('bluebird');

module.exports = class Users extends ResourceController {
  /**
   *  Get a collection of users, will be a paginated result
   *
   *  @return {Promise}
   */
  getUsers() {
    return new Promise((resolve, reject) => {
      if(this.getPage() < 1) {
        reject(this.resourceNotFound());
        return;
      }

      const usersModel = this.getModel('Users.js'),
            promises = [
              usersModel.getUsers(
                this.getLimit(),
                this.getOffset(),
                this.getSorting().map((sort) => [sort.key, sort.direction])
              ),
              usersModel.getTotalUsers()
            ];

      Promise.all(promises).then((results) => {
        let users = results[0].map((user) => this.formatResource(user.dataValues, 'resource:users:get')),
            totalUsers = results[1];

        if(this.getPage() > 1 && users.length < 1) {
          reject(this.resourceNotFound());
        } else {
          this.getResponse().json(this.formatCollection(users, totalUsers));
          resolve();
        }
      });
    });
  }

  /**
   *  Create a user, will send response with the new user
   *
   *  @return {void}
   */
  createUser() {
    const usersModel = this.getModel('Users.js');
    return new Promise((resolve, reject) => {
      usersModel.createUser(this.getCreateParams()).then((user) => {
        if(user === null) {
          reject(this.resourceNotFound());
        } else {
          user = this.formatResource(user.dataValues, 'resource:users:get');
          this.getResponse().json(user);
          resolve();
        }
      });
    });
  }

  /**
   *  Get a single user, uses id to get user
   *
   *  @return {void}
   */
  getUser() {
    const usersModel = this.getModel('Users.js');
    return new Promise((resolve, reject) => {
      usersModel.getUser(this.getRequest().params.id).then((user) => {
        if(user === null) {
          reject(this.resourceNotFound());
        } else {
          user = this.formatResource(user.dataValues, 'resource:users:get');
          this.getResponse().json(user);
          resolve();
        }
      });
    });
  }

  /**
   *  Update a user
   *
   *  @return {void}
   */
  updateUser() {
    const usersModel = this.getModel('Users.js');
    return new Promise((resolve, reject) => {
      usersModel.updateUser(this.getRequest().params.id, this.getUpdateParams()).then((user) => {
        user = this.formatResource(user.dataValues, 'resource:users:get');
        this.getResponse().json(user);
        resolve();
      }, (err) => {
        if(err.status === 404) {
          reject(this.resourceNotFound());
        } else {
          reject(err);
        }
      });
    });
  }

  /**
   *  Delete a user by id
   *
   *  @return {void}
   */
  deleteUser() {
    const usersModel = this.getModel('Users.js');
    return new Promise((resolve, reject) => {
      usersModel.deleteUser(this.getRequest.params.id).then(() => {
        this.getResponse().status(200).end();
      });
    });
  }
}