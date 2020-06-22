import Component from '@glimmer/component';
import { action, get } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';

const defaultComparators = {
  boolean: ['boolean.is'],
  text: ['text.contains'],
  number: ['number.eq', 'number.lt', 'number.lte', 'number.gt', 'number.gte'],
  keyword: ['keyword.is'],
};

const booleanEditor = {
  type: 'dropdown',
  values: ['true', 'false'],
  defaultValue: 'true',
  isValidValue(value) {
    return ['true', 'false'].includes(String(value).trim());
  },
};

const textContainsEditor = {
  type: 'text',
  defaultValue: '',
  isValidValue(value) {
    return typeof value === 'string';
  },
};

const numberBasicEditor = {
  type: 'text',
  defaultValue: '',
  isValidValue(value) {
    return typeof value === 'string' && !isNaN(parseFloat(value));
  },
};

const keywordIsEditor = {
  type: 'text',
  defaultValue: '',
  isValidValue(value) {
    return typeof value === 'string';
  },
};

const defaultComparatorEditors = {
  'boolean.is': booleanEditor,
  'text.contains': textContainsEditor,
  'number.eq': numberBasicEditor,
  'number.lt': numberBasicEditor,
  'number.lte': numberBasicEditor,
  'number.gt': numberBasicEditor,
  'number.gte': numberBasicEditor,
  'keyword.is': keywordIsEditor,
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
    let newComparatorValue = value;
    if (newComparatorValue instanceof Event) {
      newComparatorValue = value.target.value;
    }

    this.conditionComparatorValue = newComparatorValue;
  }

  @action
  onConditionAdd() {
    if (!this.args.onConditionAdd) {
      return;
    }

    const condition = new ConditionQueryBlock(
      this.selectedConditionProperty,
      this.selectedConditionComparator,
      this.conditionComparatorValue
    );
    this.args.onConditionAdd(condition);
  }
}
