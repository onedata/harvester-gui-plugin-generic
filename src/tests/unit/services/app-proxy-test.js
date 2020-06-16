import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import AppProxy from 'harvester-gui-plugin-generic/services/app-proxy';

describe('Unit | Service | app-proxy', function () {
  setupTest();

  beforeEach(function () {
    const appProxy = {
      dataRequest: () => {},
      configRequest: () => {},
      fileBrowserUrlRequest: () => {},
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

  afterEach(function () {
    const fakeClock = this.fakeClock;
    if (fakeClock) {
      fakeClock.restore();
    }
    if (AppProxy.prototype.getWindow.restore) {
      AppProxy.prototype.getWindow.restore();
    }
  });

  it('returns window global object on getWindow() call', function () {
    const service = this.owner.lookup('service:app-proxy');
    service.getWindow.restore();

    expect(service.getWindow()).to.equal(window);
  });

  it('loads parent application appProxy on init', function () {
    const service = this.owner.lookup('service:app-proxy');
    expect(service.appProxy).to.equal(this.get('appProxy'));
  });

  [
    'dataRequest',
    'configRequest',
    'fileBrowserUrlRequest',
  ].forEach(injectedPropName => {
    it(
      `loads ${injectedPropName} from appProxy to the ${injectedPropName} field`,
      function () {
        const service = this.owner.lookup('service:app-proxy');
        expect(service[injectedPropName])
          .to.equal(this.get(`appProxy.${injectedPropName}`));
      }
    );
  });

  it(
    'tries to load appProxy continuously when it is not available on init',
    function () {
      this.fakeClock = sinon.useFakeTimers();
      const {
        windowMock,
        appProxy,
      } = this.getProperties('windowMock', 'appProxy');
      windowMock.frameElement = {};
      const promiseResolveSpy = sinon.spy();

      const service = this.owner.lookup('service:app-proxy');
      service.appProxyLoadingPromise.then(promiseResolveSpy);
      expect(service.appProxy).to.be.null;
      expect(promiseResolveSpy).to.be.not.called;

      this.fakeClock.tick(15);
      expect(service.appProxy).to.be.null;
      expect(promiseResolveSpy).to.be.not.called;

      windowMock.frameElement.appProxy = appProxy;
      this.fakeClock.tick(15);
      expect(service.appProxy).to.equal(appProxy);
      expect(promiseResolveSpy).to.be.calledOnce;
    }
  );
});
