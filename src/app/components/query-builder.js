import Component from '@glimmer/component';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';
import OperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/operator-query-block';

const allowedPropertyTypes = [
  'text',
  'number',
  'keyword',
  'date',
  'boolean',
  'object',
  'space',
  'anyProperty',
];

export default class QueryBuilderComponent extends Component {
  intlPrefix = 'components.query-builder';

  @tracked rootQueryBlock = new RootOperatorQueryBlock();
  @tracked editedConditions = new Map();

  get indexProperties() {
    const allProperties =
      (this.args.index ? this.args.index.getFlattenedProperties() : [])
      .filter(property => this.isSupportedProperty(property))
      .sortBy('path');
    const specialProperties = allProperties.rejectBy('isRealProperty');
    const ordinaryProperties = allProperties
      .filter(prop => prop.isRealProperty && !prop.path.startsWith('_'));
    const internalProperties = allProperties
      .filter(prop => prop.isRealProperty && prop.path.startsWith('_'));
    return [...specialProperties, ...ordinaryProperties, ...internalProperties];
  }

  get hasInvalidCondition() {
    return [...this.editedConditions.values()].mapBy('isValid').some(isValid => !isValid);
  }

  @action
  performQuery() {
    if (!this.args.onPerformQuery) {
      return;
    }

    this.args.onPerformQuery(this.rootQueryBlock);
  }

  @action
  onConditionEditionStart(conditionBlock) {
    this.editedConditions.set(conditionBlock, { isValid: true });
    // trigger change
    this.editedConditions = this.editedConditions;
  }

  @action
  onConditionEditionEnd(conditionBlock) {
    this.editedConditions.delete(conditionBlock);
    // trigger change
    this.editedConditions = this.editedConditions;
  }

  @action
  onConditionEditionValidityChange(conditionBlock, isValid) {
    const editedConditionEntry = this.editedConditions.get(conditionBlock);
    if (editedConditionEntry) {
      set(editedConditionEntry, 'isValid', isValid);
      // trigger change
      this.editedConditions = this.editedConditions;
    }
  }

  @action
  onBlockRemoved(block) {
    const flattenedConditionsList = [];
    const blocksToFlatten = [block];
    while (blocksToFlatten.length) {
      const blockToFlatten = blocksToFlatten.pop();
      if (blockToFlatten instanceof OperatorQueryBlock) {
        blocksToFlatten.push(...blockToFlatten.operands);
      } else {
        flattenedConditionsList.push(blockToFlatten);
      }
    }

    for (const condition of flattenedConditionsList) {
      this.editedConditions.delete(condition);
    }

    // trigger change
    this.editedConditions = this.editedConditions;
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
