import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ContentIndexComponent extends Component {
  @service elasticsearch;

  @tracked query = '';

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
      .then(result => console.log(result.hits.hits));
  }
}
