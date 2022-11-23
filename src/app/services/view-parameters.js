/**
 * Contains parameters describing how application should be rendered.
 *
 * For now there is only one setting - `viewMode` from `appProxy` service.
 *
 * @module services/view-parameters
 * @author Michał Borzęcki
 * @copyright (C) 2022 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ConfigurationService extends Service {
  @service appProxy;

  /**
   * Possible values:
   * - `'private'` - GUI is rendered in a harvester page inside Onezone layout,
   * - `'public'` - GUI is rendered in public mode outside Onezone layout.
   *
   * Call `reloadViewMode` method to fill this field with actual data.
   * @type {'private'|'public'|null}
   */
  @tracked viewMode = null;

  /**
   * @returns {Promise}
   */
  reloadViewMode() {
    return this.appProxy.viewModeRequest()
      .then((viewMode) => this.viewMode = viewMode)
      .catch(error => {
        this.viewMode = null;
        console.error('Loading GUI plugin view mode failed:', error);
      });
  }
}
