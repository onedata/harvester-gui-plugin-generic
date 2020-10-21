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
  @tracked comparatorEditorsSet = defaultComparatorEditors;

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
    const propertyType = get(this, 'selectedConditionProperty.type');
    return this.comparatorsSet[propertyType] || [];
  }

  /**
   * @type {Object}
   */
  get comparatorEditor() {
    return this.comparatorEditorsSet[this.selectedConditionComparator];
  }

  /**
   * @type {boolean}
   */
  get isConditionComparatorValueValid() {
    return this.comparatorEditor ?
      this.comparatorEditor.isValidValue(this.conditionComparatorValue) : false;
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
      this.conditionComparatorValueChanged(this.comparatorEditor.defaultValue());
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
