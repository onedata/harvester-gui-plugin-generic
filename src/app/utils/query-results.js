/**
 * Represents collection of Elasticsearch query results. To parse results, `parseHelpers`
 * should be provided in constructor. For now only one parse helper is needed:
 * `fileBrowserUrlRequest` - generates file browser URL for given file ID.
 * 
 * @module utils/query-results
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import QueryResult from 'harvester-gui-plugin-generic/utils/query-result';
import _ from 'lodash';

export default class QueryResults {
  /**
   * @type {Object}
   */
  rawResultsObject = undefined;

  /**
   * @type {Array<Utils.QueryResult>}
   */
  results = [];

  /**
   * @type {number}
   */
  totalResultsCount = 0;

  /**
   * Object with key -> value: helperName -> function
   * @type {Object}
   */
  parseHelpers = {};

  /**
   * @param {Object} rawResultsObject raw result from Elasticsearch
   * @param {Object} parseHelpers helpers used to parse results. Is an object:
   *   helperName -> function
   */
  constructor(rawResultsObject, parseHelpers) {
    this.parseHelpers = parseHelpers || {};
    this.fillWithRawResults(rawResultsObject);
  }

  /**
   * Parses raw results and persists them in instance properties
   * @param {Object} rawResultsObject raw result from Elasticsearch
   */
  fillWithRawResults(rawResultsObject) {
    this.rawResultsObject = rawResultsObject;
    const normalizedRawResultObject = rawResultsObject || {};

    this.results = _.get(normalizedRawResultObject, 'hits.hits', [])
      .map(hit => new QueryResult(hit, this.parseHelpers));
    this.totalResultsCount = _.get(
      normalizedRawResultObject,
      'hits.total.value',
      this.results.length
    );
  }

  /**
   * Generates a so called "properties tree" for query results. Properties tree is a
   * data structure, which represents a structure of results JSON. Example:
   * for JSON `{ a: 1, b: [{ bb: 2 }], c: {cc: 3}}` will return
   * ```
   * {
   *   a: {},
   *   b: {
   *     bb: {},
   *   },
   *   c: {
   *     cc: {},
   *   }
   * }
   * ```
   * Arrays are ignored (like in Elasticsearch engine) so an array of objects will be
   * flattened to a single object with all properties. Arrays of mixed objects and scalars
   * are forbidden, as they are in Elasticsearch.
   * This method returns merged properties tree for all results.
   * @returns {Object}
   */
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
