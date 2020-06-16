import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action, trySet } from '@ember/object';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';

export default class ContentIndexComponent extends Component {
  @service elasticsearch;
  @service appProxy;

  @tracked query = '';

  @tracked queryResults = null;

  @action
  queryChanged(query) {
    this.query = query;
  }

  @action
  performQuery() {
    this.elasticsearch.post('generic-index', '_search', {
        query: {
          multi_match: {
            query: this.query,
          },
        },
      })
      .then(results => trySet(this, 'queryResults', this.parseQueryResults(results)));
  }

  parseQueryResults(rawQueryResults) {
    return new QueryResults(rawQueryResults, {
      fileBrowserUrlRequest: this.appProxy.fileBrowserUrlRequest,
    });
  }
}
