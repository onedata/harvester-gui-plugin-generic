/**
 * Represents a single Elasticsearch query result. To parse results, `parseHelpers`
 * should be provided in constructor. For now only one parse helper is needed:
 * `fileBrowserUrlRequest` - generates file browser URL for given file ID.
 * 
 * @module utils/query-results
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { tracked } from '@glimmer/tracking';
import _ from 'lodash';

export default class QueryResult {
  /**
   * Object with key -> value: helperName -> function
   * @type {Object}
   */
  parseHelpers = {};

  /**
   * @type {Object}
   */
  rawObject = undefined;

  /**
   * @type {Object}
   */
  source = undefined;

  /**
   * @type {String}
   */
  fileId = undefined;

  /**
   * @type {String}
   */
  fileName = undefined;

  /**
   * Is tracked, because it changes due to promise resolve
   * @type {String}
   */
  @tracked fileBrowserUrl = '';

  /**
   * @param {Object} rawObject 
   * @param {Object} parseHelpers 
   */
  constructor(rawObject, parseHelpers) {
    this.parseHelpers = parseHelpers || {};
    this.fillInWithRawResult(rawObject);
  }

  /**
   * Parses raw result and persists it in instance properties
   * @param {Object} rawObject 
   */
  fillInWithRawResult(rawObject) {
    this.rawObject = rawObject;
    const normalizedRawObject = rawObject || {};

    this.source = normalizedRawObject._source;
    this.fileId = normalizedRawObject._id;
    this.fileName = _.get(normalizedRawObject._source || {}, '__onedata.fileName');

    this.loadFileBrowserUrl();
  }

  loadFileBrowserUrl() {
    if (this.fileBrowserUrl) {
      this.fileBrowserUrl = '';
    }

    if (this.parseHelpers.fileBrowserUrlRequest && this.fileId) {
      this.parseHelpers.fileBrowserUrlRequest(this.fileId)
        .then(url => this.fileBrowserUrl = url);
    }
  }
}
