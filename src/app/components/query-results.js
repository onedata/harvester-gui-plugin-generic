import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';

export default class QueryResultsComponent extends Component {
  @tracked filteredProperties = {};
  @tracked emptyQueryResults = new QueryResults();
  @tracked queryResults;

  get index() {
    return this.args.index || null;
  }

  get sortProperty() {
    return this.args.sortProperty || {};
  }

  get sortDirection() {
    return this.args.sortDirection || 'desc';
  }

  get activePageNumber() {
    return this.args.activePageNumber || 1;
  }

  get onSortChange() {
    return this.args.onSortChange || (() => {});
  }

  get pageSize() {
    return this.args.pageSize || 10;
  }

  get onPageChange() {
    return this.args.onPageChange || (() => {});
  }

  get onPageSizeChange() {
    return this.args.onPageSizeChange || (() => {});
  }

  constructor() {
    super(...arguments);

    this.queryResults = this.emptyQueryResults;
  }

  @action
  filteredPropertiesChanged(filteredProperties) {
    this.filteredProperties = filteredProperties;

    if (this.args.onFilteredPropertiesChange) {
      this.args.onFilteredPropertiesChange(filteredProperties);
    }
  }

  @action
  gotNewQueryResults(newQueryResults) {
    this.queryResults = newQueryResults;
  }
}
