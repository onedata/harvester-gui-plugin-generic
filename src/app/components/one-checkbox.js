/**
 * A checkbox component with custom appearance.
 *
 * @module components/one-checkbox
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';

const possibleValues = [true, false, 'indeterminate'];

export default class OneCheckboxComponent extends Component {
  /**
   * @type {String}
   */
  get inputId() {
    return this.args.inputId || guidFor(this) + '-input';
  }

  /**
   * true, false or 'indeterminate'
   * @type {boolean|String}
   */
  get value() {
    return possibleValues.includes(this.args.value) ? this.args.value : false;
  }

  /**
   * @type {boolean}
   */
  get disabled() {
    return this.args.disabled || false;
  }

  /**
   * @type {Function}
   * @param {boolean} newValue
   */
  get onChange() {
    return this.args.onChange || (() => {});
  }

  /**
   * @type {String}
   */
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

  /**
   * @type {String}
   */
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
