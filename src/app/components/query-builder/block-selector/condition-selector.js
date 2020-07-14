import Component from '@glimmer/component';
import { action, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';
import moment from 'moment';

const defaultComparators = {
  boolean: ['boolean.is'],
  text: ['text.contains'],
  number: ['number.eq', 'number.lt', 'number.lte', 'number.gt', 'number.gte'],
  keyword: ['keyword.is'],
  date: ['date.eq', 'date.lt', 'date.lte', 'date.gt', 'date.gte'],
  space: ['space.is'],
  anyProperty: ['anyProperty.hasPhrase'],
};

const booleanEditor = {
  type: 'dropdown',
  values: ['true', 'false'],
  defaultValue: () => 'true',
  isValidValue(value) {
    return ['true', 'false'].includes(String(value).trim());
  },
};

const textEditor = {
  type: 'text',
  defaultValue: () => '',
  isValidValue(value) {
    return typeof value === 'string' && value.length > 0;
  },
};

const numberBasicEditor = {
  type: 'text',
  defaultValue: () => '',
  isValidValue(value) {
    return typeof value === 'string' && !isNaN(parseFloat(value));
  },
};

const dateEditor = {
  type: 'date',
  defaultValue: () => ({
    timeEnabled: false,
    datetime: moment().startOf('day').toDate(),
  }),
  isValidValue(value) {
    return typeof value === 'object' && value && value.datetime;
  },
};

const spaceEditor = {
  type: 'space',
  values: [],
  defaultValue: () => spaceEditor.values[0],
  isValidValue(value) {
    // looks like a space
    return value && value.id && value.name;
  },
};

const defaultComparatorEditors = {
  'boolean.is': booleanEditor,
  'text.contains': textEditor,
  'number.eq': numberBasicEditor,
  'number.lt': numberBasicEditor,
  'number.lte': numberBasicEditor,
  'number.gt': numberBasicEditor,
  'number.gte': numberBasicEditor,
  'keyword.is': textEditor,
  'date.eq': dateEditor,
  'date.lt': dateEditor,
  'date.lte': dateEditor,
  'date.gt': dateEditor,
  'date.gte': dateEditor,
  'space.is': spaceEditor,
  'anyProperty.hasPhrase': textEditor,
};

export default class QueryBuilderBlockSelectorConditionSelectorComponent
extends Component {
  @service spacesProvider;

  intlPrefix = 'components.query-builder.block-selector.condition-selector';
  @tracked selectedConditionProperty;
  @tracked selectedConditionComparator;
  @tracked conditionComparatorValue;
  @tracked comparatorsSet = defaultComparators;
  @tracked comparatorEditorsSet = defaultComparatorEditors;

  get indexProperties() {
    return this.args.indexProperties || [];
  }

  get onConditionSelected() {
    return this.args.onConditionSelected || (() => {});
  }

  get guid() {
    return guidFor(this);
  }

  get comparators() {
    const propertyType = get(this, 'selectedConditionProperty.type');
    return this.comparatorsSet[propertyType] || [];
  }

  get comparatorEditor() {
    return this.comparatorEditorsSet[this.selectedConditionComparator];
  }

  get isConditionComparatorValueValid() {
    return this.comparatorEditor ?
      this.comparatorEditor.isValidValue(this.conditionComparatorValue) : false;
  }

  get isConditionDataValid() {
    return this.selectedConditionProperty &&
      this.selectedConditionComparator &&
      this.isConditionComparatorValueValid;
  }

  constructor() {
    super(...arguments);

    // setup list of spaces for space.is editor
    const spaceEditor = this.comparatorEditorsSet['space.is'];
    if (spaceEditor && spaceEditor.type === 'space') {
      // `set` because this.comparatorEditorsSet is tracked
      set(spaceEditor, 'values', this.spacesProvider.spaces);
    }
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

    if (!this.isConditionComparatorValueValid) {
      this.conditionComparatorValueChanged(this.comparatorEditor.defaultValue());
    }
  }

  @action
  conditionComparatorValueChanged(value) {
    let newComparatorValue = value;

    if (this.comparatorEditor.type === 'date') {
      // time-enabled checkbox change
      if (newComparatorValue instanceof Event) {
        newComparatorValue = Object.assign({},
          this.conditionComparatorValue, { timeEnabled: value.target.checked }
        );
      } else if (newComparatorValue[0] && newComparatorValue[0] instanceof Date) {
        newComparatorValue = Object.assign({},
          this.conditionComparatorValue, { datetime: newComparatorValue[0] }
        );
      }
    } else if (newComparatorValue instanceof Event) {
      newComparatorValue = value.target.value;
    }

    this.conditionComparatorValue = newComparatorValue;
  }

  @action
  conditionSelected() {
    this.args.onConditionSelected(
      this.selectedConditionProperty,
      this.selectedConditionComparator,
      this.conditionComparatorValue
    );
  }
}
