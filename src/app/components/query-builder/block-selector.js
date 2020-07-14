import Component from '@glimmer/component';
import { action } from '@ember/object';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';
import MultiSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/multi-slot-query-block';
import ConditionQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/condition-query-block';

export default class QueryBuilderBlockSelectorComponent extends Component {
  intlPrefix = 'components.query-builder.block-selector';

  get onConditionAdd() {
    return this.args.onConditionAdd || (() => {});
  }

  get onOperatorAdd() {
    return this.args.onOperatorAdd || (() => {});
  }

  @action
  operatorAdded(operatorName) {
    let newBlock;
    switch (operatorName) {
      case 'not':
        newBlock = new SingleSlotQueryBlock(operatorName);
        break;
      case 'and':
      case 'or':
        newBlock = new MultiSlotQueryBlock(operatorName);
        break;
      default:
        return;
    }

    this.onOperatorAdd(newBlock);
  }

  @action
  conditionAdded(property, comparator, comparatorValue) {
    const condition = new ConditionQueryBlock(property, comparator, comparatorValue);
    this.onConditionAdd(condition);
  }
}
