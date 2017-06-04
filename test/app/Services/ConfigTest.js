'use strict';

const Config = require('../../../app/Services/Config.js');
const expect = require('chai').expect;
const fs = require('fs');
const yaml = require('js-yaml');

describe('Config service class tests', () => {
  it('should swap variable references for root_dir in config string to resolve for environment service getRootDir on swapConfigVars', () => {
    let rootDir = '/root/directory',
        environmentService = { getRootDir: () => rootDir },
        dataSets = [
          {
            configString: 'some configuration %%root_dir%% injected here',
            expectedConfig: 'some configuration ' + rootDir + ' injected here'
          },
          {
            configString: 'some configuration\n %%unassigned%% \ninjected %%root_dir%% %%root_dir%% here',
            expectedConfig: 'some configuration\n %%unassigned%% \ninjected ' + rootDir + ' ' + rootDir + ' here'
          }
        ];

    const configService = new Config();
    configService.getService = (key) => key === 'Environment.js' ? environmentService : null;
    dataSets.forEach((dataSet) => {
      expect(configService.swapConfigVars(dataSet.configString)).to.equal(dataSet.expectedConfig);
    });
  });

  it('should load config only once and store on property for getCompiledConfiguration', () => {
    const configService = new Config();
    const environmentService = { getRootDir: () => '/' };
    configService.getService = (key) => key === 'Environment.js' ? environmentService : null;
    const originalFsStatSync = fs.statSync;
    fs.statSync = (path) => path === '/app_config.yaml' ? { isFile: () => false } : originalFsStatSync;
    const config = configService.getCompiledConfiguration();
    expect(configService.getCompiledConfiguration()).to.equal(config);
    fs.statSync = originalFsStatSync;
  });

  it('should assign config as empty object when config file does not exist', () => {
    const configService = new Config();
    const environmentService = { getRootDir: () => '/' };
    configService.getService = (key) => key === 'Environment.js' ? environmentService : null;
    const originalFsStatSync = fs.statSync;
    fs.statSync = (path) => path === '/app_config.yaml' ? { isFile: () => false } : originalFsStatSync;
    expect(configService.getCompiledConfiguration()).to.deep.equal({});
    fs.statSync = originalFsStatSync;
  });

  it('should load the config yaml file when it exists into configuration', () => {
    const configService = new Config();
    const environmentService = { getRootDir: () => '/' };
    configService.getService = (key) => key === 'Environment.js' ? environmentService : null;

    const originalFsStatSync = fs.statSync;
    fs.statSync = (path) => path === '/app_config.yaml' ? { isFile: () => true } : originalFsStatSync.apply(fs, arguments);

    const configContents = 'test';
    const originalFsReadFileSync = fs.readFileSync;
    fs.readFileSync = (path) => path === '/app_config.yaml' ? configContents : originalFsReadFileSync.apply(fs, arguments);

    const originalYamlLoad = yaml.load;
    const yamlParsedConfig = {
      key: 'value',
      nested: {
        configuration: {
          value: true
        }
      }
    };

    yaml.load = (str) => str === configContents ? yamlParsedConfig : originalYamlLoad.apply(yaml, arguments);

    const expectedConfig = {
      key: 'value',
      'nested.configuration.value': true
    };

    expect(configService.getCompiledConfiguration()).to.deep.equal(expectedConfig);
    fs.statSync = originalFsStatSync;
    fs.readFileSync = originalFsReadFileSync;
    yaml.load = originalYamlLoad;
  });

  it('should return the fallback value on getConfig when the config value is undefined', () => {
    const configService = new Config();
    configService.getCompiledConfiguration = () => {
      return {};
    };

    expect(configService.getConfig('key', null)).to.be.null;
  });

  it('should return the config value on getConfig when the value is set on the configuration', () => {
    const configService = new Config();
    configService.getCompiledConfiguration = () => {
      return {
        key: true
      };
    };

    expect(configService.getConfig('key', null)).to.be.true;
  });
});