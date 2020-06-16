import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class QueryBuilderComponent extends Component {

  @action
  queryChanged(event) {
    this.args.queryChanged(event.target.value);
  }
}
