import Service, { inject as service } from '@ember/service';

export default class ConfigurationService extends Service {
  @service appProxy;

  /**
   * @type {any}
   */
  configuration = null;

  /**
   * (Re)loads configuration object
   * @returns {Promise}
   */
  reloadConfiguration() {
    return this.get('appProxy').configRequest()
      .then(config => this.configuration = config)
      .catch(() => this.configuration = null);
  }
}
