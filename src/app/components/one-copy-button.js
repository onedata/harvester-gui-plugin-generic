/**
 * Allows to copy a specified string to the clipboard. Can be rendered as button, input
 * or textarea.
 *
 * @module components/one-checkbox
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { later, cancel } from '@ember/runloop';

/**
 * @argument {String} value Value to copy
 * @argument {String} [mode] One of: button, input, textarea
 * @argument {String} [hoverTip] Tip visible on hover
 * @argument {String} [copiedTip] Tip visible when value has been copied
 * @argument {String} [buttonClasses] Classes for copy button
 */
export default class ClipboardLineComponent extends Component {
  @service intl;

  /**
   * @type {String}
   */
  intlPrefix = 'components.one-copy-button';

  /**
   * @type {any}
   */
  copiedNotificationTimer = null;

  /**
   * @type {boolean}
   */
  @tracked isCopiedNotificationVisible = false;

  /**
   * @type {String}
   */
  get value() {
    return this.args.value || '';
  }

  /**
   * @type {String}
   */
  get mode() {
    return this.args.mode || 'input';
  }

  /**
   * Tip visible on hover
   * @type {String}
   */
  get hoverTip() {
    return this.args.hoverTip || this.intl.tt(this, 'defaultHoverTip');
  }

  /**
   * Tip visible when value has been copied
   * @type {String}
   */
  get copiedTip() {
    return this.args.copiedTip || this.intl.tt(this, 'defaultCopiedTip');
  }

  /**
   * @type {String}
   */
  get buttonClasses() {
    return this.args.buttonClasses || '';
  }

  /**
   * Id for input/textarea element
   * @type {String}
   */
  get inputId() {
    return guidFor(this) + '-input';
  }

  willDestroy() {
    super.willDestroy(...arguments);
    cancel(this.copiedNotificationTimer);
  }

  @action
  copySuccess() {
    cancel(this.copiedNotificationTimer);

    this.isCopiedNotificationVisible = true;
    this.copiedNotificationTimer = later(
      this,
      () => this.isCopiedNotificationVisible = false,
      2000
    );
  }
}
