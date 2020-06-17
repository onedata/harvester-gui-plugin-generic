import IndexPropertyCollection from 'harvester-gui-plugin-generic/utils/index-property-collection';

export default class IndexProperty extends IndexPropertyCollection {
  parentProperty = undefined;
  name = undefined;
  rawMapping = {};
  isField = false;
  type = 'object';

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
    this.type = this.rawMapping.type || 'object';
  }

  constructProperty(name, rawPropertyMapping, isField) {
    return new IndexProperty(this, name, rawPropertyMapping, isField);
  }
}
