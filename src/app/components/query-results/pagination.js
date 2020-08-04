/**
 * Page selector. Allows to select page number and page size.
 *
 * @module components/query-results/pagination
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class QueryResultsPaginationComponent extends Component {
  /**
   * @type {String}
   */
  intlPrefix = 'components.query-results.pagination';

  /**
   * @type {number}
   */
  get resultsCount() {
    return this.args.resultsCount || 0;
  }

  /**
   * @type {number}
   */
  get pageSize() {
    return this.args.pageSize || 10;
  }

  /**
   * @type {number}
   */
  get activePageNumber() {
    return this.args.activePageNumber || 1;
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

  /**
   * @type {number}
   */
  get pagesCount() {
    return Math.ceil(this.resultsCount / this.pageSize);
  }

  /**
   * @type {boolean}
   */
  get isOnFirstPage() {
    return this.activePageNumber <= 1;
  }

  /**
   * @type {boolean}
   */
  get isOnLastPage() {
    return this.activePageNumber >= this.pagesCount;
  }

  @action
  goToFirstPage() {
    this.onPageChange(1);
  }

  @action
  goToPrevPage() {
    this.onPageChange(Math.max(this.activePageNumber - 1, 1));
  }

  @action
  goToNextPage() {
    this.onPageChange(Math.min(this.activePageNumber + 1, this.pagesCount));
  }

  @action
  goToLastPage() {
    this.onPageChange(this.pagesCount);
  }

  @action
  goToSpecificPage(event) {
    const newPageNumber = this.normalizePageNumber(Number.parseInt(event.target.value));
    this.onPageChange(newPageNumber);
  }

  @action
  pageSizeChange(newPageSize) {
    this.onPageSizeChange(newPageSize);
  }

  normalizePageNumber(pageNumber) {
    if (isNaN(pageNumber) || pageNumber < 1) {
      return 1;
    } else if (pageNumber > this.pagesCount) {
      return this.pagesCount;
    } else {
      return pageNumber;
    }
  }
}
