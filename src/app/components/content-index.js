import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action, trySet } from '@ember/object';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';
import Index from 'harvester-gui-plugin-generic/utils/index';
import ElasticsearchQueryConstructor from 'harvester-gui-plugin-generic/utils/elasticsearch-query-constructor';

export default class ContentIndexComponent extends Component {
  @service elasticsearch;
  @service appProxy;

  @tracked query = '';

  @tracked queryResults = null;

  @tracked index = null;

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
    const queryConstructor = new ElasticsearchQueryConstructor;
    this.elasticsearch.search(
      'generic-index',
      queryConstructor.constructQuery(rootBlock.slot)
    ).then(results => trySet(this, 'queryResults', this.parseQueryResults(results)));
  }

  parseQueryResults(rawQueryResults) {
    return new QueryResults(rawQueryResults, {
      fileBrowserUrlRequest: this.appProxy.fileBrowserUrlRequest,
    });
  }
}
