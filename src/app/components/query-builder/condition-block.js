import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class QueryBuilderConditionBlockComponent extends Component {
  intlPrefix = 'components.query-builder.condition-block';

  @tracked mode = 'view';
  @tracked editComparatorValue = null;

  get queryBlock() {
    return this.args.queryBlock || {};
  }

  @action
  startEdit() {
    this.mode = 'edit';
    this.editComparatorValue = this.queryBlock.comparatorValue;
  }

  @action
  comparatorValueChange(newValue) {
    this.editComparatorValue = newValue;
  }

  @action
  stopEdit() {
    this.mode = 'view';
    this.queryBlock.comparatorValue = this.editComparatorValue;
  }

  @action
  cancelEdit() {
    this.mode = 'view';
  }
}
