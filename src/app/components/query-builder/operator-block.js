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
import OperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/operator-query-block';
import RootOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/root-operator-query-block';

/**
 * @argument {Utils.QueryBuilder.OperatorQueryBlock} queryBlock
 * @argument {Utils.QueryValueComponentsBuilder} valuesBuilder
 * @argument {Array<IndexProperty>} indexProperties
 * @argument {Number} level
 * @argument {Function} onConditionEditionStart
 * @argument {Function} onConditionEditionEnd
 * @argument {Function} onConditionEditionValidityChange
 * @argument {Function} onBlockRemoved
 */
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
   * @type {Number}
   */
  get nestedBlocksLevel() {
    return typeof this.args.level === 'number' ?
      this.args.level - 1 : this.queryBlock.level - 1;
  }

  /**
   * @param {Utils.QueryBuilder.QueryBlock} queryBlock
   */
  @action
  addBlock(queryBlock) {
    if (
      this.queryBlock instanceof RootOperatorQueryBlock &&
      this.queryBlock.operands.length
    ) {
      // When root block has an operand, then next operator additions should surround
      // existing operand. Adding next conditions to the root block is not allowed.
      if (queryBlock instanceof OperatorQueryBlock) {
        queryBlock.operands = [this.queryBlock.operands[0]];
        this.replaceBlock(this.queryBlock.operands[0], [queryBlock]);
      }
    } else {
      this.queryBlock.operands.pushObject(queryBlock);
    }
  }

  /**
   * @param {Utils.QueryBuilder.QueryBlock} oldBlock
   * @param {Array<Utils.QueryBuilder.QueryBlock>} newBlocks
   */
  @action
  replaceBlock(oldBlock, newBlocks) {
    const oldBlockIndex = this.queryBlock.operands.indexOf(oldBlock);
    if (oldBlockIndex >= 0) {
      this.queryBlock.operands.replace(oldBlockIndex, 1, newBlocks);
    }
  }

  /**
   * @param {Utils.QueryBuilder.QueryBlock} queryBlock
   */
  @action
  removeBlock(queryBlock) {
    this.queryBlock.operands.removeObject(queryBlock);
    this.onBlockRemoved(queryBlock);
  }
}
