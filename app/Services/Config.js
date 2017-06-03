'use strict';

const Service = require('../Framework/Service.js');
const fs = require('fs');
const yaml = require('js-yaml');
const flatten = require('flat');

module.exports = class Config extends Service {
  /**
   *  Swaps the variable references in the config file, variables are values
   *  wrapped in %%var_id%%
   *
   *  @param {string} configString
   *  @return {string}
   */
  swapConfigVars(configString) {
    return configString.replace(/%%(.*?)(?=%%)%%/, (match, identifier) => {
      switch(identifier) {
        case 'root_dir':
          return this.getService('Environment.js').getRootDir();

        default:
          return match;
      }
    });
  }

  /**
   *  Get config from app_config.yaml and flatten to '.' separated nested keys
   *
   *  @return {object}
   */
  getCompiledConfiguration() {
    if(this.compiledConfiguration === undefined) {
      let configPath = this.getService('Environment.js').getRootDir() + 'app_config.yaml',
          config = {};

      if(fs.statSync(configPath).isFile()) {
        config = yaml.load(this.swapConfigVars(fs.readFileSync(configPath, {encoding: 'utf8'})));
      }

      this.compiledConfiguration = flatten(config);
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
    return this.getCompiledConfiguration()[key] || fallback;
  }
}