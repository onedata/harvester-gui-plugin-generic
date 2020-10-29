/**
 * Provides controls to select condition parameters - property, comparator and
 * comparator value.
 *
 * @module components/query-builder/block-selector/condition-selector
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import {
  defaultComparators,
  defaultComparatorValidators,
  defaultComparatorValues,
} from 'harvester-gui-plugin-generic/utils/query-builder/condition-comparator-editors';

/**
 * @argument {Array<IndexProperty>} indexProperties
 * @argument {Function} onConditionSelected
 * @argument {Array<String>} [operators]
 * @argument {Array<String>} [disabledOperators]
 */
export default class QueryBuilderBlockSelectorConditionSelectorComponent
extends Component {
  @service spacesProvider;

  /**
   * @type {String}
   */
  intlPrefix = 'components.query-builder.block-selector.condition-selector';

  /**
   * @type {Utils.IndexProperty}
   */
  @tracked selectedConditionProperty;

  /**
   * @type {String}
   */
  @tracked selectedConditionComparator;

  /**
   * @type {any}
   */
  @tracked conditionComparatorValue;

  /**
   * @type {Object}
   */
  @tracked comparatorsSet = defaultComparators;

  /**
   * @type {Object}
   */
  @tracked comparatorValidatorsSet = defaultComparatorValidators;

  /**
   * @type {Object}
   */
  @tracked comparatorDefaultValuesSet = defaultComparatorValues;

  /**
   * @type {Array<IndexProperty>}
   */
  get indexProperties() {
    return this.args.indexProperties || [];
  }

  /**
   * @type {Function}
   * @param {Utils.IndexProperty} property
   * @param {String} comparator
   * @param {any} comparatorValue
   */
  get onConditionSelected() {
    return this.args.onConditionSelected || (() => {});
  }

  /**
   * @type {Array<String>}
   */
  get comparators() {
    if (this.selectedConditionProperty) {
      const propertyType = this.selectedConditionProperty.type;
      if (this.comparatorsSet[propertyType]) {
        return this.comparatorsSet[propertyType];
      }
    }
    return [];
  }

  /**
   * @type {Function}
   */
  get comparatorValidator() {
    return this.comparatorValidatorsSet[this.selectedConditionComparator];
  }

  /**
   * @type {Function}
   */
  get comparatorDefaultValue() {
    return this.comparatorDefaultValuesSet[this.selectedConditionComparator];
  }

  /**
   * @type {boolean}
   */
  get isConditionComparatorValueValid() {
    return this.comparatorValidator ?
      this.comparatorValidator(this.conditionComparatorValue) : false;
  }

  /**
   * @type {boolean}
   */
  get isConditionDataValid() {
    return this.selectedConditionProperty &&
      this.selectedConditionComparator &&
      this.isConditionComparatorValueValid;
  }

  constructor() {
    super(...arguments);

    defaultComparatorValues['space.is'] = () => this.spacesProvider.spaces[0];
  }

  /**
   *
   * @param {Utils.IndexProperty} indexProperty
   */
  @action
  conditionPropertyChanged(indexProperty) {
    this.selectedConditionProperty = indexProperty;

    if (
      !this.selectedConditionComparator ||
      !this.comparators.includes(this.selectedConditionComparator)
    ) {
      this.conditionComparatorChanged(this.comparators[0]);
    }
  }

  /**
   * @param {String} comparator
   */
  @action
  conditionComparatorChanged(comparator) {
    this.selectedConditionComparator = comparator;

    if (!this.isConditionComparatorValueValid) {
      this.conditionComparatorValueChanged(this.comparatorDefaultValue());
    }
  }

  /**
   * @param {any} value
   */
  @action
  conditionComparatorValueChanged(value) {
    this.conditionComparatorValue = value;
  }

  @action
  conditionSelected() {
    this.onConditionSelected(
      this.selectedConditionProperty,
      this.selectedConditionComparator,
      this.conditionComparatorValue
    );
  }
}
