import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class QueryResultsComponent extends Component {
  @tracked
  visibleProperties = {};

  @action
  visiblePropertiesChanged(visibleProperties) {
    this.visibleProperties = visibleProperties;
  }
}
