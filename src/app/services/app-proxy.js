/**
 * Exposes Onezone application proxy API (available through window.frameElement.appProxy).
 * It is a main bridge between GUI plugin logic and Onezone harvester API. AppProxy should
 * be initially loaded in application route.
 *
 * @module services/app-proxy
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service from '@ember/service';
import { Promise, resolve } from 'rsvp';
import { later } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import ENV from 'harvester-gui-plugin-generic/config/environment';

class AppProxyService extends Service {
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
  get dataRequest() {
    return this.appProxy?.dataRequest;
  }

  /**
   * Generates CURL command that is equivalent to the dataRequest functionality
   * @type {Function}
   * @param {String} params.method one of `get`, `post`
   * @param {String} params.indexName
   * @param {String} params.path path to resource (part of the url without index)
   * @param {String|undefined} params.body request body
   * @returns {Promise<String>} CURL command
   */
  get dataCurlCommandRequest() {
    return this.appProxy?.dataCurlCommandRequest;
  }

  /**
   * Fetches injected GUI plugin configuration
   * @type {Function}
   * @returns {Promise<Object>}
   */
  get configRequest() {
    return this.appProxy?.configRequest;
  }

  /**
   * Generates URL, which redirects to file browser with specified file selected
   * @type {Function}
   * @param {String} fileId file ID (CDMI Object ID)
   * @returns {Promise<Object>}
   */
  get fileBrowserUrlRequest() {
    return this.appProxy?.fileBrowserUrlRequest;
  }

  /**
   * Fetches harvester spaces
   * @type {Function}
   * @returns {Promise<Array<{ id: String, name: String }>>}
   */
  get spacesRequest() {
    return this.appProxy?.spacesRequest;
  }

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
    const window = this.getWindow();
    return this.appProxy = window.frameElement && window.frameElement.appProxy || null;
  }

  /**
   * @returns {Promise} resolves when appProxy becomes available
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

/**
 * Fake window object used in test environment. It is a very simple mock - to make it
 * more suitable for specific tests, stub `getWindow()` method.
 */
const testWindow = {
  frameElement: {
    appProxy: {
      dataRequest: () => resolve({}),
      dataCurlCommandRequest: () => resolve(''),
      configRequest: () => resolve({}),
      fileBrowserUrlRequest: () => resolve(''),
      spacesRequest: () => resolve([]),
    },
  },
};

class TestAppProxyService extends AppProxyService {
  /**
   * @override
   */
  getWindow() {
    return testWindow;
  }
}

export default (ENV.environment === 'test' ? TestAppProxyService : AppProxyService);
