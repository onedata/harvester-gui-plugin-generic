import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class QueryBuilderMultiSlotBlockComponent extends Component {
  intlPrefix = 'components.query-builder.multi-slot-block';

  get queryBlock() {
    return this.args.queryBlock;
  }

  @action
  addBlock(queryBlock) {
    this.args.queryBlock.slots.pushObject(queryBlock);
  }

  @action
  replaceBlock(oldBlock, newBlock) {
    const oldBlockIndex = this.queryBlock.slots.indexOf(oldBlock);
    if (oldBlockIndex >= 0) {
      this.queryBlock.slots.replace(oldBlockIndex, 1, [newBlock]);
    }
  }

  @action
  removeBlock(queryBlock) {
    this.args.queryBlock.slots.removeObject(queryBlock);
  }
}
