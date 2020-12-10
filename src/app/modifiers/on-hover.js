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
import { action } from '@ember/object';

export default class AddDirectHoverClassModifier extends Modifier {
  isHovered = false;

  /**
   * @type {String}
   */
  get onChange() {
    return this.args.positional[0] || (() => {});
  }

  /**
   * @override
   */
  didInstall() {
    this.element.addEventListener('mouseleave', this.onMouseLeave);
    this.element.addEventListener('mouseenter', this.onMouseEnter);
  }

  /**
   * @override
   */
  willRemove() {
    this.element.removeEventListener('mouseleave', this.onMouseLeave);
    this.element.removeEventListener('mouseenter', this.onMouseEnter);
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
