import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

const possibleValues = [true, false, 'indeterminate'];

export default class OneCheckboxComponent extends Component {
  get inputId() {
    return this.args.inputId || guidFor(this) + '-input';
  }

  get value() {
    return possibleValues.includes(this.args.value) ? this.args.value : false;
  }

  get disabled() {
    return this.args.disabled || false;
  }

  get onChange() {
    return this.args.onChange || (() => {});
  }

  get valueClass() {
    switch (this.value) {
      case true:
        return 'checked';
      case false:
        return 'unchecked';
      case 'indeterminate':
        return 'indeterminate';
      default:
        return '';
    }
  }

  get valueIcon() {
    switch (this.value) {
      case true:
        return 'check';
      case 'indeterminate':
        return 'circle';
      default:
        return '';
    }
  }

  @action
  changed(event) {
    event.stopImmediatePropagation();
    this.onChange(this.value !== true);
  }

  @action
  clicked(event) {
    event.stopImmediatePropagation();
  }
}
