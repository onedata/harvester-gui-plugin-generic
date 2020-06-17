export default class IndexPropertyCollection {
  properties = {};

  extractProperties(propertiesRawMapping, fieldsRawMapping) {
    this.properties = Object.assign({},
      this.getPropertiesFromRawMapping(propertiesRawMapping, false),
      this.getPropertiesFromRawMapping(fieldsRawMapping, true)
    );
  }

  getPropertiesFromRawMapping(propertiesRawMapping, hasFields = false) {
    const properties = {};
    Object.keys(propertiesRawMapping || {}).forEach(propertyName => {
      properties[propertyName] = this.constructProperty(
        propertyName,
        propertiesRawMapping[propertyName],
        hasFields
      );
    });
    return properties;
  }

  /**
   * @virtual
   * @param {String} name 
   * @param {Object} propertyRawMapping 
   * @param {boolean} isField
   * @returns {Object}
   */
  constructProperty(name, propertyRawMapping, isField) {
    return {
      name,
      rawMapping: propertyRawMapping,
      isField,
    };
  }
}
