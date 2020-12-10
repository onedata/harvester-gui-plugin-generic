/**
 * Contains GUI plugin configuration. Usually it is a simple JavaScript object,
 * which contains some custom user data. Configuration data should be initially loaded
 * in application route.
 *
 * NOTICE: Generic GUI plugin does not need any external configuration. This service was
 * prepared to be an example implementation, which can be used later by customized plugins.
 *
 * @module services/configuration
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ConfigurationService extends Service {
  @service appProxy;

  /**
   * @type {any}
   */
  @tracked configuration = null;

  /**
   * (Re)loads configuration object
   * @returns {Promise}
   */
  reloadConfiguration() {
    return this.appProxy.configRequest()
      .then(config => this.configuration = config)
      .catch(error => {
        this.configuration = null;
        console.error('Loading GUI plugin configuration failed:', error);
        // NOTICE: implement custom error handling when this service will be needed by
        // application logic. Probably some error splash screen etc.
      });
  }
}
