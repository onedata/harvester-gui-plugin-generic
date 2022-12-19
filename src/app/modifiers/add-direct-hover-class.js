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
import { registerDestructor } from '@ember/destroyable';
import { action } from '@ember/object';

export default class AddDirectHoverClassModifier extends Modifier {
  areListenersInstalled = false;
  elementRef = null;

  /**
   * @type {String}
   */
  get className() {
    return this.args.named.className || 'is-directly-hovered';
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
      element.addEventListener('mousemove', this.onMouseMove);
      this.areListenersInstalled = true;
    }
  }

  cleanup() {
    if (this.areListenersInstalled) {
      this.elementRef?.removeEventListener('mouseleave', this.onMouseLeave);
      this.elementRef?.removeEventListener('mousemove', this.onMouseMove);
      this.areListenersInstalled = false;
    }
  }

  @action
  onMouseLeave() {
    this.changeHoverState(false);
  }

  @action
  onMouseMove() {
    const containsHoveredElement =
      Boolean(this.elementRef.querySelector(`.${this.className}`));
    this.changeHoverState(!containsHoveredElement);
  }

  /**
   * Changes hovered state and adds classes to the element.
   * @param {boolean} newState
   */
  changeHoverState(newState) {
    if (this.elementRef.classList.contains(this.className) !== newState) {
      this.elementRef.classList.toggle(this.className, newState);
    }
  }
}
