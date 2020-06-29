import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';

const allowedPropertyTypes = [
  'text',
  'number',
  'keyword',
  'date',
  'boolean',
  'object',
];

export default class QueryBuilderComponent extends Component {
  intlPrefix = 'components.query-builder';

  @tracked rootQueryBlock = new SingleSlotQueryBlock();

  get indexProperties() {
    return (this.args.index ? this.args.index.getFlattenedProperties() : [])
      .filter(property => this.isSupportedProperty(property))
      .sortBy('path');
  }

  @action
  performQuery() {
    if (!this.args.onPerformQuery) {
      return;
    }

    this.args.onPerformQuery(this.rootQueryBlock);
  }

  isSupportedProperty(property) {
    if (property.type === 'object') {
      return false;
    }

    let propertyInPath = property;
    do {
      if (!allowedPropertyTypes.includes(propertyInPath.type)) {
        return false;
      }
      propertyInPath = propertyInPath.parentProperty;
    } while (propertyInPath);

    return true;
  }
}
