import t from 'ember-intl/helpers/t';
import { htmlSafe } from '@ember/template';

export default t.extend({
  compute([component, key], options) {
    return htmlSafe(this._super(
      [component.intlPrefix + '.' + key],
      options,
    ));
  },
});
