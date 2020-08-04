/**
 * Visualizes a single operator block.
 * 
 * @module components/query-builder/operator-block
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class QueryBuilderOperatorBlockComponent extends Component {
  /**
   * @type {String}
   */
  intlPrefix = 'components.query-builder.operator-block';

  /**
   * @type {Utils.QueryBuilder.OperatorQueryBlock}
   */
  get queryBlock() {
    return this.args.queryBlock;
  }

  /**
   * @type {Function}
   * @param {Utils.QueryBuilder.QueryBlock} queryBlock
   */
  get onBlockRemoved() {
    return this.args.onBlockRemoved || (() => {});
  }

  /**
   * @type {boolean}
   */
  get hasSingleOperandOperator() {
    return this.queryBlock && this.queryBlock.constructor.maxOperandsNumber === 1;
  }

  /**
   * @param {Utils.QueryBuilder.QueryBlock} queryBlock 
   */
  @action
  addBlock(queryBlock) {
    this.args.queryBlock.operands.pushObject(queryBlock);
  }

  /**
   * @param {Utils.QueryBuilder.QueryBlock} oldBlock
   * @param {Utils.QueryBuilder.QueryBlock} newBlock
   */
  @action
  replaceBlock(oldBlock, newBlock) {
    const oldBlockIndex = this.queryBlock.operands.indexOf(oldBlock);
    if (oldBlockIndex >= 0) {
      this.queryBlock.operands.replace(oldBlockIndex, 1, [newBlock]);
    }
  }

  /**
   * @param {Utils.QueryBuilder.QueryBlock} queryBlock 
   */
  @action
  removeBlock(queryBlock) {
    this.args.queryBlock.operands.removeObject(queryBlock);
    this.onBlockRemoved(queryBlock);
  }
}
