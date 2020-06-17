/**
 * Exposes REST methods of Elasticsearch
 *
 * @module services/elasticsearch
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';

export default class ElasticsearchService extends Service {
  @service appProxy;

  /**
   * Performs request to Elasticsearch.
   * @param {String} method one of `get`, `post`
   * @param {String} indexName
   * @param {String} path url (without host and index)
   * @param {any} body request body
   * @returns {Promise<any>} request result
   */
  request(method, indexName, path, body) {
    const dataRequest = this.get('appProxy.dataRequest');
    return dataRequest({
      method,
      indexName,
      path,
      body: JSON.stringify(body),
    });
  }

  /**
   * Makes a GET request
   * `fetch` because `get` is an Ember reserved function name
   * @param {String} indexName
   * @param {String} path
   * @returns {Promise<any>}
   */
  fetch(indexName, path) {
    return this.request('get', indexName, path);
  }

  /**
   * Makes a POST request
   * @param {String} indexName
   * @param {String} path
   * @param {any} body
   * @returns {Promise<any>}
   */
  post(indexName, path, body) {
    return this.request('post', indexName, path, body);
  }

  /**
   * Makes a _search POST request to the index
   * @param {String} indexName
   * @param {any} body
   * @returns {Promise<any>}
   */
  search(indexName, body) {
    return this.post(indexName, '_search', body);
  }

  /**
   * Makes a _mapping GET request to the index
   * @param {String} indexName
   * @returns {Promise<any>}
   */
  getMapping(indexName) {
    return this.fetch(indexName, '_mapping');
  }
}
