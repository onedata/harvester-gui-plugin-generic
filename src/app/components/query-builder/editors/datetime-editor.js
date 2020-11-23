/**
 * Allows to edit query datetime values.
 *
 * @module components/query-builder/editors/datetime-editor
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
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
   * @type {String}
   */
  intlPrefix = 'components.query-builder.editors.datetime-editor';

  /**
   * @type {HTMLButtonElement}
   */
  @tracked includeTimeBtnElement = null;

  /**
   * @param {Boolean|Date} value
   */
  @action
  valueChanged(value) {
    if (typeof value === 'boolean') {
      // timeEnabled change
      this.onValueChange(Object.assign({},
        this.value, { timeEnabled: value }
      ));
    } else if (value && value[0] instanceof Date) {
      // datetime change
      this.onValueChange(Object.assign({},
        this.value, { datetime: value[0] }
      ));
    }
  }

  /**
   * @param {HTMLButtonElement} btnElement
   */
  @action
  includeTimeBtnInserted(btnElement) {
    this.includeTimeBtnElement = btnElement;
  }

  @action
  includeTimeBtnDestroyed() {
    this.includeTimeBtnElement = null;
  }

  /**
   * @param {Array<Date>} selectedDates
   * @param {String} dateStr
   * @param {Flatpickr} instance
   */
  @action
  flatpickrReady(selectedDates, dateStr, instance) {
    if (this.params.initiallyFocused) {
      instance.open();
    }
  }

  /**
   * @param {Array<Date>} selectedDates
   */
  @action
  flatpickrClose(selectedDates) {
    // Sending "valueChanged" notify, because flatpickr first sends onClose and then
    // onChange. onClose causes stop of edition, which then ignores incoming onChange.
    this.valueChanged(selectedDates);
    this.onFinishEdit();
  }
}
