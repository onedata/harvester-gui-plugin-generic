/**
 * Detects element hover. Needs one positional parameter - a callback, which will be
 * called with boolean value indicating hover state.
 *
 * @module modifiers/on-hover
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Modifier from 'ember-modifier';
import { registerDestructor } from '@ember/destroyable';
import { action } from '@ember/object';

export default class AddDirectHoverClassModifier extends Modifier {
  areListenersInstalled = false;
  isHovered = false;
  elementRef = null;

  /**
   * @type {String}
   */
  get onChange() {
    return this.args.positional[0] || (() => {});
  }

  constructor() {
    super(...arguments);
    registerDestructor(this, (instance) => instance.cleanup());
  }

  /**
   * @override
   */
  modify(element) {
    if (!this.areListenersInstalled) {
      this.elementRef = element;
      element.addEventListener('mouseleave', this.onMouseLeave);
      element.addEventListener('mouseenter', this.onMouseEnter);
      this.areListenersInstalled = true;
    }
  }

  cleanup() {
    if (this.areListenersInstalled) {
      this.elementRef?.removeEventListener('mouseleave', this.onMouseLeave);
      this.elementRef?.removeEventListener('mouseenter', this.onMouseEnter);
      this.areListenersInstalled = false;
    }
  }

  @action
  onMouseLeave() {
    if (this.isHovered) {
      this.isHovered = false;
      this.onChange(false);
    }
  }

  @action
  onMouseEnter() {
    if (!this.isHovered) {
      this.isHovered = true;
      this.onChange(true);
    }
  }
}
