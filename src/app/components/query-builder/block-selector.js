/**
 * Contains options for query block. In 'create' mode allows to select new block, in 'edit'
 * mode has options for changing existing query blocks.
 *
 * @module components/query-builder/block-selector
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import OperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/operator-query-block';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/or-operator-query-block';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';
import { A } from '@ember/array';

const allowedModes = ['create', 'edit'];
const operatorClasses = {
  and: AndOperatorQueryBlock,
  or: OrOperatorQueryBlock,
  not: NotOperatorQueryBlock,
};

/**
 * @argument {String} [mode]
 * @argument {Array<IndexProperty>} indexProperties
 * @argument {Utils.QueryBlock} editBlock
 * @argument {Function} onBlockAdd
 * @argument {Function} onBlockReplace
 */
export default class QueryBuilderBlockSelectorComponent extends Component {
  /**
   * @type {String}
   */
  intlPrefix = 'components.query-builder.block-selector';

  /**
   * @type {Array<String>}
   */
  allowedModes = allowedModes;

  /**
   * @type {String}
   */
  get mode() {
    return this.allowedModes.includes(this.args.mode) ? this.args.mode : allowedModes[0];
  }

  /**
   * @type {Utils.QueryBuilder.QueryBlock}
   */
  get editBlock() {
    return this.args.editBlock || null;
  }

  /**
   * @type {Function}
   * @param {Utils.QueryBuilder.QueryBlock} newBlock
   */
  get onBlockAdd() {
    return this.args.onBlockAdd || (() => {});
  }

  /**
   * @type {Function}
   * @param {Utils.QueryBuilder.QueryBlock} newBlock
   */
  get onBlockReplace() {
    return this.args.onBlockReplace || (() => {});
  }

  /**
   * @type {String}
   */
  get isEditBlockAnOperator() {
    return this.editBlock instanceof OperatorQueryBlock;
  }

  /**
   * List of disabled operators for 'change to operator' section
   * @type {Array<String>}
   */
  get disabledOperatorsInChangeToSection() {
    const operatorNames = Object.keys(operatorClasses);

    if (!this.editBlock) {
      return operatorNames;
    }

    const editBlockOperator = this.editBlock.operator;
    const editBlockOperandsCount = this.editBlock.operands.length;
    return operatorNames.filter((operatorName) => {
      return operatorName === editBlockOperator ||
        operatorClasses[operatorName].maxOperandsNumber < editBlockOperandsCount;
    });
  }

  /**
   * @param {String} operatorName
   */
  @action
  operatorAdded(operatorName) {
    this.onBlockAdd(this.createOperatorBlock(operatorName));
  }

  /**
   * @param {Utils.IndexProperty} property
   * @param {String} comparator
   * @param {any} comparatorValue
   */
  @action
  conditionAdded(property, comparator, comparatorValue) {
    const condition = new ConditionQueryBlock(property, comparator, comparatorValue);
    this.onBlockAdd(condition);
  }

  /**
   * @param {String} operatorName
   */
  @action
  surroundWithOperator(operatorName) {
    if (!this.editBlock) {
      return;
    }

    this.onBlockReplace(this.createOperatorBlock(operatorName, [this.editBlock]));
  }

  /**
   * @param {String} operatorName
   */
  @action
  changeToOperator(operatorName) {
    if (!this.editBlock) {
      return;
    }

    this.onBlockReplace(this.createOperatorBlock(
      operatorName,
      this.editBlock.operands
    ));
  }

  /**
   * @param {String} operatorName
   * @param {Array<Utils.QueryBuilder.QueryBlock>} [initialOperands=[]]
   * @returns {Utils.QueryBuilder.OperatorQueryBlock}
   */
  createOperatorBlock(operatorName, initialOperands = []) {
    const newBlock = new operatorClasses[operatorName]();
    if (initialOperands) {
      newBlock.operands = A(initialOperands);
    }

    return newBlock;
  }
}
