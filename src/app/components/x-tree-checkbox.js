/**
 * A custom extension of x-tree-checkbox component from ember-simple-tree. Adds
 * adjusted checkbox component.
 *
 * @module components/x-tree-checkbox
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';

export default class XTreeCheckbox extends Component {
  /**
   * @type {MouseEvent}
   */
  get fakeClickEvent() {
    return document.createEvent('MouseEvents');
  }
}
