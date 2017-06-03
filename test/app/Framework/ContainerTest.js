'use strict';

const Container = require('../../../app/Framework/Container.js');
const expect = require('chai').expect;

describe('Framework container class tests', () => {
  it('should return null when an item does not exist and is not registered', () => {
    const container = new Container();
    expect(container.get('test')).to.equal(null);
  });

  it('should resolve the registered item when it is retrieved for the first time', () => {
    const container = new Container();
    let itemKey = 'test',
        callback = () => true;

    container.register(itemKey, callback);
    expect(container.get('test')).to.equal(true);
  });

  it('should only resolve a registered item once', () => {
    const container = new Container();
    let itemKey = 'test',
        callCount = 0,
        callback = () => callCount++;

    container.register(itemKey, callback);
    container.get('test');
    container.get('test');
    expect(callCount).to.equal(1);
  });

  it('should overwrite any existing item when a key is registered to twice', () => {
    const container = new Container();
    container.register('test', () => false);
    container.register('test', () => true);
    expect(container.get('test')).to.equal(true);
  });
});