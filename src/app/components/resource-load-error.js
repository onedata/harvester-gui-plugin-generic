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
import _ from 'lodash';

/**
 * @argument {any} [details] Error instance or any other value with error details
 */
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
    // Not using `instanceof Error` because some errors may come from the parent
    // Onezone window, which has different Error class that will not match this
    // window Error class.
    if (_.get(this.args.details || {}, 'constructor.name') === 'Error') {
      return this.args.details.message;
    } else {
      return JSON.stringify(this.args.details, null, 2);
    }
  }

  @action toggleShowDetails() {
    this.areDetailsExpanded = !this.areDetailsExpanded;
  }
}
