import Component from '@glimmer/component';
import { action } from '@ember/object';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';
import OperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/operator-query-block';
import AndOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/and-operator-query-block';
import OrOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/or-operator-query-block';
import NotOperatorQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/not-operator-query-block';

const allowedModes = ['create', 'edit'];
const operatorClasses = {
  and: AndOperatorQueryBlock,
  or: OrOperatorQueryBlock,
  not: NotOperatorQueryBlock,
};

export default class QueryBuilderBlockSelectorComponent extends Component {
  intlPrefix = 'components.query-builder.block-selector';
  allowedModes = allowedModes;

  get mode() {
    return this.allowedModes.includes(this.args.mode) ? this.args.mode : allowedModes[0];
  }

  get editBlock() {
    return this.args.editBlock || null;
  }

  get onBlockAdd() {
    return this.args.onBlockAdd || (() => {});
  }

  get onBlockReplace() {
    return this.args.onBlockReplace || (() => {});
  }

  get isEditBlockAnOperator() {
    return this.editBlock instanceof OperatorQueryBlock;
  }

  get changeToDisabledOperators() {
    const operatorNames = Object.keys(operatorClasses);

    if (!this.editBlock) {
      return operatorNames;
    }

    const disabledOperators = [this.editBlock.operator];
    operatorNames
      .without(this.editBlock.operator)
      .forEach(operatorName => {
        if (
          operatorClasses[operatorName].maxOperandsNumber < this.editBlock.operands.length
        ) {
          disabledOperators.push(operatorName);
        }
      });

    return disabledOperators;
  }

  @action
  operatorAdded(operatorName) {
    this.onBlockAdd(this.createOperatorBlock(operatorName));
  }

  @action
  conditionAdded(property, comparator, comparatorValue) {
    const condition = new ConditionQueryBlock(property, comparator, comparatorValue);
    this.onBlockAdd(condition);
  }

  @action
  surround(operatorName) {
    if (!this.editBlock) {
      return;
    }

    this.onBlockReplace(this.createOperatorBlock(operatorName, [this.editBlock]));
  }

  @action
  changeTo(operatorName) {
    if (!this.editBlock) {
      return;
    }

    this.onBlockReplace(this.createOperatorBlock(
      operatorName,
      this.editBlock.operands
    ));
  }

  createOperatorBlock(operatorName, initialSubblocks = []) {
    const normalizedInitialSubblocks = initialSubblocks || [];

    const newBlock = new operatorClasses[operatorName]();
    newBlock.operands.pushObjects(normalizedInitialSubblocks);

    return newBlock;
  }
}
