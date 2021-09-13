/**
 * Main application route. Loads appProxy, configuration and spaces.
 * 
 * @module routes/application
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { all as allFulfilled } from 'rsvp';

export default class ApplicationRoute extends Route {
  @service appProxy;
  @service configuration;
  @service spacesProvider;

  /**
   * @override
   */
  beforeModel() {
    const result = super.beforeModel(...arguments);

    return this.appProxy.appProxyLoadingPromise
      .then(() => allFulfilled([
        // load configuration
        this.configuration.reloadConfiguration(),
        // load spaces
        this.spacesProvider.reloadSpaces(),
      ]))
      .then(() => result);
  }
}
