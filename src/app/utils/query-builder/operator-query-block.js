/**
 * An operator query block base class. Aggregates operands, which may be conditions or
 * another operators.
 *
 * @module utils/query-builder/operator-query-block
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import QueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/query-block';
import { tracked } from '@glimmer/tracking';
import { A } from '@ember/array';

export default class OperatorQueryBlock extends QueryBlock {
  /**
   * @override
   */
  static renderer = 'operator-block';

  /**
   * @type {number}
   */
  static maxOperandsNumber = Number.MAX_SAFE_INTEGER;

  /**
   * @type {String}
   */
  @tracked operator = null;

  /**
   * @type {Array<Utils.QueryBuilder.QueryBlock>}
   */
  @tracked operands = A();

  /**
   * @override
   */
  get level() {
    if (!this.operands.length) {
      return 1;
    } else {
      return Math.max(...this.operands.mapBy('level')) + 1;
    }
  }

  /**
   * @param {String} operator
   */
  constructor(operator = null) {
    super(...arguments);

    this.operator = operator;
  }

  /**
   * @override
   */
  clone() {
    const clonedBlock = new this.constructor();
    clonedBlock.operator = this.operator;
    clonedBlock.operands = this.cloneOperands();

    return clonedBlock;
  }

  /**
   * @returns {Ember.Array<Utils.QueryBuilder.QueryBlock>}
   */
  cloneOperands() {
    return A(this.operands.map(operand =>
      operand && typeof operand.clone === 'function' ? operand.clone() : operand
    ));
  }
}
