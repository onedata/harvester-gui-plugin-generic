/**
 * An extension of `t` intl helper. Adds support for getting intlPrefix from component
 * classes. Needs one additional positional argument at the beginning - a component instance
 * (usually `this` in component templates).
 *
 * @module helpers/tt
 * @author Michał Borzęcki
 * @copyright (C) 2020 ACK CYFRONET AGH
 * @license This software is released under the MIT license cited in 'LICENSE.txt'.
 */

import t from 'ember-intl/helpers/t';
import { htmlSafe } from '@ember/template';

export default t.extend({
  compute([component, key], options) {
    return htmlSafe(this._super(
      [component.intlPrefix + '.' + key],
      options
    ));
  },
});
