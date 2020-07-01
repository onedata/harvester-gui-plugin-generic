import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action, trySet } from '@ember/object';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';
import Index from 'harvester-gui-plugin-generic/utils/index';
import ElasticsearchQueryBuilder from 'harvester-gui-plugin-generic/utils/elasticsearch-query-builder';

export default class ContentIndexComponent extends Component {
  @service elasticsearch;
  @service appProxy;

  @tracked queryResults = null;
  @tracked index = null;
  @tracked filteredProperties = {};
  @tracked activePageNumber = 1;
  @tracked pageSize = 10;

  queryBuilder = new ElasticsearchQueryBuilder();

  constructor() {
    super(...arguments);
    this.elasticsearch.getMapping()
      .then(response => {
        trySet(this, 'index', new Index(Object.values(response)[0]));
        return this.performQuery();
      });
  }

  @action
  performQuery(rootBlock) {
    const rootSlot = rootBlock && rootBlock.slot;
    this.queryBuilder.rootQueryBlock = rootSlot ? rootSlot.clone() : rootSlot;
    this.activePageNumber = 1;
    this.updateQueryBuilderResultsRange();
    this.queryElasticsearch();
  }

  @action
  getQueryCurl() {
    return this.elasticsearch.getSearchCurl(...arguments);
  }

  @action
  filteredPropertiesChange(filteredProperties) {
    this.filteredProperties = filteredProperties;
  }

  @action
  pageChange(activePageNumber) {
    this.activePageNumber = activePageNumber;
    this.updateQueryBuilderResultsRange();
    this.queryElasticsearch();
  }

  @action
  pageSizeChange(pageSize) {
    this.pageSize = pageSize;
    this.activePageNumber = 1;
    this.updateQueryBuilderResultsRange();
    this.queryElasticsearch();
  }

  parseQueryResults(rawQueryResults) {
    return new QueryResults(rawQueryResults, {
      fileBrowserUrlRequest: this.appProxy.fileBrowserUrlRequest,
    });
  }

  queryElasticsearch() {
    this.elasticsearch.search(this.queryBuilder.buildQuery())
      .then(results => trySet(this, 'queryResults', this.parseQueryResults(results)));
  }

  updateQueryBuilderResultsRange() {
    this.queryBuilder.resultsFrom = this.pageSize * (this.activePageNumber - 1);
    this.queryBuilder.resultsSize = this.pageSize;
  }
}
