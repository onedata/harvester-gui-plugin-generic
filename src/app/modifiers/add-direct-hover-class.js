/**
 * Adds class (from `className` argument, default is `is-directly-hovered`) to the element,
 * when it is hovered directly. Hovering directly means that the element is hovered and
 * has no other elements inside, which are also hovered directly (have the `className` in
 * class list).
 *
 * @module modifiers/add-direct-hover-class
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import Modifier from 'ember-modifier';
import { action } from '@ember/object';

export default class AddDirectHoverClassModifier extends Modifier {
  /**
   * @type {String}
   */
  get className() {
    return this.args.named.className || 'is-directly-hovered';
  }

  /**
   * @override
   */
  didInstall() {
    this.element.addEventListener('mouseleave', this.onMouseLeave);
    this.element.addEventListener('mousemove', this.onMouseMove);
  }

  /**
   * @override
   */
  willRemove() {
    this.element.removeEventListener('mouseleave', this.onMouseLeave);
    this.element.removeEventListener('mousemove', this.onMouseMove);
  }

  @action
  onMouseLeave() {
    this.changeHoverState(false);
  }

  @action
  onMouseMove() {
    const containsHoveredElement =
      Boolean(this.element.querySelector(`.${this.className}`));
    this.changeHoverState(!containsHoveredElement);
  }

  /**
   * Changes hovered state and adds classes to the element.
   * @param {boolean} newState
   */
  changeHoverState(newState) {
    if (this.element.classList.contains(this.className) !== newState) {
      this.element.classList.toggle(this.className, newState);
    }
  }
}
