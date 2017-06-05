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
    configService.getConfigPath = () => '/app_config.yaml';
    const originalFsExistsSync = fs.existsSync;
    fs.existsSync = (path) => path === '/app_config.yaml' ? false : originalFsExistsSync;
    const config = configService.getCompiledConfiguration();
    expect(configService.getCompiledConfiguration()).to.equal(config);
    fs.existsSync = originalFsExistsSync;
  });

  it('should assign config as empty object when config file does not exist', () => {
    const configService = new Config();
    configService.getConfigPath = () => '/app_config.yaml';
    const originalFsExistsSync = fs.existsSync;
    fs.existsSync = (path) => path === '/app_config.yaml' ? false : originalFsExistsSync;
    expect(configService.getCompiledConfiguration()).to.deep.equal({});
    fs.existsSync = originalFsExistsSync;
  });

  it('should load the config yaml file when it exists into configuration', () => {
    const configService = new Config();
    configService.getConfigPath = () => '/app_config.yaml';

    const originalFsExistsSync = fs.existsSync;
    fs.existsSync = (path) => path === '/app_config.yaml' ? true : originalFsExistsSync;

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
      nested: {
        configuration: {
          value: true
        }
      }
    };

    expect(configService.getCompiledConfiguration()).to.deep.equal(expectedConfig);
    fs.existsSync = originalFsExistsSync;
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

  it('should return /mnt/data/app_config.yaml when running in docker environment', () => {
    const configService = new Config();
    const environmentService = {
      getEnvVar: (key) => key === 'DOCKER' ? 'true' : undefined
    };

    configService.getService = (key) => key === 'Environment.js' ? environmentService : null;
    expect(configService.getConfigPath()).to.equal('/mnt/data/app_config.yaml');
  });

  it('should return root_dir/app_config.yaml when not running in docker environment', () => {
    const configService = new Config();
    const environmentService = {
      getEnvVar: (key) => undefined,
      getRootDir: () => '/'
    };

    configService.getService = (key) => key === 'Environment.js' ? environmentService : null;
    expect(configService.getConfigPath()).to.equal('/app_config.yaml');
  });
});