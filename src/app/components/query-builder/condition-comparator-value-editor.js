/**
 * A component responsible for visualising and editing comparator values for condition
 * query blocks. Has three modes: view, edit and create
 *
 * @module components/query-builder/condition-comparator-value-editor
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { action, set } from '@ember/object';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { defaultComparatorEditors } from 'harvester-gui-plugin-generic/utils/query-builder/condition-comparator-editors';

const possibleModes = ['view', 'edit', 'create'];

/**
 * @argument {String} [mode]
 * @argument {String} comparator
 * @argument {Any} value
 * @argument {Boolean} isValueInvalid
 * @argument {Function} onValueChange
 * @argument {Function} [onStartEdit]
 * @argument {Function} [onFinishEdit]
 * @argument {Function} [onCancelEdit]
 */
export default class QueryBuilderConditionComparatorValueEditorComponent
extends Component {
  @service spacesProvider;

  /**
   * @type {String}
   */
  intlPrefix = 'components.query-builder.condition-comparator-value-editor';

  /**
   * @type {Object}
   */
  @tracked comparatorEditorsSet = defaultComparatorEditors;

  /**
   * @type {HTMLButtonElement}
   */
  @tracked includeTimeBtnElement = null;

  /**
   * One of: view, edit, create
   * @type {String}
   */
  get mode() {
    return possibleModes.includes(this.args.mode) ? this.args.mode : 'view';
  }

  /**
   * @type {String}
   */
  get comparator() {
    return this.args.comparator || '';
  }

  /**
   * @type {any}
   */
  get value() {
    return this.args.value || null;
  }

  /**
   * @type {boolean}
   */
  get isValueInvalid() {
    return this.args.isValueInvalid || false;
  }

  /**
   * @type {Function}
   * @param {any} comparatorValue
   */
  get onValueChange() {
    return this.args.onValueChange || (() => {});
  }

  /**
   * @type {Function}
   */
  get onStartEdit() {
    return this.args.onStartEdit || (() => {});
  }

  /**
   * @type {Function}
   */
  get onFinishEdit() {
    return this.args.onFinishEdit || (() => {});
  }

  /**
   * @type {Function}
   */
  get onCancelEdit() {
    return this.args.onCancelEdit || (() => {});
  }

  /**
   * @type {Object}
   */
  get comparatorEditor() {
    return this.comparatorEditorsSet[this.comparator];
  }

  /**
   * @type {any}
   */
  get viewModeComparatorValue() {
    if (this.comparator.startsWith('date.')) {
      let formatString = 'YYYY-MM-DD';
      if (this.value.timeEnabled) {
        formatString += ' HH:mm:ss';
      }
      return moment(this.value.datetime).format(formatString);
    } else if (this.comparator.startsWith('space.')) {
      return this.value.name;
    } else if (typeof this.value === 'string') {
      return `"${this.value}"`;
    } else {
      return this.value;
    }
  }

  constructor() {
    super(...arguments);

    // setup list of spaces for space.is editor
    const spaceEditor = this.comparatorEditorsSet['space.is'];
    if (spaceEditor && spaceEditor.type === 'space') {
      // `set` because this.comparatorEditorsSet is tracked
      set(spaceEditor, 'values', this.spacesProvider.spaces);
    }
  }

  /**
   * @param {any} value
   */
  @action
  valueChanged(value) {
    let newValue = value;

    if (this.comparatorEditor.type === 'date') {
      if (typeof value === 'boolean') {
        // timeEnabled change
        newValue = Object.assign({},
          this.value, { timeEnabled: value }
        );
      } else if (newValue[0] && newValue[0] instanceof Date) {
        // datetime change
        newValue = Object.assign({},
          this.value, { datetime: newValue[0] }
        );
      }
    } else if (newValue instanceof Event) {
      newValue = value.target.value;
    }

    this.onValueChange(newValue);
  }

  /**
   * @param {HTMLInputElement} inputElement
   */
  @action
  textEditorInserted(inputElement) {
    if (this.mode === 'edit') {
      inputElement.focus();
      inputElement.select();
    }
  }

  /**
   * @param {HTMLDivElement} dropdownElement
   */
  @action
  dropdownEditorInserted(dropdownElement) {
    if (this.mode === 'edit') {
      next(() => {
        const trigger = dropdownElement.querySelector('.ember-power-select-trigger');
        const mouseDownEvent = new MouseEvent('mousedown');
        trigger.dispatchEvent(mouseDownEvent);
        trigger.focus();
      });
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
    if (this.mode === 'edit') {
      instance.open();
    }
  }

  /**
   * @param {Array<Date>} selectedDates
   */
  @action
  flatpickrClose(selectedDates) {
    if (this.mode === 'edit') {
      // Sending "valueChanged" notify, because flatpickr first sends onClose and then
      // onChange. onClose causes stop of edition, which then ignores incoming onChange.
      this.valueChanged(selectedDates);
      this.onFinishEdit();
    }
  }

  /**
   * @param {KeyboardEvent} event
   */
  @action
  keyDown(event) {
    if (event.key === 'Escape') {
      this.onCancelEdit();
    }
  }
}
