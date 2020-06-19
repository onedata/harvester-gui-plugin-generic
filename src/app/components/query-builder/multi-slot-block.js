import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class QueryBuilderMultiSlotBlockComponent extends Component {
  intlPrefix = 'components.query-builder.multi-slot-block';

  @action
  addBlock(queryBlock) {
    this.args.queryBlock.slots.pushObject(queryBlock);
  }
}
