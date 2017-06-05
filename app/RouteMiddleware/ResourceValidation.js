'use strict';

module.exports = class ResourceValidation {
  /**
   *  Check that value matches specified type
   *
   *  @param {mixed} value
   *  @param {string} type
   *  @return {boolean}
   */
  checkType(value, type) {
    switch(type) {
      case 'array':
        return Array.isArray(value);

      case 'object':
        return !Array.isArray(value) && typeof value === 'object';

      default:
        return typeof value === type;
    }
  }

  /**
   *  Validates fields from a given request
   *
   *  @param {Request} req
   *  @param {array} fields
   *  @return {object} Errors key -> array of messages
   */
  validateFields(req, fields) {
    let errors = {};
    fields.map((field) => {
      let fieldErrors = [],
          value = req.body[field.key],
          attributes = field.attributes || [];

      if(attributes.indexOf('required') > -1 && value === undefined) {
        fieldErrors.push('missing required value');
      } else if(value !== undefined && !this.checkType(value, field.type)) {
        fieldErrors.push('invalid type, expecting ' + field.type);
      } else if(value !== undefined) {
        let validateObjects = field.validate || [];
        validateObjects.forEach((validation) => {
          if(!validation.callback(value)) {
            fieldErrors.push(validation.error);
          }
        });
      }

      if(fieldErrors.length < 1 && value !== undefined) {
        let sanitizeObjects = field.sanitize || [];
        sanitizeObjects.forEach((obj) => {
          value = obj.callback(value);
        });

        req.body[field.key] = value;
      } else if(fieldErrors.length >= 1) {
        errors[field.key] = fieldErrors;
      }
    });

    return errors;
  }

  /**
   *  Validates request for POST, PUT and PATCH requests
   *
   *  @param {Request} req
   *  @param {Route} route
   *  @throws {Error} If validation isn't passed
   *  @return {void}
   */
  validateRequest(req, route) {
    let errors = {},
        fields;

    if(route.resourceSchema.length === 0) {
      return;
    }

    switch(route.httpMethod.toUpperCase()) {
      case 'POST':
      case 'PUT':
        fields = route.resourceSchema.filter((field) => {
          let attributes = field.attributes || [];
          return attributes.indexOf('readonly') === -1;
        });

        errors = this.validateFields(req, fields);
        break;

      case 'PATCH':
        fields = route.resourceSchema.filter((field) => {
          let attributes = field.attributes || [];
          return attributes.indexOf('readonly') === -1;
        }).slice().map((field) => {
          let attributes = field.attributes || [],
              requiredIndex = attributes.indexOf('required');

          if(requiredIndex > -1) {
            attributes.splice(requiredIndex, 1);
          }

          field.attributes = attributes;
          return field;
        });

        errors = this.validateFields(req, fields);
        break;
    }

    if(Object.keys(errors).length > 0) {
      let err = new Error('Bad request data');
      err.status = 400;
      err.context = errors;
      throw err;
    }
  }
};