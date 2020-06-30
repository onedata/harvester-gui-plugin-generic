import { get } from '@ember/object';
import QueryResult from 'harvester-gui-plugin-generic/utils/query-result';
import _ from 'lodash';

export default class QueryResults {
  rawResultsObject = undefined;
  results = [];
  totalResultsCount = 0;
  parseHelpers = {};

  constructor(rawResultsObject, parseHelpers) {
    this.parseHelpers = parseHelpers || {};

    if (rawResultsObject) {
      this.rawResultsObject = rawResultsObject;
      this.recalculateFields();
    }
  }

  recalculateFields() {
    const rawResultsObject = this.rawResultsObject || {};
    this.results = (get(rawResultsObject, 'hits.hits') || [])
      .map(hit => new QueryResult(hit, this.parseHelpers));
    this.totalResultsCount = get(rawResultsObject, 'hits.total.value') ||
      this.results.length;
  }

  getPropertiesTree() {
    const rawResults = this.results.mapBy('source').compact();
    const propertiesTree = {};

    rawResults.forEach(rawResult => {
      const rawQueue = [rawResult];
      const treeTargetQueue = [propertiesTree];

      while (rawQueue.length) {
        const rawObject = rawQueue.pop();
        const treeTarget = treeTargetQueue.pop();

        if (_.isArray(rawObject)) {
          rawQueue.push(...rawObject);
          treeTargetQueue.push(..._.times(rawObject.length, _.constant(treeTarget)));
        } else if (typeof rawObject === 'object' && rawObject !== null) {
          for (const key in rawObject) {
            if (!treeTarget[key]) {
              treeTarget[key] = {};
            }
            rawQueue.push(rawObject[key]);
            treeTargetQueue.push(treeTarget[key]);
          }
        }
      }
    });

    return propertiesTree;
  }
}
