import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class ContentIndexComponent extends Component {
  @service elasticsearch;

  constructor() {
    super(...arguments);

    this.elasticsearch.post('generic-index', '_search', {
        query: {
          multi_match: {
            query: 'efgh',
            type: 'phrase_prefix',
          },
        },
      })
      .then(result => console.log(result.hits.hits));
  }
}
