/**
 * Represents an Elasticsearch index - is a set of properties, which corresponds to the
 * data inside indexed JSONs. Properties are structures in a tree-like manner - each
 * property may have nested subproperties (like in JSON object).
 * Is built using index schema (mapping) returned by Elasticsearch.
 *
 * @module utils/es-index
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import EsIndexPropertyCollection from 'harvester-gui-plugin-generic/utils/es-index-property-collection';
import EsIndexProperty from 'harvester-gui-plugin-generic/utils/es-index-property';
import EsIndexOnedataProperty from 'harvester-gui-plugin-generic/utils/es-index-onedata-property';
import EsIndexAnyProperty from 'harvester-gui-plugin-generic/utils/es-index-any-property';
import _ from 'lodash';

export default class EsIndex extends EsIndexPropertyCollection {
  /**
   * @type {Object}
   */
  rawMapping = {};

  /**
   * @param {Object} rawMapping raw index mapping taken from Elasticsearch
   */
  constructor(rawMapping) {
    super(...arguments);

    this.rawMapping = rawMapping || {};

    if (rawMapping) {
      const propertiesMapping =
        _.cloneDeep(this.rawMapping?.mappings?.properties || {});

      // Remove special onedata properties, as they will be added later
      if (propertiesMapping?.__onedata?.properties?.spaceId) {
        delete propertiesMapping.__onedata.properties.spaceId;
        if (Object.keys(propertiesMapping.__onedata.properties).length === 0) {
          delete propertiesMapping.__onedata;
        }
      }

      this.extractProperties(propertiesMapping);
    }
  }

  /**
   * @override
   */
  constructProperty(name, rawPropertyMapping) {
    return new EsIndexProperty(null, name, rawPropertyMapping);
  }

  /**
   * Produces flattened array of properties from index properties (tree).
   * @param {Array<Utils.EsIndexProperty>} [properties] array of properties to flatten.
   *   Should be omitted in public API call - is used only for recursion purposes.
   * @returns {Array<Utils.EsIndexProperty>}
   */
  getFlattenedProperties(properties = undefined) {
    let propertiesToFlatten = properties;
    if (propertiesToFlatten === undefined) {
      propertiesToFlatten = Object.values(this.properties);
    }

    if (!_.isArray(propertiesToFlatten) || !propertiesToFlatten.length) {
      return [];
    }

    const flattenedProperties = [];
    // DFS strategy of flattening
    propertiesToFlatten.forEach(property => flattenedProperties.push(
      property,
      ...this.getFlattenedProperties(Object.values(property.properties))
    ));
    return flattenedProperties;
  }

  /**
   * @override
   */
  extractProperties() {
    super.extractProperties(...arguments);

    // Special Onedata properties
    this.properties['__onedata.space'] =
      new EsIndexOnedataProperty(null, '__onedata.space');
    this.properties['__anyProperty'] = new EsIndexAnyProperty();
  }

  /**
   * Produces "properties tree" data structure from the index properties schema.
   * For more information about properties tree see utils/query-results documentation.
   * Only index properties are taken into account, index fields are omitted.
   * @returns {Object}
   */
  getPropertiesTree() {
    const propertiesMapping = this.rawMapping?.mappings?.properties || {};
    const propertiesTree = {};

    const propertiesObjectsQueue = [propertiesMapping];
    const treeTargetQueue = [propertiesTree];
    while (propertiesObjectsQueue.length) {
      const treeTarget = treeTargetQueue.pop();
      const propertiesObject = propertiesObjectsQueue.pop();

      for (const key in propertiesObject) {
        treeTarget[key] = {};
        if (propertiesObject[key].properties) {
          treeTargetQueue.push(treeTarget[key]);
          propertiesObjectsQueue.push(propertiesObject[key].properties);
        }
      }
    }

    return propertiesTree;
  }
}
