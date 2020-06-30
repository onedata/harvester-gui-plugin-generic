import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class QueryResultsPaginationComponent extends Component {
  get resultsCount() {
    return this.args.resultsCount || 0;
  }

  get pageSize() {
    return this.args.pageSize || 10;
  }

  get activePageNumber() {
    return this.args.activePageNumber || 1;
  }

  get onPageChange() {
    return this.args.onPageChange || (() => {});
  }

  get onPageSizeChange() {
    return this.args.onPageSizeChange || (() => {});
  }

  get pagesCount() {
    return Math.ceil(this.resultsCount / this.pageSize);
  }

  get isOnFirstPage() {
    return this.activePageNumber <= 1;
  }

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
