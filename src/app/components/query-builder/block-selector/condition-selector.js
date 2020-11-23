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
import { tracked } from '@glimmer/tracking';

/**
 * @argument {Utils.QueryValueComponentsBuilder} [valuesBuilder]
 * @argument {Array<IndexProperty>} indexProperties
 * @argument {Function} onConditionSelected
 * @argument {Array<String>} [operators]
 * @argument {Array<String>} [disabledOperators]
 */
export default class QueryBuilderBlockSelectorConditionSelectorComponent
extends Component {

  /**
   * @type {String}
   */
  intlPrefix = 'components.query-builder.block-selector.condition-selector';

  /**
   * @type {Utils.EsIndexProperty}
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
   * @type {Utils.QueryValueComponentsBuilder}
   */
  get valuesBuilder() {
    return this.args.valuesBuilder || [];
  }

  /**
   * @type {Array<IndexProperty>}
   */
  get indexProperties() {
    return this.args.indexProperties || [];
  }

  /**
   * @type {Function}
   * @param {Utils.EsIndexProperty} property
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
    return this.valuesBuilder.getComparatorsFor(this.selectedConditionProperty?.type);
  }

  /**
   * @type {Function}
   */
  get comparatorValidator() {
    return this.valuesBuilder.getValidatorFor(this.selectedConditionComparator);
  }

  /**
   * @type {Function}
   */
  get comparatorDefaultValue() {
    return this.valuesBuilder.getDefaultValueFor(this.selectedConditionComparator);
  }

  /**
   * @type {boolean}
   */
  get isConditionComparatorValueValid() {
    return this.comparatorValidator(this.conditionComparatorValue);
  }

  /**
   * @type {boolean}
   */
  get isConditionDataValid() {
    return this.selectedConditionProperty &&
      this.selectedConditionComparator &&
      this.isConditionComparatorValueValid;
  }

  /**
   *
   * @param {Utils.EsIndexProperty} indexProperty
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
      this.conditionComparatorValueChanged(this.comparatorDefaultValue);
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
