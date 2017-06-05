'use strict';

const Service = require('../Framework/Service.js');
const fs = require('fs');
const yaml = require('js-yaml');
const clone = require('clone');

module.exports = class Config extends Service {
  /**
   *  Swaps the variable references in the config file, variables are values
   *  wrapped in %%var_id%%
   *
   *  @param {string} configString
   *  @return {string}
   */
  swapConfigVars(configString) {
    return configString.replace(/%%(.*?)(?=%%)%%/g, (match, identifier) => {
      switch(identifier) {
        case 'root_dir':
          return this.getService('Environment.js').getRootDir();

        default:
          return match;
      }
    });
  }

  /**
   *  Get the path to the app_config.yaml file based on environment
   *
   *  @return {string}
   */
  getConfigPath() {
    if(this.getService('Environment.js').getEnvVar('DOCKER') === 'true') {
      return '/mnt/data/app_config.yaml';
    } else {
      return this.getService('Environment.js').getRootDir() + 'app_config.yaml';
    }
  }

  /**
   *  Get config from app_config.yaml and flatten to '.' separated nested keys
   *
   *  @return {object}
   */
  getCompiledConfiguration() {
    if(this.compiledConfiguration === undefined) {
      let configPath = this.getConfigPath(),
          config = {};

      if(fs.existsSync(configPath)) {
        config = yaml.load(this.swapConfigVars(fs.readFileSync(configPath, {encoding: 'utf8'})));
      }

      this.compiledConfiguration = config;
    }

    return this.compiledConfiguration;
  }

  /**
   *  Get configuration value from the compiled config
   *
   *  @param {string} key
   *  @param {mixed} fallback If the value cannot be found this will be returned
   *  @return {mixed}
   */
  getConfig(key, fallback) {
    let parts = key.split('.'),
        config = clone(this.getCompiledConfiguration());

    while(parts.length > 0 && config !== undefined) {
      let next = parts.shift();
      config = config[next];
    }

    return config === undefined ? fallback : config;
  }
};