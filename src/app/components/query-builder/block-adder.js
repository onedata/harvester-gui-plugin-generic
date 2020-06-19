import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class QueryBuilderBlockAdderComponent extends Component {
  @action
  onBlockAdd(closeSelectorCallback, selectedBlock) {
    closeSelectorCallback();
    if (this.args.onBlockAdd) {
      this.args.onBlockAdd(selectedBlock);
    }
  }
}
