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
   * @param {String} path url (without host and index)
   * @param {any} body request body
   * @returns {Promise<any>} request result
   */
  request(method, path, body) {
    const dataRequest = this.get('appProxy.dataRequest');
    return dataRequest({
      method,
      indexName: 'generic-index',
      path,
      body: JSON.stringify(body),
    });
  }

  /**
   * Makes a GET request
   * `fetch` because `get` is an Ember reserved function name
   * @param {String} path
   * @returns {Promise<any>}
   */
  fetch(path) {
    return this.request('get', path);
  }

  /**
   * Makes a POST request
   * @param {String} path
   * @param {any} body
   * @returns {Promise<any>}
   */
  post(path, body) {
    return this.request('post', path, body);
  }

  /**
   * Makes a _search POST request to the index
   * @param {any} body
   * @returns {Promise<any>}
   */
  search(body) {
    return this.post('_search', body);
  }

  /**
   * Makes a _mapping GET request to the index
   * @returns {Promise<any>}
   */
  getMapping() {
    return this.fetch('_mapping');
  }

  /**
   * Generates CURL command equivalent to the request to Elasticsearch.
   * @param {String} method one of `get`, `post`
   * @param {String} path url (without host and index)
   * @param {any} body request body
   * @returns {Promise<String>} CURL command
   */
  requestCurl(method, path, body) {
    const dataCurlCommandRequest = this.get('appProxy.dataCurlCommandRequest');
    return dataCurlCommandRequest({
      method,
      indexName: 'generic-index',
      path,
      body: JSON.stringify(body),
    });
  }

  /**
   * Generates a CURL POST request to the index
   * @param {String} path
   * @param {any} body
   * @returns {Promise<String>}
   */
  getPostCurl(path, body) {
    return this.requestCurl('post', path, body);
  }

  /**
   * Generates a CURL _search POST request to the index
   * @param {any} body
   * @returns {Promise<String>}
   */
  getSearchCurl(body) {
    return this.getPostCurl('_search', body);
  }
}
