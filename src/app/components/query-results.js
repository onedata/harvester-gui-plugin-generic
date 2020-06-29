import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class QueryResultsComponent extends Component {
  @tracked
  filteredProperties = {};

  @action
  filteredPropertiesChanged(filteredProperties) {
    this.filteredProperties = filteredProperties;

    if (this.args.onFilteredPropertiesChange) {
      this.args.onFilteredPropertiesChange(filteredProperties);
    }
  }
}
