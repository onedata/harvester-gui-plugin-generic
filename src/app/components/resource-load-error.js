/**
 * Renders information about loading error.
 *
 * @module components/resource-load-error
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ResourceLoadErrorComponent extends Component {
  /**
   * @type {String}
   */
  intlPrefix = 'components.resource-load-error';

  /**
   * @type {boolean}
   */
  @tracked areDetailsExpanded = false;

  /**
   * @type {String}
   */
  get stringifiedDetails() {
    return JSON.stringify(this.args.details, null, 2);
  }

  @action toggleShowDetails() {
    this.areDetailsExpanded = !this.areDetailsExpanded;
  }
}
