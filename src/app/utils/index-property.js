import IndexPropertyCollection from 'harvester-gui-plugin-generic/utils/index-property-collection';

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

export default class IndexProperty extends IndexPropertyCollection {
  parentProperty = undefined;
  name = undefined;
  rawMapping = {};
  isField = false;
  type = 'object';

  get path() {
    const parentPath = (this.parentProperty && this.parentProperty.path) || '';
    return (parentPath ? `${parentPath}.` : '') + this.name;
  }

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

  constructProperty(name, rawPropertyMapping, isField) {
    return new IndexProperty(this, name, rawPropertyMapping, isField);
  }
}
