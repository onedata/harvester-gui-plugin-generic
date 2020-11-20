import IntlBase from 'ember-intl/services/intl';

export default class Intl extends IntlBase {
  tt(intlPrefixSource, key, ...args) {
    return this.t(intlPrefixSource.intlPrefix + '.' + key, ...args);
  }
}
