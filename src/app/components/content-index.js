import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';
import EsIndex from 'harvester-gui-plugin-generic/utils/es-index';
import ElasticsearchQueryBuilder from 'harvester-gui-plugin-generic/utils/elasticsearch-query-builder';
import QueryValueComponentsBuilder from 'harvester-gui-plugin-generic/utils/query-value-components-builder';

export default class ContentIndexComponent extends Component {
  @service elasticsearch;
  @service appProxy;
  @service spacesProvider;

  @tracked indexPromise;
  @tracked queryValuesBuilder;
  @tracked queryResultsPromise;
  @tracked filteredProperties = {};
  @tracked sortProperty = {};
  @tracked sortDirection = 'desc';
  @tracked activePageNumber = 1;
  @tracked pageSize = 10;

  queryBuilder = new ElasticsearchQueryBuilder();

  constructor() {
    super(...arguments);
    this.queryValuesBuilder = new QueryValueComponentsBuilder(this.spacesProvider.spaces);
    this.indexPromise = this.elasticsearch.getMapping()
      .then(response => {
        this.performQuery();
        return new EsIndex(Object.values(response)[0]);
      });
  }

  @action
  performQuery(rootBlock) {
    this.queryBuilder.mainQueryBlock = rootBlock && rootBlock.clone();
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
  sortChange({ property, direction }) {
    this.sortProperty = this.queryBuilder.sortProperty = property;
    this.sortDirection = this.queryBuilder.sortDirection = direction;
    this.activePageNumber = 1;
    this.updateQueryBuilderResultsRange();
    this.queryElasticsearch();
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
    this.queryResultsPromise = this.elasticsearch.search(this.queryBuilder.buildQuery())
      .then(queryResults => this.parseQueryResults(queryResults));
  }

  updateQueryBuilderResultsRange() {
    this.queryBuilder.resultsFrom = this.pageSize * (this.activePageNumber - 1);
    this.queryBuilder.resultsSize = this.pageSize;
  }
}
