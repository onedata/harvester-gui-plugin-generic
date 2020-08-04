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
   * @param {String} operator 
   */
  constructor(operator = null) {
    super(...arguments);

    this.operator = operator;
  }

  /**
   * Creates new instances of the class. It's a template method used by cloning mechanism.
   * @returns {Utils.QueryBuilder.OperatorQueryBlock}
   */
  static newInstance() {
    return new OperatorQueryBlock();
  }

  /**
   * @override
   */
  clone() {
    const clonedBlock = this.constructor.newInstance();
    clonedBlock.operator = this.operator;
    clonedBlock.operands.pushObjects(this.cloneOperands());

    return clonedBlock;
  }

  /**
   * @returns {Array<Utils.QueryBuilder.QueryBlock>}
   */
  cloneOperands() {
    return this.operands.map(operand =>
      operand && typeof operand.clone === 'function' ? operand.clone() : operand
    );
  }
}
