import t from 'ember-intl/helpers/t';

export default t.extend({
  compute([component, key], options) {
    return this._super(
      [component.intlPrefix + '.' + key],
      options,
    );
  },
});
