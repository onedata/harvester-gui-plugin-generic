/**
 * Allows to edit query enumerable values.
 *
 * @module components/query-builder/editors/dropdown-editor
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { action } from '@ember/object';
import { next } from '@ember/runloop';
import QueryBuilderEditorsEditorBaseComponent from 'harvester-gui-plugin-generic/components/query-builder/editors/editor-base';

/**
 * @argument {String} value
 * @argument {Object} params
 * @argument {Function} onValueChange
 * @argument {Function} onFinishEdit
 * @argument {Function} onCancelEdit
 * @argument {Boolean} isValueInvalid
 */
export default class QueryBuilderEditorsDropdownEditorComponent
extends QueryBuilderEditorsEditorBaseComponent {
  /**
   * @type {String}
   */
  intlPrefix = 'components.query-builder.editors.dropdown-editor';

  /**
   * @type {Array<any>}
   */
  get options() {
    return this.params.options || [];
  }

  /**
   * @param {HTMLDivElement} dropdownElement
   */
  @action
  dropdownEditorInserted(dropdownTriggerElement) {
    if (this.params.initiallyFocused) {
      next(() => {
        const mouseDownEvent = new MouseEvent('mousedown');
        dropdownTriggerElement.dispatchEvent(mouseDownEvent);
        dropdownTriggerElement.focus();
      });
    }
  }
}
