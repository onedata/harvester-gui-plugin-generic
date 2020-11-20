/**
 * Represents an index property or field. Is used to represent a hierarchy of index
 * properties using `parentProperty` and `properties` fields.
 *
 * @module utils/es-index-property
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EsIndexPropertyCollection from 'harvester-gui-plugin-generic/utils/es-index-property-collection';

const numberTypes = [
  'long',
  'integer',
  'short',
  'byte',
  'double',
  'float',
  'half_float',
  'scaled_float',
];

export default class EsIndexProperty extends EsIndexPropertyCollection {
  /**
   * May be null if there is no parent property
   * @type {Utils.EsIndexProperty}
   */
  parentProperty = undefined;

  /**
   * @type {String}
   */
  name = undefined;

  /**
   * @type {Object}
   */
  rawMapping = {};

  /**
   * @type {boolean}
   */
  isField = false;

  /**
   * @type {String}
   */
  type = 'object';

  /**
   * Should be false, if represents a metaproperty not mentioned in index schema directly.
   * @type {boolean}
   */
  isRealProperty = true;

  /**
   * @type {String}
   */
  get path() {
    const parentPath = this.parentProperty?.path || '';
    return (parentPath ? `${parentPath}.` : '') + this.name;
  }

  /**
   * @param {Utils.EsIndexProperty} parentProperty
   * @param {String} name
   * @param {Object} rawMapping
   * @param {boolean} [isField=false]
   */
  constructor(parentProperty, name, rawMapping, isField = false) {
    super(...arguments);

    this.parentProperty = parentProperty;
    this.name = name;
    this.rawMapping = rawMapping || {};
    this.isField = Boolean(isField);

    if (rawMapping) {
      this.extractType();
      this.extractProperties(this.rawMapping.properties, this.rawMapping.fields);
    }
  }

  extractType() {
    const type = this.rawMapping.type || 'object';
    this.type = numberTypes.includes(type) ? 'number' : type;
  }

  /**
   * @override
   */
  constructProperty(name, rawPropertyMapping, isField) {
    return new EsIndexProperty(this, name, rawPropertyMapping, isField);
  }
}
