import { module, test } from 'qunit';
import { setupTest } from '../../helpers';
import sinon from 'sinon';
import AppProxy from 'harvester-gui-plugin-generic/services/app-proxy';

module('Unit | Service | app-proxy', (hooks) => {
  setupTest(hooks);

  hooks.beforeEach(function () {
    const appProxy = {
      dataRequest: () => {},
      dataCurlCommandRequest: () => {},
      configRequest: () => {},
      viewModeRequest: () => {},
      fileBrowserUrlRequest: () => {},
      spacesRequest: () => {},
    };
    const windowMock = {
      frameElement: {
        appProxy,
      },
    };
    sinon.stub(AppProxy.prototype, 'getWindow').returns(windowMock);
    this.setProperties({
      appProxy,
      windowMock,
    });
  });

  hooks.afterEach(function () {
    const fakeClock = this.fakeClock;
    if (fakeClock) {
      fakeClock.restore();
    }
    if (AppProxy.prototype.getWindow.restore) {
      AppProxy.prototype.getWindow.restore();
    }
  });

  test('loads parent application appProxy on init', function (assert) {
    const service = this.owner.lookup('service:app-proxy');
    assert.strictEqual(service.appProxy, this.appProxy);
  });

  [
    'dataRequest',
    'dataCurlCommandRequest',
    'configRequest',
    'viewModeRequest',
    'fileBrowserUrlRequest',
    'spacesRequest',
  ].forEach(injectedPropName => {
    test(
      `loads ${injectedPropName} from appProxy to the ${injectedPropName} field`,
      function (assert) {
        const service = this.owner.lookup('service:app-proxy');
        assert.strictEqual(service[injectedPropName], this.appProxy[injectedPropName]);
      }
    );
  });

  test(
    'tries to load appProxy continuously when it is not available on init',
    function (assert) {
      this.fakeClock = sinon.useFakeTimers();
      this.windowMock.frameElement = {};
      const promiseResolveSpy = sinon.spy();

      const service = this.owner.lookup('service:app-proxy');
      service.appProxyLoadingPromise.then(promiseResolveSpy);
      assert.strictEqual(service.appProxy, null);
      assert.ok(promiseResolveSpy.notCalled);

      this.fakeClock.tick(15);
      assert.strictEqual(service.appProxy, null);
      assert.ok(promiseResolveSpy.notCalled);

      this.windowMock.frameElement.appProxy = this.appProxy;
      this.fakeClock.tick(15);
      assert.strictEqual(service.appProxy, this.appProxy);
      assert.ok(promiseResolveSpy.calledOnce);
    }
  );
});
