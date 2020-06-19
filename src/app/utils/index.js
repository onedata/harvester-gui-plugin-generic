import IndexPropertyCollection from 'harvester-gui-plugin-generic/utils/index-property-collection';
import { get } from '@ember/object';
import IndexProperty from 'harvester-gui-plugin-generic/utils/index-property';
import _ from 'lodash';

export default class Index extends IndexPropertyCollection {
  rawMapping = {};

  constructor(rawMapping) {
    super(...arguments);

    this.rawMapping = rawMapping || {};

    if (this.rawMapping) {
      this.extractProperties(get(this.rawMapping, 'mappings.properties') || {});
    }
  }

  constructProperty(name, rawPropertyMapping) {
    return new IndexProperty(null, name, rawPropertyMapping);
  }

  getFlattenedProperties(properties = undefined) {
    let propertiesToFlatten = properties;
    if (propertiesToFlatten === undefined) {
      propertiesToFlatten = Object.values(this.properties);
    }

    if (!_.isArray(propertiesToFlatten) || !propertiesToFlatten.length) {
      return [];
    }

    const flattenedProperties = [];
    propertiesToFlatten.forEach(property => {
      let propertyAncestor = property.parentProperty;
      let propertyPath = property.name;
      while (propertyAncestor) {
        propertyPath = `${propertyAncestor.name}.${propertyPath}`;
        propertyAncestor = propertyAncestor.parentProperty;
      }
      flattenedProperties.push({ propertyPath, property },
        ...this.getFlattenedProperties(Object.values(property.properties))
      );
    });
    return flattenedProperties;
  }
}
