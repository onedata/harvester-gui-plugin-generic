import Component from '@glimmer/component';
import { action, get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';

const defaultComparators = {
  boolean: ['boolean.is'],
};

const booleanComparatorEditor = {
  type: 'dropdown',
  values: ['true', 'false'],
  defaultValue: 'true',
  isValidValue(value) {
    return ['true', 'false'].includes(String(value).trim());
  },
};

const defaultComparatorEditors = {
  'boolean.is': booleanComparatorEditor,
};

export default class QueryBuilderBlockSelectorComponent extends Component {
  intlPrefix = 'components.query-builder.block-selector';
  @tracked selectedConditionProperty;
  @tracked selectedConditionComparator;
  @tracked conditionComparatorValue;

  @tracked comparatorsSet = defaultComparators;
  @tracked comparatorEditorsSet = defaultComparatorEditors;

  get comparators() {
    const propertyType = get(this, 'selectedConditionProperty.type');
    return this.comparatorsSet[propertyType] || [];
  }

  get comparatorEditor() {
    return this.comparatorEditorsSet[this.selectedConditionComparator];
  }

  @action
  onOperatorAdd(operatorName) {
    if (!this.args.onOperatorAdd) {
      return;
    }

    let newBlock;
    switch (operatorName) {
      case 'not':
        newBlock = new SingleSlotQueryBlock(operatorName);
        break;
      case 'and':
      case 'or':
        newBlock = new MultiSlotQueryBlock(operatorName);
        break;
      default:
        return;
    }

    this.args.onOperatorAdd(newBlock);
  }

  @action
  conditionPropertyChanged(indexProperty) {
    this.selectedConditionProperty = indexProperty;

    if (!this.comparators.includes(this.selectedConditionComparator)) {
      this.conditionComparatorChanged(this.comparators[0]);
    }
  }

  @action
  conditionComparatorChanged(comparator) {
    this.selectedConditionComparator = comparator;

    if (!this.comparatorEditor.isValidValue(this.conditionComparatorValue)) {
      this.conditionComparatorValueChanged(this.comparatorEditor.defaultValue);
    }
  }

  @action
  conditionComparatorValueChanged(value) {
    this.conditionComparatorValue = value;
  }
}
