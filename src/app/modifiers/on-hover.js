/**
 * Detects element hover. Needs one positional parameter - a callback, which will be
 * called with boolean value indicating hover state.
 *
 * @module modifiers/on-hover
 * @author Michał Borzęcki
 * @copyright (C) 2020-2023 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import { modifier } from 'ember-modifier';

export default modifier((element, [onChange]) => {
  let isHovered = false;

  const onMouseEnter = () => {
    if (!isHovered) {
      isHovered = true;
      onChange?.(isHovered);
    }
  };
  const onMouseLeave = () => {
    if (isHovered) {
      isHovered = false;
      onChange?.(isHovered);
    }
  };

  element.addEventListener('mouseenter', onMouseEnter);
  element.addEventListener('mouseleave', onMouseLeave);

  return () => {
    element.removeEventListener('mouseenter', onMouseEnter);
    element.removeEventListener('mouseleave', onMouseLeave);
  };
});
