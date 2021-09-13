/**
 * Shows font-awesome icon.
 *
 * @module components/fa-icon
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';

/**
 * @argument {String} icon
 * @argument {String} [size]
 */
export default class FaIconComponent extends Component {
  get iconClass() {
    return this.args.icon ? `fa-${this.args.icon}` : '';
  }

  get sizeClass() {
    return this.args.size ? `fa-${this.args.size}` : '';
  }
}
