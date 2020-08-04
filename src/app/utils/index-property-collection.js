/**
 * A base class for index properties structure. Represents a collection of index
 * properties.
 * 
 * @module utils/index-property-collection
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

export default class IndexPropertyCollection {
  /**
   * Property name -> Utils/IndexProperty
   * @type {Object}
   */
  properties = {};

  /**
   * Extracts properties from raw representation and persists them in `properties`
   * @param {Object} propertiesRawMapping 
   * @param {Object} fieldsRawMapping 
   */
  extractProperties(propertiesRawMapping, fieldsRawMapping) {
    this.properties = Object.assign(
      this.getPropertiesFromRawMapping(propertiesRawMapping, false),
      this.getPropertiesFromRawMapping(fieldsRawMapping, true)
    );
  }

  /**
   * Extracts properties from raw representation
   * @param {Object} propertiesRawMapping 
   * @param {boolean} [hasFields=false] if true, then passed propertiesRawMapping contains
   *   fields (metaproperties, which does not exist in real JSONs)
   * @returns {Object}
   */
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
   * Constructs property instance. It should return Utils/IndexProperty, but it cannot
   * be implemented here directly - IndexProperty extends IndexPropertyCollection
   * and importing IndexProperty here would create an import loop.
   * @virtual
   * @param {String} name 
   * @param {Object} propertyRawMapping 
   * @param {boolean} isField
   * @returns {Object} Utils/IndexProperty-like object
   */
  constructProperty(name, propertyRawMapping, isField) {
    return {
      parentProperty: this,
      name,
      rawMapping: propertyRawMapping,
      isField,
    };
  }
}
