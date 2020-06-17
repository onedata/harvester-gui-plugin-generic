import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action, trySet } from '@ember/object';
import QueryResults from 'harvester-gui-plugin-generic/utils/query-results';
import Index from 'harvester-gui-plugin-generic/utils/index';

export default class ContentIndexComponent extends Component {
  @service elasticsearch;
  @service appProxy;

  @tracked query = '';

  @tracked queryResults = null;

  @tracked index = {};

  get indexPropertiesPaths() {
    return extractIndexPropertiesPaths(Object.values(this.index.properties || {}));
  }

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
  performQuery() {
    this.elasticsearch.search('generic-index', {
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

function extractIndexPropertiesPaths(properties) {
  const paths = [];
  properties.forEach(property => {
    let propertyAncestor = property.parentProperty;
    let path = property.name;
    while (propertyAncestor) {
      path = `${propertyAncestor.name}.${path}`;
      propertyAncestor = propertyAncestor.parentProperty;
    }
    paths.push(
      path,
      ...extractIndexPropertiesPaths(Object.values(property.properties))
    );
  });
  return paths;
}
