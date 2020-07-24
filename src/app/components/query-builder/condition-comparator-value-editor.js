import Component from '@glimmer/component';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { action, set } from '@ember/object';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { defaultComparatorEditors } from 'harvester-gui-plugin-generic/utils/query-builder/condition-comparator-editors';

export default class QueryBuilderConditionComparatorValueEditorComponent
extends Component {
  @service spacesProvider;
  intlPrefix = 'components.query-builder.condition-comparator-value-editor';

  @tracked comparatorEditorsSet = defaultComparatorEditors;
  @tracked includeTimeBtnElement = null;

  get mode() {
    return this.args.mode || 'view';
  }

  get comparator() {
    return this.args.comparator || '';
  }

  get value() {
    return this.args.value || null;
  }

  get isValueInvalid() {
    return this.args.isValueInvalid || false;
  }

  get onValueChange() {
    return this.args.onValueChange || (() => {});
  }

  get onStartEdit() {
    return this.args.onStartEdit || (() => {});
  }

  get onStopEdit() {
    return this.args.onStopEdit || (() => {});
  }

  get onCancelEdit() {
    return this.args.onCancelEdit || (() => {});
  }

  get comparatorEditor() {
    return this.comparatorEditorsSet[this.comparator];
  }

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
        newValue = Object.assign({},
          this.value, { datetime: newValue[0] }
        );
      }
    } else if (newValue instanceof Event) {
      newValue = value.target.value;
    }

    this.onValueChange(newValue);
  }

  @action
  textEditorInserted(inputElement) {
    if (this.mode === 'edit') {
      inputElement.focus();
      inputElement.select();
    }
  }

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

  @action
  includeTimeBtnInserted(btnElement) {
    this.includeTimeBtnElement = btnElement;
  }

  @action
  includeTimeBtnDestroyed() {
    this.includeTimeBtnElement = null;
  }

  @action
  flatpickrReady(selectedDates, dateStr, instance) {
    if (this.mode === 'edit') {
      instance.open();
    }
  }

  @action
  flatpickrClose(selectedDates) {
    if (this.mode === 'edit') {
      // Sending "valueChanged" notify, because flatpickr first sends onClose and then
      // onChange. onClose causes stop of edition, which then ignores incoming onChange.
      this.valueChanged(selectedDates);
      this.onStopEdit();
    }
  }

  @action
  keyDown(event) {
    if (event.keyCode === 27) {
      this.onCancelEdit();
    }
  }
}
