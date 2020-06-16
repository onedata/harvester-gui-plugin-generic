import { get } from '@ember/object';
import QueryResult from 'harvester-gui-plugin-generic/utils/query-result';

export default class QueryResults {
  rawResultsObject = undefined;
  results = [];
  parseHelpers = {};

  constructor(rawResultsObject, parseHelpers) {
    this.parseHelpers = parseHelpers || {};

    if (rawResultsObject) {
      this.rawResultsObject = rawResultsObject;
      this.recalculateFields();
    }
  }

  recalculateFields() {
    this.results = (get(this.rawResultsObject || {}, 'hits.hits') || [])
      .map(hit => new QueryResult(hit, this.parseHelpers));
  }
}
