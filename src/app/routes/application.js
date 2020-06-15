/**
 * Main application route. Loads appProxy and configuration.
 * 
 * @module routes/application
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service appProxy;
  @service configuration;

  /**
   * @override
   */
  beforeModel() {
    const result = super.beforeModel(...arguments);

    return this.appProxy.appProxyLoadingPromise
      .then(() => this.configuration.reloadConfiguration())
      .then(() => result);
  }
}
