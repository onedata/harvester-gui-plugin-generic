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
    const queryBuilder = new ElasticsearchQueryBuilder();
    queryBuilder.rootQueryBlock = rootBlock && rootBlock.slot;
    this.elasticsearch.search(queryBuilder.buildQuery())
      .then(results => trySet(this, 'queryResults', this.parseQueryResults(results)));
  }

  @action
  getQueryCurl() {
    return this.elasticsearch.getSearchCurl(...arguments);
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
