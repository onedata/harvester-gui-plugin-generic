import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class QueryBuilderSingleSlotBlockComponent extends Component {
  intlPrefix = 'components.query-builder.single-slot-block';

  @action
  addBlock(queryBlock) {
    this.args.queryBlock.slot = queryBlock;
  }

  @action
  replaceBlock(newBlock) {
    this.args.queryBlock.slot = newBlock;
  }

  @action
  removeBlock() {
    this.args.queryBlock.slot = null;
  }
}
