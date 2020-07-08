import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class QueryResultsComponent extends Component {
  @tracked filteredProperties = {};

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

  @action
  filteredPropertiesChanged(filteredProperties) {
    this.filteredProperties = filteredProperties;

    if (this.args.onFilteredPropertiesChange) {
      this.args.onFilteredPropertiesChange(filteredProperties);
    }
  }
}
