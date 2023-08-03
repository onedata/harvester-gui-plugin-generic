import { module, test } from 'qunit';
import { setupTest } from '../../helpers';
import sinon from 'sinon';

module('Unit | Service | configuration', hooks => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    const configRequestStub = sinon.stub().resolves('config');
    sinon.stub(this.owner.lookup('service:app-proxy'), 'configRequest')
      .get(() => configRequestStub);

    this.set('configRequestStub', configRequestStub);
  });

  test('has null configuration property on init', function (assert) {
    const service = this.owner.lookup('service:configuration');
    assert.notOk(service.configuration);
  });

  test('fills in configuration property after reloadConfiguration() call',
    function (assert) {
      const service = this.owner.lookup('service:configuration');

      return service.reloadConfiguration()
        .then(() => assert.strictEqual(service.configuration, 'config'));
    }
  );

  test(
    'sets configuration property to null after failure of reloadConfiguration() call',
    function (assert) {
      this.configRequestStub.rejects('error');
      const service = this.owner.lookup('service:configuration');

      // Set to sth non-null to check if reload failure will clear it out
      service.configuration = 'config';
      return service.reloadConfiguration()
        .then(() => assert.notOk(service.configuration));
    }
  );
});
