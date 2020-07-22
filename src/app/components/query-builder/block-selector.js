import Component from '@glimmer/component';
import { action } from '@ember/object';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';

const allowedModes = ['create', 'edit'];

export default class QueryBuilderBlockSelectorComponent extends Component {
  intlPrefix = 'components.query-builder.block-selector';
  allowedModes = allowedModes;

  get mode() {
    return this.allowedModes.includes(this.args.mode) ? this.args.mode : allowedModes[0];
  }

  get editBlock() {
    return this.args.editBlock || null;
  }

  get editBlockSlots() {
    if (this.editBlock) {
      if (this.editBlock.slots) {
        return this.editBlock.slots;
      } else if (this.editBlock.slot) {
        return [this.editBlock.slot];
      }
    }

    return [];
  }

  get onBlockAdd() {
    return this.args.onBlockAdd || (() => {});
  }

  get onBlockReplace() {
    return this.args.onBlockReplace || (() => {});
  }

  get isEditBlockAnOperator() {
    return this.editBlock instanceof MultiSlotQueryBlock ||
      this.editBlock instanceof SingleSlotQueryBlock;
  }

  get changeToDisabledOperators() {
    const disabledOperators = [this.editBlock.operator];
    if (this.editBlockSlots.length > 1) {
      disabledOperators.push('not');
    }

    return disabledOperators;
  }

  @action
  operatorAdded(operatorName) {
    this.onBlockAdd(this.createNewOperatorBlock(operatorName));
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

    this.onBlockReplace(this.createNewOperatorBlock(operatorName, [this.editBlock]));
  }

  @action
  changeTo(operatorName) {
    if (!this.editBlock) {
      return;
    }

    this.onBlockReplace(this.createNewOperatorBlock(
      operatorName,
      this.editBlockSlots
    ));
  }

  createNewOperatorBlock(operatorName, initialSubblocks = []) {
    const normalizedInitialSubblocks = initialSubblocks || [];
    switch (operatorName) {
      case 'not': {
        const newBlock = new SingleSlotQueryBlock(operatorName);
        if (normalizedInitialSubblocks.length) {
          newBlock.slot = normalizedInitialSubblocks[0];
        }
        return newBlock;
      }
      case 'and':
      case 'or': {
        const newBlock = new MultiSlotQueryBlock(operatorName);
        if (normalizedInitialSubblocks.length) {
          newBlock.slots.pushObjects(normalizedInitialSubblocks);
        }
        return newBlock;
      }
    }
  }
}
