import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class QueryBuilderBlockSettingsComponent extends Component {
  @action
  onBlockReplace(closeSelectorCallback, newBlock) {
    closeSelectorCallback();
    if (this.args.onBlockReplace) {
      this.args.onBlockReplace(newBlock);
    }
  }
}
