import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class QueryBuilderBlockVisualiserComponent extends Component {
  @tracked isDirectlyHovered = false;

  @action
  directlyHovered(isDirectlyHovered) {
    this.isDirectlyHovered = isDirectlyHovered;
  }

  @action
  onBlockReplace(closeSelectorCallback, newBlock) {
    closeSelectorCallback();
    if (this.args.onBlockReplace) {
      this.args.onBlockReplace(newBlock);
    }
  }
}
