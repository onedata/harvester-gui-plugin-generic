import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class QueryBuilderOperatorBlockComponent extends Component {
  intlPrefix = 'components.query-builder.operator-block';

  get queryBlock() {
    return this.args.queryBlock;
  }

  get hasSingleOperandOperator() {
    return this.queryBlock && this.queryBlock.constructor.maxOperandsNumber === 1;
  }

  @action
  addBlock(queryBlock) {
    this.args.queryBlock.operands.pushObject(queryBlock);
  }

  @action
  replaceBlock(oldBlock, newBlock) {
    const oldBlockIndex = this.queryBlock.operands.indexOf(oldBlock);
    if (oldBlockIndex >= 0) {
      this.queryBlock.operands.replace(oldBlockIndex, 1, [newBlock]);
    }
  }

  @action
  removeBlock(queryBlock) {
    this.args.queryBlock.operands.removeObject(queryBlock);
  }
}
