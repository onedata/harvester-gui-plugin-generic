import IndexPropertyCollection from 'harvester-gui-plugin-generic/utils/index-property-collection';
import { get } from '@ember/object';
import IndexProperty from 'harvester-gui-plugin-generic/utils/index-property';

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
}
