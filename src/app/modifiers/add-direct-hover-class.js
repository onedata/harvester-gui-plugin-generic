/**
 * Adds class (from `className` argument, default is `is-directly-hovered`) to the element,
 * when it is hovered directly. Hovering directly means that the element is hovered and
 * has no other elements inside, which are also hovered directly (have the `className` in
 * class list).
 *
 * @module modifiers/add-direct-hover-class
 * @author Michał Borzęcki
 * @copyright (C) 2020-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { modifier } from 'ember-modifier';

export default modifier((element, positional, { className }) => {
  const effectiveClassName = className || 'is-directly-hovered';

  const changeHoverState = (newState) => {
    if (element.classList.contains(effectiveClassName) !== newState) {
      element.classList.toggle(effectiveClassName, newState);
    }
  };
  const onMouseMove = () => {
    const containsHoveredElement =
      Boolean(element.querySelector(`.${effectiveClassName}`));
    changeHoverState(!containsHoveredElement);
  };
  const onMouseLeave = () => {
    changeHoverState(false);
  };

  element.addEventListener('mousemove', onMouseMove);
  element.addEventListener('mouseleave', onMouseLeave);

  return () => {
    element.removeEventListener('mousemove', onMouseMove);
    element.removeEventListener('mouseleave', onMouseLeave);
    changeHoverState(false);
  };
});
