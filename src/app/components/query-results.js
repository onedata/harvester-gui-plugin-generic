/**
 * Shows query results in form of paginated list.
 *
 * @module components/query-results
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';

export default class QueryResultsComponent extends Component {
  /**
   * Properties tree that indicates which properties should be visible in result preview.
   * If is an empty object, then all properties will be rendered.
   * @type {Object}
   */
  @tracked filteredProperties = {};

  /**
   * Query results visible to user.
   * @type {Utils.QueryResults}
   */
  @tracked queryResults;

  /**
   * Fake query results used to replace existing query results with the empty set after a
   * results loading error.
   * @type {Utils.QueryResults}
   */
  emptyQueryResults = new QueryResults();

  /**
   * @type {Utils.Index}
   */
  get index() {
    return this.args.index || null;
  }

  /**
   * @type {Utils.IndexProperty}
   */
  get sortProperty() {
    return this.args.sortProperty || {};
  }

  /**
   * @type {String}
   */
  get sortDirection() {
    return this.args.sortDirection || 'desc';
  }

  /**
   * @type {number}
   */
  get activePageNumber() {
    return this.args.activePageNumber || 1;
  }

  /**
   * @type {Function}
   * @param {Utils.IndexProperty} sortSpec.property
   * @param {String} sortSpec.direction
   */
  get onSortChange() {
    return this.args.onSortChange || (() => {});
  }

  /**
   * @type {number}
   */
  get pageSize() {
    return this.args.pageSize || 10;
  }

  /**
   * @type {Function}
   * @param {number} activePage
   */
  get onPageChange() {
    return this.args.onPageChange || (() => {});
  }

  /**
   * @type {Function}
   * @param {number} pageSize
   */
  get onPageSizeChange() {
    return this.args.onPageSizeChange || (() => {});
  }

  constructor() {
    super(...arguments);

    this.queryResults = this.emptyQueryResults;
  }

  /**
   * @param {Object} filteredProperties 
   */
  @action
  filteredPropertiesChanged(filteredProperties) {
    this.filteredProperties = filteredProperties;

    if (this.args.onFilteredPropertiesChange) {
      this.args.onFilteredPropertiesChange(filteredProperties);
    }
  }

  /**
   * Called when promise with new results settles
   * @param {Utils.QueryResults} newQueryResults 
   */
  @action
  gotNewQueryResults(newQueryResults) {
    this.queryResults = newQueryResults;
  }
}
