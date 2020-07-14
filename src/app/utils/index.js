import IndexPropertyCollection from 'harvester-gui-plugin-generic/utils/index-property-collection';
import { get } from '@ember/object';
import IndexProperty from 'harvester-gui-plugin-generic/utils/index-property';
import IndexOnedataProperty from 'harvester-gui-plugin-generic/utils/index-onedata-property';
import IndexAnyProperty from 'harvester-gui-plugin-generic/utils/index-any-property';
import _ from 'lodash';

export default class Index extends IndexPropertyCollection {
  rawMapping = {};

  constructor(rawMapping) {
    super(...arguments);

    this.rawMapping = rawMapping || {};

    if (this.rawMapping) {
      const propertiesMapping =
        _.cloneDeep(get(this.rawMapping, 'mappings.properties') || {});

      if (propertiesMapping.__onedata &&
        propertiesMapping.__onedata.properties &&
        propertiesMapping.__onedata.properties.spaceId) {
        delete propertiesMapping.__onedata.properties.spaceId;
        if (Object.keys(propertiesMapping.__onedata.properties).length === 0) {
          delete propertiesMapping.__onedata;
        }
      }

      this.extractProperties(propertiesMapping);
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
      flattenedProperties.push(
        property,
        ...this.getFlattenedProperties(Object.values(property.properties))
      );
    });
    return flattenedProperties;
  }

  extractProperties() {
    super.extractProperties(...arguments);

    this.properties['__onedata.space'] =
      new IndexOnedataProperty(null, '__onedata.space');
    this.properties['__anyProperty'] = new IndexAnyProperty();
  }

  getPropertiesTree() {
    const propertiesMapping = get(this.rawMapping, 'mappings.properties') || {};
    const treeRoot = {};
    const parentsQueue = [treeRoot];
    const propertiesObjectsQueue = [propertiesMapping];
    while (propertiesObjectsQueue.length) {
      const parent = parentsQueue.pop();
      const propertiesObject = propertiesObjectsQueue.pop();

      for (const key in propertiesObject) {
        parent[key] = {};
        if (propertiesObject[key].properties) {
          parentsQueue.push(parent[key]);
          propertiesObjectsQueue.push(propertiesObject[key].properties);
        }
      }
    }

    return treeRoot;
  }
}
