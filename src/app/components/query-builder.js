import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';

export default class QueryBuilderComponent extends Component {
  @tracked rootQueryBlock = new SingleSlotQueryBlock();

  @action
  queryChanged(event) {
    this.args.queryChanged(event.target.value);
  }
}
