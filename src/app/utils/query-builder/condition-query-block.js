/**
 * A condition query block. Contains information about query conditions.
 *
 * @module utils/query-builder/condition-query-block
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import QueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/query-block';
import { tracked } from '@glimmer/tracking';

export default class ConditionQueryBlock extends QueryBlock {
  /**
   * @override
   */
  static renderer = 'condition-block';

  /**
   * @type {Utils.EsIndexProperty}
   */
  @tracked property = null;

  /**
   * @type {String}
   */
  @tracked comparator = null;

  /**
   * @type {any}
   */
  @tracked comparatorValue = null;

  /**
   * @param {Utils.EsIndexProperty} property
   * @param {String} comparator
   * @param {any} comparatorValue
   */
  constructor(property = null, comparator = null, comparatorValue = null) {
    super(...arguments);

    this.property = property;
    this.comparator = comparator;
    this.comparatorValue = comparatorValue;
  }

  /**
   * @override
   */
  clone() {
    const clonedBlock = new ConditionQueryBlock(
      this.property,
      this.comparator,
      this.comparatorValue
    );

    return clonedBlock;
  }
}
