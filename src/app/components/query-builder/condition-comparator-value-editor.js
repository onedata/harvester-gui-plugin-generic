import Component from '@glimmer/component';
import { guidFor } from '@ember/object/internals';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { action, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { defaultComparatorEditors } from 'harvester-gui-plugin-generic/utils/query-builder/condition-comparator-editors';

export default class QueryBuilderConditionComparatorValueEditorComponent
extends Component {
  @service spacesProvider;
  intlPrefix = 'components.query-builder.condition-comparator-value-editor';

  @tracked comparatorEditorsSet = defaultComparatorEditors;

  get mode() {
    return this.args.mode || 'view';
  }

  get comparator() {
    return this.args.comparator || '';
  }

  get value() {
    return this.args.value || null;
  }

  get onValueChange() {
    return this.args.onValueChange || (() => {});
  }

  get guid() {
    return guidFor(this);
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
}
