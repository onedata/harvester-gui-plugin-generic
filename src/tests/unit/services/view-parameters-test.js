import { module, test } from 'qunit';
import { setupTest } from '../../helpers';
import sinon from 'sinon';

module('Unit | Service | view-parameters', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    const viewModeRequestStub = sinon.stub().resolves('public');
    sinon.stub(this.owner.lookup('service:app-proxy'), 'viewModeRequest')
      .get(() => viewModeRequestStub);

    this.set('viewModeRequestStub', viewModeRequestStub);
  });

  test('has null viewMode property on init', function (assert) {
    const service = this.owner.lookup('service:view-parameters');
    assert.strictEqual(service.viewMode, null);
  });

  test('fills in configuration property after reloadViewMode() call', function (assert) {
    const service = this.owner.lookup('service:view-parameters');

    return service.reloadViewMode()
      .then(() => assert.strictEqual(service.viewMode, 'public'));
  });

  test('sets configuration property to null after failure of reloadViewMode() call',
    function (assert) {
      this.viewModeRequestStub.rejects('error');
      const service = this.owner.lookup('service:view-parameters');

      // Set to sth non-null to check if reload failure will clear it out
      service.viewMode = 'public';
      return service.reloadViewMode()
        .then(() => assert.strictEqual(service.viewMode, null));
    }
  );
});
