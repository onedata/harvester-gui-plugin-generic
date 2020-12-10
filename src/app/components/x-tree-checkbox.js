/**
 * A custom extension of x-tree-checkbox component from ember-simple-tree. Adds
 * adjusted checkbox component.
 *
 * @module components/x-tree-checkbox
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import XTreeCheckboxBase from 'ember-simple-tree/components/x-tree-checkbox';

export default class XTreeCheckbox extends XTreeCheckboxBase {
  /**
   * @type {MouseEvent}
   */
  get fakeClickEvent() {
    return document.createEvent('MouseEvents');
  }
}
