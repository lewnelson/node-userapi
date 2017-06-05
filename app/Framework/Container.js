'use strict';

/**
 *  Container class can have registered callbacks on keys, once a registered
 *  item is retrieved the callback is invoked and it's resulting value is
 *  stored on that key
 */
module.exports = class Container {
  /**
   *  Setup item and resolved item lists
   */
  constructor() {
    this.items = {};
    this.resolvedItems = {};
  }

  /**
   *  Register a callback on the container
   *
   *  @param {string} key
   *  @param {function} callback
   *  @return {void}
   */
  register(key, callback) {
    this.items[key] = callback;
  }

  /**
   *  Get a registered item, if key exists as callback then resolve first
   *
   *  @param {string} key
   *  @return {object|null}
   */
  get(key) {
    if(this.resolvedItems[key] === undefined) {
      if(typeof this.items[key] === 'function') {
        this.resolvedItems[key] = this.items[key](this);
      }
    }

    return this.resolvedItems[key] || null;
  }
};