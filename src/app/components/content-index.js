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

  @tracked query = '';
  @tracked queryResults = null;
  @tracked index = null;
  @tracked filteredProperties = {};

  constructor() {
    super(...arguments);
    this.elasticsearch.getMapping('generic-index')
      .then(response => trySet(this, 'index', new Index(Object.values(response)[0])));
  }

  @action
  queryChanged(query) {
    this.query = query;
  }

  @action
  performQuery(rootBlock) {
    const queryBuilder = new ElasticsearchQueryBuilder();
    queryBuilder.rootQueryBlock = rootBlock.slot;
    this.elasticsearch.search(
      'generic-index',
      queryBuilder.buildQuery()
    ).then(results => trySet(this, 'queryResults', this.parseQueryResults(results)));
  }

  @action
  getQueryCurl() {
    return this.elasticsearch.getSearchCurl('generic-index', ...arguments);
  }

  @action
  filteredPropertiesChange(filteredProperties) {
    this.filteredProperties = filteredProperties;
  }

  parseQueryResults(rawQueryResults) {
    return new QueryResults(rawQueryResults, {
      fileBrowserUrlRequest: this.appProxy.fileBrowserUrlRequest,
    });
  }
}
