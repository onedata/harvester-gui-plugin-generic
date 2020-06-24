import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import SingleSlotQueryBlock from 'harvester-gui-plugin-generic/utils/query-builder/single-slot-query-block';

export default class QueryBuilderComponent extends Component {
  intlPrefix = 'components.query-builder';

  @tracked rootQueryBlock = new SingleSlotQueryBlock();

  @action
  queryChanged(event) {
    this.args.queryChanged(event.target.value);
  }

  @action
  performQuery() {
    if (!this.args.onPerformQuery) {
      return;
    }

    this.args.onPerformQuery(this.rootQueryBlock);
  }
}
