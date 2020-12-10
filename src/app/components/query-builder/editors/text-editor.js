/**
 * Allows to edit query text values.
 *
 * @module components/query-builder/editors/text-editor
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { action } from '@ember/object';
import QueryBuilderEditorsEditorBaseComponent from 'harvester-gui-plugin-generic/components/query-builder/editors/editor-base';

/**
 * @argument {String} value
 * @argument {Object} params
 * @argument {Function} onValueChange
 * @argument {Function} onFinishEdit
 * @argument {Function} onCancelEdit
 * @argument {Boolean} isValueInvalid
 */
export default class QueryBuilderEditorsTextEditorComponent
extends QueryBuilderEditorsEditorBaseComponent {
  /**
   * @param {InputEvent} event
   */
  @action
  valueChanged(event) {
    this.onValueChange(event.target.value);
  }

  @action
  keyDown(event) {
    if (event.key === 'Escape') {
      this.onCancelEdit();
    }
  }

  /**
   * @param {HTMLInputElement} inputElement
   */
  @action
  textEditorInserted(inputElement) {
    if (this.params.initiallyFocused) {
      inputElement.focus();
      inputElement.select();
    }
  }
}
