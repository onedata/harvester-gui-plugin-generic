/**
 * Exposes Onezone application proxy API (available through window.frameElement.appProxy).
 *
 * @module services/app-proxy
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { get } from '@ember/object';
import { reads } from '@ember/object/computed';
import { Promise, resolve } from 'rsvp';
import { later } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';

export default class AppProxyService extends Service {
  /**
   * @type {Object}
   */
  @tracked appProxy = null;

  /**
   * @type {Promise}
   */
  appProxyLoadingPromise = resolve();

  /**
   * Elasticsearch request function
   * @type {Function}
   * @param {String} params.method one of `get`, `post`
   * @param {String} params.indexName
   * @param {String} params.path path to resource (part of the url without index)
   * @param {String|undefined} params.body request body
   * @returns {Promise<any>} request result
   */
  @reads('appProxy.dataRequest') dataRequest;

  /**
   * Generates CURL command that is equivalent to the dataRequest functionality
   * @type {Function}
   * @param {String} params.method one of `get`, `post`
   * @param {String} params.indexName
   * @param {String} params.path path to resource (part of the url without index)
   * @param {String|undefined} params.body request body
   * @returns {Promise<String>} CURL commang
   */
  @reads('appProxy.dataCurlCommandRequest') dataCurlCommandRequest;

  /**
   * Fetches injected GUI plugin configuration
   * @type {Function}
   * @returns {Promise<Object>}
   */
  @reads('appProxy.configRequest') configRequest;

  /**
   * Generates URL, which redirects to file browser with specified file selected
   * @type {Function}
   * @param {String} fileId file ID (CDMI Object ID)
   * @returns {Promise<Object>}
   */
  @reads('appProxy.fileBrowserUrlRequest') fileBrowserUrlRequest;

  /**
   * Fetches harvester spaces
   * @type {Function}
   * @returns {Promise<Array<{ id: String, name: String }>>}
   */
  @reads('appProxy.spacesRequest') spacesRequest;

  constructor() {
    super(...arguments);

    if (!this.loadAppProxy()) {
      this.appProxyLoadingPromise = this.scheduleLoadAppProxy();
    }
  }

  /**
   * @returns {Window}
   */
  getWindow() {
    return window;
  }

  /**
   * @returns {Object}
   */
  loadAppProxy() {
    return this.appProxy = get(this.getWindow(), 'frameElement.appProxy') || null;
  }

  /**
   * @returns {Promise}
   */
  scheduleLoadAppProxy() {
    return new Promise(resolve => {
      later(this, () => {
        if (!this.loadAppProxy()) {
          this.scheduleLoadAppProxy().then(resolve);
        } else {
          resolve();
        }
      }, 10);
    });
  }
}
