import Component from '@glimmer/component';
import { action, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  defaultComparators,
  defaultComparatorEditors,
} from 'harvester-gui-plugin-generic/utils/query-builder/condition-comparator-editors';

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
    this.conditionComparatorValue = value;
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
